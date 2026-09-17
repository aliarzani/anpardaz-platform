BEGIN;

INSERT INTO ai_providers(name,provider_type,base_url,enabled,priority,model_policy,secret_ref) VALUES
('openai','openai','https://api.openai.com/v1',TRUE,10,'{"default_model":"gpt-5.6-luna","env_key":"OPENAI_API_KEY"}'::jsonb,'OPENAI_API_KEY'),
('gemini','gemini','https://generativelanguage.googleapis.com',TRUE,20,'{"default_model":"gemini-2.5-flash","env_key":"GEMINI_API_KEY"}'::jsonb,'GEMINI_API_KEY'),
('anthropic','anthropic','https://api.anthropic.com',FALSE,30,'{"default_model":"claude-sonnet","env_key":"ANTHROPIC_API_KEY"}'::jsonb,'ANTHROPIC_API_KEY')
ON CONFLICT(name) DO UPDATE SET base_url=EXCLUDED.base_url,model_policy=EXCLUDED.model_policy,secret_ref=EXCLUDED.secret_ref;

INSERT INTO ai_workflows(code,description,enabled,require_human_review,provider_policy) VALUES
('news.rewrite','Rewrite and SEO-enrich incoming financial/crypto news',TRUE,TRUE,'{"providers":["openai","gemini"],"max_retries":2}'::jsonb),
('content.seo','Generate title, summary, meta description, keywords, tags and slug',TRUE,TRUE,'{"providers":["openai","gemini"]}'::jsonb),
('banner.assist','Assist users with classified-ad drafting and moderation',TRUE,TRUE,'{"providers":["openai","gemini"]}'::jsonb),
('market.assist','Assist with product descriptions, attributes and categorization',TRUE,TRUE,'{"providers":["openai","gemini"]}'::jsonb),
('hoosh.chat','General An Hoosh conversational workflow',TRUE,FALSE,'{"providers":["openai","gemini"]}'::jsonb),
('moderation.classify','Classify community content for safety/moderation review',TRUE,TRUE,'{"providers":["openai","gemini"]}'::jsonb)
ON CONFLICT(code) DO UPDATE SET provider_policy=EXCLUDED.provider_policy;

INSERT INTO ai_prompt_versions(workflow_id,version,system_prompt,user_template)
SELECT id,1,'You are the An Pardaz content assistant. Return only valid JSON. Do not invent facts. Preserve source meaning and clearly mark uncertainty.','Create the requested structured output from this input:\n{{input}}'
FROM ai_workflows
WHERE code IN ('news.rewrite','content.seo','banner.assist','market.assist','hoosh.chat','moderation.classify')
ON CONFLICT(workflow_id,version) DO NOTHING;

INSERT INTO schema_migrations(version) VALUES('018_ai_defaults') ON CONFLICT(version) DO NOTHING;
COMMIT;
