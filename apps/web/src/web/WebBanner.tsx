// ─────────────────────────────────────────────────
// An Pardaz Web Portal — An Banner (Classifieds)
// Full v327 feature parity: browse, detail, post, messages, favorites, account, tickets
// ─────────────────────────────────────────────────
import { useState, useMemo } from "react";
import WI from "./WebIcons";
import { BANNER_ADS, BANNER_CATEGORIES } from "./mockData";
import type { WebPage, BannerAd } from "./types";

const FA = (s: string | number) => String(s).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const fmtPrice = (n?: number) => n ? `${FA(Math.round(n / 1_000_000).toLocaleString())} میلیون` : "توافقی";

const CITIES = ["همه شهرها","تهران","اصفهان","شیراز","مشهد","تبریز","اهواز","کرج","قم","کرمانشاه","زاهدان","رشت"];
const PROVINCES = ["تهران","اصفهان","فارس","خراسان رضوی","آذربایجان شرقی","خوزستان","البرز"];

type BSection = "home"|"favorites"|"messages"|"account"|"my-listings"|"notifications"|"tickets"|"post";

interface Props { onNavigate: (p: WebPage) => void; isLoggedIn: boolean; onAuthRequired: () => void; }

export default function WebBanner({ onNavigate, isLoggedIn, onAuthRequired }: Props) {
  const [city, setCity]     = useState("همه شهرها");
  const [cat, setCat]       = useState("all");
  const [search, setSearch] = useState("");
  const [section, setSection] = useState<BSection>("home");
  const [selected, setSelected] = useState<BannerAd | null>(null);
  const [favs, setFavs] = useState<Set<string>>(new Set(["ad1","ad3","ad7"]));

  const filtered = useMemo(() => BANNER_ADS.filter(a =>
    (city === "همه شهرها" || a.city === city) &&
    (cat === "all" || a.category === BANNER_CATEGORIES.find(c=>c.id===cat)?.nameFa) &&
    (search === "" || a.title.includes(search) || a.description.includes(search))
  ), [city, cat, search]);

  const navItems = [
    { id:"home" as BSection,          icon:"home",      label:"خانه" },
    { id:"favorites" as BSection,     icon:"heart",     label:"علاقه‌مندی‌ها" },
    { id:"messages" as BSection,      icon:"comment",   label:"پیام‌ها" },
    { id:"notifications" as BSection, icon:"bell",      label:"اعلان‌ها" },
    { id:"my-listings" as BSection,   icon:"package",   label:"آگهی‌های من" },
    { id:"account" as BSection,       icon:"user",      label:"حساب کاربری" },
    { id:"tickets" as BSection,       icon:"document",  label:"پشتیبانی" },
  ];

  const handleSection = (s: BSection) => {
    if (s !== "home" && !isLoggedIn) { onAuthRequired(); return; }
    setSection(s);
    setSelected(null);
  };

  const isProtected = section !== "home";

  return (
    <div className="w-fade" dir="rtl" style={{ minHeight:"calc(100vh - var(--w-header))", display:"flex", flexDirection:"column" }}>
      {/* Platform header */}
      <div style={{ background:"var(--w-surface)", borderBottom:"1px solid var(--w-border)" }}>
        <div style={{ maxWidth:1480, margin:"0 auto", padding:"0 20px", display:"flex", alignItems:"center", gap:14, height:52 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:"rgba(232,53,78,0.12)", border:"1px solid rgba(232,53,78,0.22)", display:"flex", alignItems:"center", justifyContent:"center", color:"#e8354e" }}><WI n="banner" s={15}/></div>
            <span style={{ fontSize:15, fontWeight:900 }}>آن بنر</span>
          </div>
          <div style={{ width:1, height:18, background:"var(--w-border)" }}/>
          <div style={{ flex:1, position:"relative", maxWidth:440 }}>
            <WI n="search" s={14} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"var(--w-muted)", pointerEvents:"none" }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="جستجو در آگهی‌ها..." className="w-input" style={{ paddingRight:38 }} onFocus={()=>setSection("home")}/>
          </div>
          <select value={city} onChange={e=>setCity(e.target.value)} className="w-input" style={{ width:"auto", paddingLeft:12, cursor:"pointer" }}>
            {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={()=>handleSection("post")} className="w-btn w-btn-primary" style={{ background:"#e8354e", padding:"7px 18px", fontSize:12 }}>
            <WI n="plus" s={14}/> ثبت آگهی
          </button>
          <button onClick={()=>onNavigate("home")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--w-muted)", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
            <WI n="arrow-right" s={13}/> آن پرداز
          </button>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", maxWidth:1480, margin:"0 auto", width:"100%", padding:"0 20px" }}>
        {/* Sidebar nav */}
        <aside style={{ width:190, flexShrink:0, borderLeft:"1px solid var(--w-border)", paddingTop:12, position:"sticky", top:"calc(var(--w-header) + 52px)", height:"calc(100vh - var(--w-header) - 52px)", overflowY:"auto", background:"var(--w-surface)" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={()=>handleSection(item.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:section===item.id?"rgba(232,53,78,0.1)":"transparent", border:"none", cursor:"pointer", color:section===item.id?"#e8354e":"var(--w-muted)", fontSize:13, fontWeight:section===item.id?700:500, borderRight:section===item.id?"2px solid #e8354e":"2px solid transparent", fontFamily:"Vazirmatn", textAlign:"right", transition:"all 0.12s" }}>
              <WI n={item.icon} s={15}/>{item.label}
              {item.id === "messages" && <span style={{ marginRight:"auto", fontSize:10, background:"#e8354e", color:"#fff", borderRadius:10, padding:"1px 6px", fontWeight:700 }}>۳</span>}
              {item.id === "notifications" && <span style={{ marginRight:"auto", fontSize:10, background:"#d97706", color:"#fff", borderRadius:10, padding:"1px 6px", fontWeight:700 }}>۵</span>}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <div style={{ flex:1, overflow:"hidden", minWidth:0, padding:"16px 0" }}>
          {selected && section === "home" && (
            <AdDetail ad={selected} onBack={()=>setSelected(null)} isLoggedIn={isLoggedIn} onAuthRequired={onAuthRequired} isFav={favs.has(selected.id)} onToggleFav={()=>setFavs(p=>{const s=new Set(p);s.has(selected.id)?s.delete(selected.id):s.add(selected.id);return s;})}/>
          )}

          {!selected && section === "home" && (
            <HomeSection cat={cat} setCat={setCat} filtered={filtered} onSelect={a=>{setSelected(a);}} favs={favs} onToggleFav={id=>setFavs(p=>{const s=new Set(p);s.has(id)?s.delete(id):s.add(id);return s;})}/>
          )}

          {section === "favorites" && (
            <FavoritesSection favs={favs} onSelect={a=>{setSelected(a);setSection("home");}} onToggleFav={id=>setFavs(p=>{const s=new Set(p);s.has(id)?s.delete(id):s.add(id);return s;})}/>
          )}

          {section === "messages" && <MessagesSection/>}
          {section === "notifications" && <NotificationsSection/>}
          {section === "my-listings" && <MyListingsSection/>}
          {section === "account" && <AccountSection/>}
          {section === "tickets" && <TicketsSection/>}
          {section === "post" && <PostAd onBack={()=>setSection("home")} isLoggedIn={isLoggedIn} onAuthRequired={onAuthRequired}/>}
        </div>
      </div>
    </div>
  );
}

// ── Home Section ───────────────────────────────────
function HomeSection({ cat, setCat, filtered, onSelect, favs, onToggleFav }: {
  cat:string; setCat:(c:string)=>void; filtered:BannerAd[];
  onSelect:(a:BannerAd)=>void; favs:Set<string>; onToggleFav:(id:string)=>void;
}) {
  return (
    <div>
      {/* Category chips */}
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:12, marginBottom:16, scrollbarWidth:"none" }}>
        <button onClick={()=>setCat("all")} style={{ flexShrink:0, padding:"7px 16px", borderRadius:20, border:`1.5px solid ${cat==="all"?"rgba(232,53,78,0.5)":"var(--w-border)"}`, background:cat==="all"?"rgba(232,53,78,0.08)":"transparent", color:cat==="all"?"#e8354e":"var(--w-muted)", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"Vazirmatn" }}>
          همه آگهی‌ها
        </button>
        {BANNER_CATEGORIES.map(c => (
          <button key={c.id} onClick={()=>setCat(c.id)} style={{ flexShrink:0, display:"flex", alignItems:"center", gap:5, padding:"7px 16px", borderRadius:20, border:`1.5px solid ${cat===c.id?"rgba(232,53,78,0.5)":"var(--w-border)"}`, background:cat===c.id?"rgba(232,53,78,0.08)":"transparent", color:cat===c.id?"#e8354e":"var(--w-muted)", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"Vazirmatn" }}>
            <WI n={c.icon as string} s={13}/>{c.nameFa}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ fontSize:13, color:"var(--w-muted)" }}>{FA(filtered.length)} آگهی</div>
        <select className="w-input" style={{ width:"auto", fontSize:12, padding:"6px 12px" }}>
          {["جدیدترین","ارزان‌ترین","گران‌ترین","پربازدیدترین"].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
        {filtered.map(ad => (
          <div key={ad.id} className="w-card" style={{ cursor:"pointer", overflow:"hidden", transition:"all 0.15s", position:"relative" }}>
            <button onClick={e=>{e.stopPropagation();onToggleFav(ad.id);}} style={{ position:"absolute", top:10, left:10, zIndex:2, background:"rgba(255,255,255,0.85)", backdropFilter:"blur(4px)", border:"none", borderRadius:"50%", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:favs.has(ad.id)?"#e8354e":"var(--w-muted)" }}>
              <WI n="heart" s={14}/>
            </button>
            <div onClick={()=>onSelect(ad)} style={{ height:180, background:`linear-gradient(135deg,rgba(232,53,78,0.08),rgba(244,63,94,0.03))`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}
              onMouseEnter={e=>{(e.currentTarget.parentElement as HTMLDivElement).style.transform="translateY(-2px)";(e.currentTarget.parentElement as HTMLDivElement).style.boxShadow="var(--w-shadow-md)";}}
              onMouseLeave={e=>{(e.currentTarget.parentElement as HTMLDivElement).style.transform="none";(e.currentTarget.parentElement as HTMLDivElement).style.boxShadow="var(--w-shadow)";}}
            >
              <WI n={BANNER_CATEGORIES.find(c=>c.nameFa===ad.category)?.icon ?? "package"} s={44} style={{ color:"rgba(232,53,78,0.18)" }}/>
              <span style={{ position:"absolute", top:10, right:10, background:"rgba(232,53,78,0.1)", color:"#e8354e", border:"1px solid rgba(232,53,78,0.25)", padding:"2px 8px", borderRadius:5, fontSize:10, fontWeight:700 }}>{ad.category}</span>
            </div>
            <div onClick={()=>onSelect(ad)} style={{ padding:"14px" }}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ad.title}</div>
              <div style={{ fontSize:12, color:"var(--w-muted)", marginBottom:10, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ad.description}</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ fontSize:15, fontWeight:900 }}>{fmtPrice(ad.price)}{ad.isNegotiable && <span style={{ fontSize:10, color:"var(--w-muted)", fontWeight:400, marginRight:4 }}>قابل مذاکره</span>}</div>
                <div style={{ fontSize:11, color:"var(--w-muted)", display:"flex", alignItems:"center", gap:3 }}><WI n="map-pin" s={11}/>{ad.city}</div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:11, color:"var(--w-muted)" }}>
                <span><WI n="eye" s={11}/> {FA(ad.views)}</span>
                <span>{ad.postedAt}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px", color:"var(--w-muted)" }}>
            <WI n="search" s={40} style={{ marginBottom:12, opacity:0.3 }}/>
            <div style={{ fontSize:15, fontWeight:700 }}>آگهی‌ای یافت نشد</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Ad Detail ─────────────────────────────────────
function AdDetail({ ad, onBack, isLoggedIn, onAuthRequired, isFav, onToggleFav }: { ad:BannerAd; onBack:()=>void; isLoggedIn:boolean; onAuthRequired:()=>void; isFav:boolean; onToggleFav:()=>void }) {
  const [activeImg, setActiveImg] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  return (
    <div className="w-fade">
      <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:"var(--w-muted)", fontSize:13, marginBottom:20 }}>
        <WI n="arrow-right" s={14}/> بازگشت به آگهی‌ها
      </button>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:28, alignItems:"start" }}>
        <div>
          <div style={{ height:340, background:"linear-gradient(135deg,rgba(232,53,78,0.08),rgba(244,63,94,0.03))", border:"1px solid var(--w-border)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, overflow:"hidden" }}>
            <WI n="image" s={80} style={{ color:"rgba(232,53,78,0.12)" }}/>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:24 }}>
            {Array.from({length:4},(_,i)=>(
              <div key={i} onClick={()=>setActiveImg(i)} style={{ width:80, height:64, background:activeImg===i?"rgba(232,53,78,0.1)":"var(--w-card2)", border:`1.5px solid ${activeImg===i?"rgba(232,53,78,0.4)":"var(--w-border)"}`, borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.12s" }}>
                <WI n="image" s={20} style={{ opacity:0.3 }}/>
              </div>
            ))}
          </div>
          <div className="w-card" style={{ padding:"20px", marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>توضیحات آگهی</div>
            <div style={{ fontSize:13, color:"var(--w-muted)", lineHeight:2 }}>{ad.description} این آگهی از نظر کیفی بررسی شده است. جهت اطلاعات بیشتر با آگهی‌دهنده تماس بگیرید.</div>
          </div>
          <div className="w-card" style={{ padding:"20px" }}>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>ویژگی‌های آگهی</div>
            {[["وضعیت","در حد نو"],["سن","۲ سال"],["رنگ","مشکی"],["گارانتی","ندارد"]].map(([k,v])=>(
              <div key={k as string} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--w-border)", fontSize:13 }}>
                <span style={{ color:"var(--w-muted)" }}>{k}</span><span style={{ fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14, position:"sticky", top:"calc(var(--w-header) + 72px)" }}>
          <div className="w-card" style={{ padding:"20px" }}>
            <span style={{ fontSize:11, color:"#e8354e", background:"rgba(232,53,78,0.1)", padding:"3px 10px", borderRadius:20, display:"inline-block", marginBottom:10 }}>{ad.category}</span>
            <h1 style={{ fontSize:20, fontWeight:900, marginBottom:10, lineHeight:1.35 }}>{ad.title}</h1>
            <div style={{ fontSize:26, fontWeight:900, marginBottom:6 }}>{fmtPrice(ad.price)}</div>
            {ad.isNegotiable && <div style={{ fontSize:12, color:"var(--w-muted)", marginBottom:10 }}>قیمت قابل مذاکره است</div>}
            <div style={{ height:1, background:"var(--w-border)", margin:"10px 0" }}/>
            {[["map-pin",`${ad.city}${ad.district?` — ${ad.district}`:""}`],["calendar",ad.postedAt],["eye",`${FA(ad.views)} بازدید`]].map(([icon,text])=>(
              <div key={text as string} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--w-muted)", marginBottom:6 }}>
                <WI n={icon as string} s={13}/> {text}
              </div>
            ))}
            <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:8 }}>
              {isLoggedIn ? (
                <>
                  {showPhone ? (
                    <div style={{ padding:"12px", background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:9, textAlign:"center", fontSize:16, fontWeight:900, color:"#10b981" }}>
                      ۰۹۱۲ *** ۴۵۶۷
                    </div>
                  ) : (
                    <button onClick={()=>setShowPhone(true)} className="w-btn w-btn-primary" style={{ padding:"12px", background:"#e8354e" }}>
                      <WI n="phone" s={16}/> نمایش شماره تماس
                    </button>
                  )}
                  <button className="w-btn w-btn-ghost" style={{ padding:"10px" }}>
                    <WI n="comment" s={15}/> ارسال پیام
                  </button>
                </>
              ) : (
                <button onClick={onAuthRequired} className="w-btn w-btn-primary" style={{ padding:"12px", background:"#e8354e" }}>
                  <WI n="lock" s={16}/> ورود برای تماس
                </button>
              )}
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={onToggleFav} className="w-btn w-btn-ghost" style={{ flex:1, padding:"9px", color:isFav?"#e8354e":"var(--w-muted)" }}>
                  <WI n="heart" s={14}/> {isFav?"حذف از علاقه‌مندی":"ذخیره"}
                </button>
                <button className="w-btn w-btn-ghost" style={{ flex:1, padding:"9px" }}>
                  <WI n="share" s={14}/> اشتراک
                </button>
              </div>
              <button style={{ background:"none", border:"none", cursor:"pointer", color:"var(--w-muted)", fontSize:11, fontWeight:600 }}>گزارش آگهی</button>
            </div>
          </div>
          <div className="w-card" style={{ padding:"16px" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--w-muted)", marginBottom:10 }}>آگهی‌دهنده</div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:42, height:42, borderRadius:"50%", background:"rgba(232,53,78,0.1)", display:"flex", alignItems:"center", justifyContent:"center", color:"#e8354e" }}>
                <WI n="user" s={20}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700 }}>{ad.seller.nameFa}</div>
                <div style={{ fontSize:11, color:"var(--w-muted)" }}>عضو از {ad.seller.joinedAt}</div>
                <div style={{ fontSize:11, color:"var(--w-muted)", marginTop:2 }}>{FA(Math.floor(Math.random()*50+5))} آگهی فعال</div>
              </div>
              {ad.seller.isVerified && <WI n="shield" s={16} style={{ color:"#059669" }}/>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Favorites Section ──────────────────────────────
function FavoritesSection({ favs, onSelect, onToggleFav }: { favs:Set<string>; onSelect:(a:BannerAd)=>void; onToggleFav:(id:string)=>void }) {
  const favAds = BANNER_ADS.filter(a => favs.has(a.id));
  return (
    <div>
      <div style={{ fontSize:18, fontWeight:900, marginBottom:20 }}>علاقه‌مندی‌ها ({FA(favAds.length)})</div>
      {favAds.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px", color:"var(--w-muted)" }}>
          <WI n="heart" s={40} style={{ opacity:0.2, marginBottom:12 }}/>
          <div style={{ fontSize:14, fontWeight:700 }}>هنوز آگهی‌ای ذخیره نکرده‌اید</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
          {favAds.map(ad => (
            <div key={ad.id} className="w-card" style={{ overflow:"hidden", cursor:"pointer" }} onClick={()=>onSelect(ad)}>
              <div style={{ height:150, background:"linear-gradient(135deg,rgba(232,53,78,0.08),rgba(244,63,94,0.03))", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                <WI n={BANNER_CATEGORIES.find(c=>c.nameFa===ad.category)?.icon ?? "package"} s={40} style={{ color:"rgba(232,53,78,0.18)" }}/>
                <button onClick={e=>{e.stopPropagation();onToggleFav(ad.id);}} style={{ position:"absolute", top:8, left:8, background:"rgba(255,255,255,0.85)", border:"none", borderRadius:"50%", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#e8354e" }}>
                  <WI n="heart" s={13}/>
                </button>
              </div>
              <div style={{ padding:"12px 14px" }}>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{ad.title}</div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                  <span style={{ fontWeight:900 }}>{fmtPrice(ad.price)}</span>
                  <span style={{ color:"var(--w-muted)", display:"flex", gap:3, alignItems:"center" }}><WI n="map-pin" s={11}/>{ad.city}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Messages Section ───────────────────────────────
function MessagesSection() {
  const [activeChat, setActiveChat] = useState<number|null>(null);
  const [msg, setMsg] = useState("");
  const CONVOS = [
    { id:1, name:"علی محمدی", ad:"لپ‌تاپ Dell XPS 15", last:"ممنون، چه زمانی میتونم ببینمش؟", time:"۱۴:۳۲", unread:2 },
    { id:2, name:"سارا احمدی", ad:"آپارتمان ۸۵ متری", last:"قیمت نهایی چنده؟", time:"دیروز", unread:1 },
    { id:3, name:"مهدی رضایی", ad:"پژو ۲۰۶", last:"اوکی، پس فردا می‌بینمتون", time:"دیروز", unread:0 },
    { id:4, name:"زهرا کریمی", ad:"مبل راحتی", last:"باشه، منتظرم", time:"۱۴۰۳/۰۸/۱۵", unread:0 },
  ];
  const MSGS = activeChat !== null ? [
    { from:"other", text:"سلام، درباره آگهی‌تون سؤال داشتم", time:"۱۴:۱۰" },
    { from:"me", text:"بفرمایید، چه سؤالی دارید؟", time:"۱۴:۱۲" },
    { from:"other", text:"آیا قیمت قابل مذاکره هست؟", time:"۱۴:۲۸" },
    { from:"other", text:"ممنون، چه زمانی میتونم ببینمش؟", time:"۱۴:۳۲" },
  ] : [];
  return (
    <div style={{ display:"flex", gap:0, height:"calc(100vh - var(--w-header) - 90px)", background:"var(--w-card)", border:"1px solid var(--w-border)", borderRadius:14, overflow:"hidden" }}>
      <div style={{ width:280, borderLeft:"1px solid var(--w-border)", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"12px 14px", borderBottom:"1px solid var(--w-border)", fontSize:14, fontWeight:800 }}>پیام‌ها</div>
        {CONVOS.map(c=>(
          <div key={c.id} onClick={()=>setActiveChat(c.id)} style={{ padding:"12px 14px", borderBottom:"1px solid var(--w-border)", cursor:"pointer", background:activeChat===c.id?"rgba(232,53,78,0.06)":"transparent", transition:"background 0.1s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(232,53,78,0.1)", display:"flex", alignItems:"center", justifyContent:"center", color:"#e8354e", flexShrink:0, fontSize:13, fontWeight:800 }}>{c.name[0]}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:13, fontWeight:700 }}>{c.name}</span>
                  <span style={{ fontSize:10, color:"var(--w-muted)" }}>{c.time}</span>
                </div>
                <div style={{ fontSize:11, color:"var(--w-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.ad}</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"var(--w-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{c.last}</span>
                  {c.unread > 0 && <span style={{ background:"#e8354e", color:"#fff", borderRadius:10, padding:"1px 6px", fontSize:10, fontWeight:700, marginRight:4, flexShrink:0 }}>{FA(c.unread)}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {activeChat ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--w-border)", fontSize:13, fontWeight:700 }}>
            {CONVOS.find(c=>c.id===activeChat)?.name} — {CONVOS.find(c=>c.id===activeChat)?.ad}
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:10 }}>
            {MSGS.map((m,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:m.from==="me"?"flex-start":"flex-end", gap:8 }}>
                <div style={{ maxWidth:"65%", padding:"10px 14px", borderRadius:12, background:m.from==="me"?"rgba(232,53,78,0.08)":"var(--w-card2)", fontSize:13 }}>
                  {m.text}
                  <div style={{ fontSize:10, color:"var(--w-muted)", marginTop:4, textAlign:"left" }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding:"12px 16px", borderTop:"1px solid var(--w-border)", display:"flex", gap:8 }}>
            <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="پیام بنویسید..." className="w-input" style={{ flex:1 }}
              onKeyDown={e=>{if(e.key==="Enter"&&msg.trim())setMsg("");}}
            />
            <button className="w-btn w-btn-primary" style={{ padding:"10px 18px", background:"#e8354e" }}><WI n="send" s={15}/></button>
          </div>
        </div>
      ) : (
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, color:"var(--w-muted)" }}>
          <WI n="comment" s={48} style={{ opacity:0.2 }}/>
          <div style={{ fontSize:14, fontWeight:700 }}>یک مکالمه انتخاب کنید</div>
        </div>
      )}
    </div>
  );
}

// ── Notifications Section ──────────────────────────
function NotificationsSection() {
  const NOTIFS = [
    { icon:"check", color:"#059669", title:"آگهی شما تأیید شد", desc:"آگهی «لپ‌تاپ Dell XPS 15» فعال شد.", time:"۲ ساعت پیش" },
    { icon:"comment", color:"#0891b2", title:"پیام جدید", desc:"علی محمدی: ممنون، چه زمانی میتونم ببینمش؟", time:"۴ ساعت پیش" },
    { icon:"eye", color:"#d97706", title:"آگهی شما بازدید زیادی داشت", desc:"آگهی «پژو ۲۰۶» ۲۸۰ بازدید جدید دریافت کرد.", time:"دیروز" },
    { icon:"shield", color:"#7c3aed", title:"هشدار امنیتی", desc:"ورود جدید از دستگاه ناشناس شناسایی شد.", time:"۲ روز پیش" },
    { icon:"bell", color:"#e8354e", title:"انقضای آگهی", desc:"آگهی «آپارتمان ۸۵ متری» ۳ روز دیگر منقضی می‌شود.", time:"۳ روز پیش" },
  ];
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ fontSize:18, fontWeight:900 }}>اعلان‌ها</div>
        <button style={{ background:"none", border:"none", cursor:"pointer", color:"#e8354e", fontSize:12, fontWeight:700 }}>علامت‌گذاری همه به عنوان خوانده‌شده</button>
      </div>
      <div className="w-card" style={{ overflow:"hidden" }}>
        {NOTIFS.map((n,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"14px 16px", borderBottom:i<NOTIFS.length-1?"1px solid var(--w-border)":"none", cursor:"pointer", transition:"background 0.1s" }}
            onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="var(--w-hover)"}
            onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}
          >
            <div style={{ width:38, height:38, borderRadius:10, background:`${n.color}15`, display:"flex", alignItems:"center", justifyContent:"center", color:n.color, flexShrink:0 }}>
              <WI n={n.icon} s={18}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700 }}>{n.title}</div>
              <div style={{ fontSize:12, color:"var(--w-muted)", marginTop:2 }}>{n.desc}</div>
              <div style={{ fontSize:11, color:"var(--w-muted)", marginTop:4 }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── My Listings Section ────────────────────────────
function MyListingsSection() {
  const [filter, setFilter] = useState<"active"|"expired"|"sold">("active");
  const MINE = BANNER_ADS.slice(0,4).map((a,i) => ({
    ...a, status: i===0?"expired":i===2?"sold":"active" as "active"|"expired"|"sold",
  }));
  const shown = MINE.filter(a => a.status === filter);
  const statusColor: Record<string,string> = { active:"#10b981", expired:"#d97706", sold:"#0891b2" };
  const statusLabel: Record<string,string> = { active:"فعال", expired:"منقضی", sold:"فروخته شد" };
  return (
    <div>
      <div style={{ fontSize:18, fontWeight:900, marginBottom:20 }}>آگهی‌های من</div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {(["active","expired","sold"] as const).map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{ padding:"7px 18px", borderRadius:8, border:`1px solid ${filter===s?`${statusColor[s]}50`:"var(--w-border)"}`, background:filter===s?`${statusColor[s]}10`:"transparent", color:filter===s?statusColor[s]:"var(--w-muted)", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"Vazirmatn" }}>
            {statusLabel[s]}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {shown.map(ad=>(
          <div key={ad.id} className="w-card" style={{ display:"flex", gap:16, padding:"16px", alignItems:"center" }}>
            <div style={{ width:72, height:60, background:"linear-gradient(135deg,rgba(232,53,78,0.08),rgba(244,63,94,0.03))", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <WI n={BANNER_CATEGORIES.find(c=>c.nameFa===ad.category)?.icon ?? "package"} s={22} style={{ color:"rgba(232,53,78,0.3)" }}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:3 }}>{ad.title}</div>
              <div style={{ display:"flex", gap:14, fontSize:11, color:"var(--w-muted)" }}>
                <span><WI n="eye" s={11}/> {FA(ad.views)} بازدید</span>
                <span><WI n="map-pin" s={11}/> {ad.city}</span>
                <span>{ad.postedAt}</span>
              </div>
            </div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:15, fontWeight:900, marginBottom:4 }}>{fmtPrice(ad.price)}</div>
              <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:5, background:`${statusColor[ad.status]}15`, color:statusColor[ad.status] }}>{statusLabel[ad.status]}</span>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="w-btn w-btn-ghost" style={{ padding:"6px 12px", fontSize:11 }}>ویرایش</button>
              {ad.status==="expired" && <button className="w-btn w-btn-primary" style={{ padding:"6px 12px", fontSize:11, background:"#e8354e" }}>تمدید</button>}
              <button style={{ background:"none", border:"none", cursor:"pointer", color:"var(--w-muted)", padding:"6px" }}><WI n="trash" s={14}/></button>
            </div>
          </div>
        ))}
        {shown.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px", color:"var(--w-muted)" }}>
            <WI n="package" s={40} style={{ opacity:0.2, marginBottom:12 }}/>
            <div style={{ fontSize:14, fontWeight:700 }}>آگهی‌ای در این بخش ندارید</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Account Section ────────────────────────────────
function AccountSection() {
  return (
    <div style={{ maxWidth:640 }}>
      <div style={{ fontSize:18, fontWeight:900, marginBottom:20 }}>حساب کاربری</div>
      <div className="w-card" style={{ padding:"22px", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(232,53,78,0.1)", display:"flex", alignItems:"center", justifyContent:"center", color:"#e8354e", fontSize:24, fontWeight:800 }}>ع</div>
          <div>
            <div style={{ fontSize:17, fontWeight:900 }}>علیرضا حسینی</div>
            <div style={{ fontSize:12, color:"var(--w-muted)" }}>alirezahosseini@email.com</div>
            <div style={{ fontSize:11, color:"#059669", fontWeight:700, marginTop:4 }}>✓ هویت تأیید شده</div>
          </div>
          <button className="w-btn w-btn-ghost" style={{ marginRight:"auto", padding:"7px 16px", fontSize:12 }}>ویرایش پروفایل</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          {[["آگهی فعال","۳","#e8354e"],["بازدید کل","۱,۲۴۰","#0891b2"],["امتیاز","۴.۸ ★","#d97706"]].map(([l,v,c])=>(
            <div key={l as string} style={{ padding:"14px", background:"var(--w-card2)", borderRadius:10, textAlign:"center" }}>
              <div style={{ fontSize:11, color:"var(--w-muted)", marginBottom:6 }}>{l}</div>
              <div style={{ fontSize:20, fontWeight:900, color:c as string }}>{FA(v as string)}</div>
            </div>
          ))}
        </div>
      </div>
      {[{ icon:"bell", title:"تنظیمات اعلان‌ها", desc:"مدیریت پیامک و ایمیل" },
        { icon:"shield", title:"تغییر رمز عبور", desc:"امنیت حساب" },
        { icon:"map-pin", title:"شهر و منطقه", desc:"تهران — شمال" },
        { icon:"document", title:"قوانین و مقررات", desc:"شرایط استفاده" }
      ].map(item=>(
        <div key={item.title} className="w-card" style={{ padding:"14px 18px", marginBottom:10, display:"flex", alignItems:"center", gap:12, cursor:"pointer", transition:"background 0.1s" }}
          onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="var(--w-hover)"}
          onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="var(--w-card)"}
        >
          <div style={{ width:36, height:36, borderRadius:10, background:"rgba(232,53,78,0.08)", display:"flex", alignItems:"center", justifyContent:"center", color:"#e8354e" }}>
            <WI n={item.icon} s={17}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700 }}>{item.title}</div>
            <div style={{ fontSize:11, color:"var(--w-muted)" }}>{item.desc}</div>
          </div>
          <WI n="arrow-left" s={13} style={{ color:"var(--w-muted)" }}/>
        </div>
      ))}
    </div>
  );
}

// ── Tickets Section ────────────────────────────────
function TicketsSection() {
  const [view, setView] = useState<"list"|"new">("list");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const TICKETS = [
    { id:"BN-214", subject:"مشکل در ثبت آگهی", status:"پاسخ داده شده", date:"۱۴۰۳/۰۸/۲۰", color:"#10b981" },
    { id:"BN-198", subject:"آگهی رد شد", status:"در انتظار بررسی", date:"۱۴۰۳/۰۸/۱۵", color:"#d97706" },
  ];
  if (view === "new") return (
    <div style={{ maxWidth:560 }}>
      <button onClick={()=>setView("list")} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:"var(--w-muted)", fontSize:13, marginBottom:20 }}>
        <WI n="arrow-right" s={13}/> بازگشت
      </button>
      <h2 style={{ fontSize:18, fontWeight:900, marginBottom:20 }}>تیکت جدید</h2>
      <div className="w-card" style={{ padding:"22px", display:"flex", flexDirection:"column", gap:14 }}>
        <div>
          <label style={{ fontSize:11, fontWeight:700, color:"var(--w-muted)", display:"block", marginBottom:5 }}>موضوع</label>
          <input value={subject} onChange={e=>setSubject(e.target.value)} className="w-input" placeholder="موضوع مشکل را بنویسید"/>
        </div>
        <div>
          <label style={{ fontSize:11, fontWeight:700, color:"var(--w-muted)", display:"block", marginBottom:5 }}>توضیحات</label>
          <textarea value={body} onChange={e=>setBody(e.target.value)} rows={5} className="w-input" placeholder="مشکل خود را با جزئیات شرح دهید..." style={{ resize:"vertical" }}/>
        </div>
        <button disabled={!subject||!body} onClick={()=>setView("list")} className="w-btn w-btn-primary" style={{ padding:"12px", background:"#e8354e", opacity:subject&&body?1:0.5 }}>ارسال تیکت</button>
      </div>
    </div>
  );
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ fontSize:18, fontWeight:900 }}>پشتیبانی</div>
        <button onClick={()=>setView("new")} className="w-btn w-btn-primary" style={{ padding:"8px 18px", background:"#e8354e" }}>تیکت جدید +</button>
      </div>
      <div className="w-card" style={{ overflow:"hidden" }}>
        {TICKETS.map((t,i)=>(
          <div key={t.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderBottom:i<TICKETS.length-1?"1px solid var(--w-border)":"none", cursor:"pointer" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${t.color}15`, display:"flex", alignItems:"center", justifyContent:"center", color:t.color }}>
              <WI n="document" s={17}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700 }}>{t.subject}</div>
              <div style={{ fontSize:11, color:"var(--w-muted)" }}>{t.id} · {t.date}</div>
            </div>
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:`${t.color}15`, color:t.color }}>{t.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Post Ad (3-step form) ─────────────────────────
function PostAd({ onBack, isLoggedIn, onAuthRequired }: { onBack:()=>void; isLoggedIn:boolean; onAuthRequired:()=>void }) {
  const [step, setStep] = useState(1);
  const [formCat, setFormCat] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("نو");
  const [city, setCity] = useState("تهران");
  const [done, setDone] = useState(false);

  if (!isLoggedIn) return (
    <div style={{ textAlign:"center", padding:"80px 24px" }}>
      <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(232,53,78,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:"#e8354e" }}>
        <WI n="lock" s={28}/>
      </div>
      <div style={{ fontSize:18, fontWeight:800, marginBottom:8 }}>برای ثبت آگهی وارد شوید</div>
      <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:16 }}>
        <button onClick={onAuthRequired} className="w-btn w-btn-primary" style={{ padding:"11px 28px", background:"#e8354e" }}>ورود / ثبت‌نام</button>
        <button onClick={onBack} className="w-btn w-btn-ghost" style={{ padding:"11px 20px" }}>بازگشت</button>
      </div>
    </div>
  );

  if (done) return (
    <div style={{ textAlign:"center", padding:"80px 24px" }}>
      <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(16,185,129,0.12)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:"#10b981", fontSize:40 }}>✓</div>
      <div style={{ fontSize:22, fontWeight:900, marginBottom:8 }}>آگهی ارسال شد!</div>
      <div style={{ fontSize:13, color:"var(--w-muted)", marginBottom:24 }}>آگهی شما پس از تأیید اپراتور (معمولاً کمتر از ۲ ساعت) نمایش داده می‌شود.</div>
      <button onClick={onBack} className="w-btn w-btn-primary" style={{ padding:"12px 28px", background:"#e8354e" }}>بازگشت به آن بنر</button>
    </div>
  );

  const steps = ["دسته‌بندی","اطلاعات","تصاویر"];
  return (
    <div className="w-fade" style={{ maxWidth:640, margin:"0 auto" }}>
      <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:"var(--w-muted)", fontSize:13, marginBottom:20 }}>
        <WI n="arrow-right" s={14}/> بازگشت
      </button>
      <h1 style={{ fontSize:20, fontWeight:900, marginBottom:20 }}>ثبت آگهی جدید</h1>
      <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:28 }}>
        {steps.map((s,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", flex:1 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:step>i+1?"#059669":step===i+1?"#e8354e":"var(--w-border2)", color:step>=i+1?"#fff":"var(--w-muted)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800 }}>
                {step>i+1?<WI n="check" s={13}/>:FA(i+1)}
              </div>
              <div style={{ fontSize:10, color:step===i+1?"#e8354e":"var(--w-muted)", fontWeight:step===i+1?700:400 }}>{s}</div>
            </div>
            {i<2 && <div style={{ flex:1, height:1, background:step>i+1?"#059669":"var(--w-border)", margin:"0 6px 14px" }}/>}
          </div>
        ))}
      </div>
      <div className="w-card" style={{ padding:"24px" }}>
        {step === 1 && (
          <>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>دسته‌بندی آگهی را انتخاب کنید</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {BANNER_CATEGORIES.map(c=>(
                <button key={c.id} onClick={()=>setFormCat(c.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px", border:`1.5px solid ${formCat===c.id?"rgba(232,53,78,0.4)":"var(--w-border)"}`, borderRadius:11, background:formCat===c.id?"rgba(232,53,78,0.08)":"transparent", cursor:"pointer", color:formCat===c.id?"#e8354e":"var(--w-text)", fontSize:13, fontWeight:600, fontFamily:"Vazirmatn" }}>
                  <WI n={c.icon as string} s={16}/>{c.nameFa}
                </button>
              ))}
            </div>
            <button onClick={()=>setStep(2)} disabled={!formCat} className="w-btn w-btn-primary" style={{ width:"100%", marginTop:20, padding:"12px", background:"#e8354e", opacity:formCat?1:0.5 }}>مرحله بعد</button>
          </>
        )}
        {step === 2 && (
          <>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"var(--w-muted)", display:"block", marginBottom:5 }}>عنوان آگهی *</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="عنوان آگهی" className="w-input"/>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"var(--w-muted)", display:"block", marginBottom:5 }}>توضیحات *</label>
                <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4} placeholder="توضیحات کامل..." className="w-input" style={{ resize:"vertical" }}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"var(--w-muted)", display:"block", marginBottom:5 }}>قیمت (تومان)</label>
                  <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="توافقی" inputMode="numeric" className="w-input"/>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"var(--w-muted)", display:"block", marginBottom:5 }}>وضعیت کالا</label>
                  <select value={condition} onChange={e=>setCondition(e.target.value)} className="w-input">
                    {["نو","در حد نو","خوب","کارکرده"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"var(--w-muted)", display:"block", marginBottom:5 }}>استان</label>
                  <select className="w-input">{PROVINCES.map(p=><option key={p}>{p}</option>)}</select>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"var(--w-muted)", display:"block", marginBottom:5 }}>شهر</label>
                  <select value={city} onChange={e=>setCity(e.target.value)} className="w-input">
                    {CITIES.slice(1).map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button onClick={()=>setStep(1)} className="w-btn w-btn-ghost" style={{ padding:"11px 20px" }}>قبلی</button>
              <button onClick={()=>setStep(3)} disabled={!title||!desc} className="w-btn w-btn-primary" style={{ flex:1, padding:"12px", background:"#e8354e", opacity:title&&desc?1:0.5 }}>مرحله بعد</button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>بارگذاری تصاویر (اختیاری)</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
              {Array.from({length:4},(_,i)=>(
                <div key={i} style={{ aspectRatio:"1", background:"var(--w-card2)", border:"1.5px dashed var(--w-border2)", borderRadius:11, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--w-muted)", fontSize:11, gap:6 }}>
                  <WI n="plus" s={20}/> {i===0?"تصویر اصلی":"تصویر"}
                </div>
              ))}
            </div>
            <div style={{ padding:"12px 14px", background:"rgba(217,119,6,0.08)", borderRadius:10, fontSize:12, color:"#d97706", marginBottom:20 }}>
              آگهی پس از تأیید اپراتور (معمولاً کمتر از ۲ ساعت) در سایت نمایش داده می‌شود.
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setStep(2)} className="w-btn w-btn-ghost" style={{ padding:"11px 20px" }}>قبلی</button>
              <button onClick={()=>setDone(true)} className="w-btn w-btn-primary" style={{ flex:1, padding:"12px", background:"#e8354e" }}>
                <WI n="check" s={16}/> ثبت آگهی
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
