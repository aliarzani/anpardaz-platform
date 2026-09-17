import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { Pool } from 'pg';
import { ensurePlatformUser, requireAuth } from '../auth.js';

type RequestWithAuth = FastifyRequest & { auth: { sub: string; email: string; role: string } };
const isAdmin = (request: RequestWithAuth) => ['admin', 'super_admin', 'operator'].includes(request.auth.role);
const deny = (reply: { code: (n: number) => { send: (v: unknown) => unknown } }) => reply.code(403).send({ error: 'admin_required' });

export function registerAdminRoutes(app: FastifyInstance, pool: Pool) {
  app.get('/api/v1/admin/overview', { preHandler: requireAuth }, async (request, reply) => {
    const req = request as RequestWithAuth;
    if (!isAdmin(req)) return deny(reply);
    const [users, tickets, news, listings, orders] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM platform_users'),
      pool.query("SELECT COUNT(*)::int AS count FROM support_tickets WHERE status NOT IN ('resolved','closed')"),
      pool.query("SELECT COUNT(*)::int AS count FROM news_articles WHERE status='published'"),
      pool.query("SELECT COUNT(*)::int AS count FROM banner_listings WHERE status='published'"),
      pool.query("SELECT COUNT(*)::int AS count FROM market_products WHERE status='published'"),
    ]);
    return { users: users.rows[0].count, openTickets: tickets.rows[0].count, publishedNews: news.rows[0].count, publishedBanner: listings.rows[0].count, publishedMarketProducts: orders.rows[0].count };
  });

  app.get('/api/v1/admin/users/:identityId', { preHandler: requireAuth }, async (request, reply) => {
    const req = request as RequestWithAuth;
    if (!isAdmin(req)) return deny(reply);
    const identityId = (request.params as { identityId: string }).identityId;
    const r = await pool.query('SELECT id,identity_id,email,display_name,role,status,created_at,updated_at FROM platform_users WHERE identity_id=$1',[identityId]);
    if (!r.rows[0]) return reply.code(404).send({ error: 'user_not_found' });
    const [tickets, activity, audit] = await Promise.all([
      pool.query('SELECT id,subject,category,priority,status,assigned_to,external_reference,created_at,updated_at FROM support_tickets WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 100',[r.rows[0].id]),
      pool.query('SELECT service,event_type,resource_type,resource_id,request_id,metadata,occurred_at FROM user_activity_events WHERE identity_id=$1 ORDER BY occurred_at DESC LIMIT 200',[identityId]),
      pool.query('SELECT actor_type,actor_identity_id,action,resource_type,resource_id,reason,metadata,created_at FROM audit_logs WHERE identity_id=$1 OR actor_identity_id=$1 ORDER BY created_at DESC LIMIT 200',[identityId]),
    ]);
    return { user:r.rows[0], tickets:tickets.rows, activity:activity.rows, audit:audit.rows };
  });

  app.get('/api/v1/admin/news', { preHandler: requireAuth }, async (request, reply) => {
    const req = request as RequestWithAuth; if (!isAdmin(req)) return deny(reply);
    const r = await pool.query('SELECT id,title,slug,status,published_at,created_at,updated_at FROM news_articles ORDER BY created_at DESC LIMIT 200');
    return { articles:r.rows };
  });

  app.patch('/api/v1/admin/news/:id/status', { preHandler: requireAuth }, async (request, reply) => {
    const req = request as RequestWithAuth; if (!isAdmin(req)) return deny(reply);
    const body = (request.body ?? {}) as { status?: string };
    if (!['draft','published','archived'].includes(body.status ?? '')) return reply.code(400).send({ error:'invalid_status' });
    const adminId = await ensurePlatformUser(pool, req.auth);
    const id = (request.params as { id:string }).id;
    const r = await pool.query("UPDATE news_articles SET status=$1,published_at=CASE WHEN $1='published' THEN COALESCE(published_at,NOW()) ELSE published_at END,updated_at=NOW() WHERE id=$2 RETURNING id,title,slug,status,published_at,updated_at",[body.status,id]);
    if (!r.rows[0]) return reply.code(404).send({error:'news_not_found'});
    await pool.query('INSERT INTO audit_logs(identity_id,actor_type,actor_identity_id,action,resource_type,resource_id,reason,metadata) VALUES($1,\'admin\',$1,$2,\'news_article\',$3,$4,$5)',[req.auth.sub,'news_status_change',id,'Admin content moderation',{status:body.status,adminId}]);
    return { article:r.rows[0] };
  });

  app.delete('/api/v1/admin/news/:id', { preHandler: requireAuth }, async (request, reply) => {
    const req = request as RequestWithAuth; if (!['admin','super_admin'].includes(req.auth.role)) return deny(reply);
    const adminId = await ensurePlatformUser(pool, req.auth);
    const id = (request.params as { id:string }).id;
    const r = await pool.query('DELETE FROM news_articles WHERE id=$1 RETURNING id,title,slug',[id]);
    if (!r.rows[0]) return reply.code(404).send({error:'news_not_found'});
    await pool.query('INSERT INTO audit_logs(identity_id,actor_type,actor_identity_id,action,resource_type,resource_id,reason,metadata) VALUES($1,\'admin\',$1,\'delete\',\'news_article\',$2,\'Admin permanently deleted article\',$3)',[req.auth.sub,id,{adminId,title:r.rows[0].title}]);
    return { deleted:true, article:r.rows[0] };
  });

  app.get('/api/v1/admin/maintenance', { preHandler: requireAuth }, async (request, reply) => {
    const req = request as RequestWithAuth; if (!isAdmin(req)) return deny(reply);
    const r = await pool.query('SELECT * FROM maintenance_announcements ORDER BY created_at DESC LIMIT 50');
    return { announcements:r.rows };
  });

  app.post('/api/v1/admin/maintenance', { preHandler: requireAuth }, async (request, reply) => {
    const req = request as RequestWithAuth; if (!isAdmin(req)) return deny(reply);
    const b = (request.body ?? {}) as { title?:string;message?:string;severity?:string;endsAt?:string|null;showOnWeb?:boolean;showOnMobile?:boolean;dismissible?:boolean };
    if (!b.title?.trim() || !b.message?.trim()) return reply.code(400).send({error:'title_and_message_required'});
    if (!['info','warning','critical'].includes(b.severity ?? 'info')) return reply.code(400).send({error:'invalid_severity'});
    const adminId = await ensurePlatformUser(pool, req.auth);
    await pool.query('UPDATE maintenance_announcements SET is_active=FALSE,updated_at=NOW() WHERE is_active=TRUE');
    const r = await pool.query('INSERT INTO maintenance_announcements(title,message,severity,ends_at,show_on_web,show_on_mobile,dismissible,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[b.title.trim(),b.message.trim(),b.severity??'info',b.endsAt??null,b.showOnWeb!==false,b.showOnMobile!==false,b.dismissible===true,adminId]);
    await pool.query('INSERT INTO audit_logs(identity_id,actor_type,actor_identity_id,action,resource_type,resource_id,reason,metadata) VALUES($1,\'admin\',$1,\'publish_maintenance\',\'maintenance_announcement\',$2,\'Global maintenance/announcement published\',$3)',[req.auth.sub,r.rows[0].id,{adminId}]);
    return reply.code(201).send({ announcement:r.rows[0] });
  });

  app.delete('/api/v1/admin/maintenance/:id', { preHandler: requireAuth }, async (request, reply) => {
    const req = request as RequestWithAuth; if (!isAdmin(req)) return deny(reply);
    const id = (request.params as { id:string }).id;
    const r = await pool.query('UPDATE maintenance_announcements SET is_active=FALSE,updated_at=NOW() WHERE id=$1 RETURNING id',[id]);
    if (!r.rows[0]) return reply.code(404).send({error:'announcement_not_found'});
    await pool.query('INSERT INTO audit_logs(identity_id,actor_type,actor_identity_id,action,resource_type,resource_id,reason) VALUES($1,\'admin\',$1,\'disable\',\'maintenance_announcement\',$2,\'Admin disabled announcement\')',[req.auth.sub,id]);
    return { disabled:true };
  });

  app.get('/api/v1/maintenance', async () => {
    const r = await pool.query("SELECT id,title,message,severity,starts_at,ends_at,show_on_web,show_on_mobile,dismissible FROM maintenance_announcements WHERE is_active=TRUE AND starts_at<=NOW() AND (ends_at IS NULL OR ends_at>NOW()) ORDER BY created_at DESC LIMIT 1");
    return { announcement:r.rows[0] ?? null };
  });
}
