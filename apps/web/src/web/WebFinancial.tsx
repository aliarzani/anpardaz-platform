// ─────────────────────────────────────────────────
// An Pardaz Web Portal — Financial Center (Desktop)
// Public financial data only — no banking transactions
// ─────────────────────────────────────────────────
import { useState } from "react";
import WI from "./WebIcons";
import { CRYPTO_ASSETS, MARKET_INDICES } from "./mockData";
import type { WebPage } from "./types";

const FA = (s: string | number) => String(s).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const fmtN = (n: number) => {
  if (n >= 1e12) return `${(n/1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `${(n/1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `${(n/1e6).toFixed(2)}M`;
  return n.toLocaleString();
};
const color = (n: number) => n >= 0 ? "#10b981" : "#f43f5e";

type Section = "overview" | "crypto" | "forex" | "tools";

const TOOLS = [
  { icon:"calculator", title:"ماشین‌حساب سود", desc:"محاسبه سود سرمایه‌گذاری با نرخ مرکب" },
  { icon:"trending-up", title:"تحلیل ریسک", desc:"ارزیابی ریسک پورتفولیو" },
  { icon:"bar-chart", title:"مقایسه دارایی‌ها", desc:"مقایسه عملکرد تاریخی" },
  { icon:"pie-chart", title:"تخصیص پورتفولیو", desc:"بهینه‌سازی ترکیب سرمایه" },
  { icon:"zap", title:"هشدار قیمت", desc:"اعلان‌های قیمتی سفارشی" },
  { icon:"activity", title:"نمودار پیشرفته", desc:"تحلیل تکنیکال با اندیکاتور" },
];

const FOREX = [
  { pair:"USD/IRR", rate:"۵۸,۴۲۰", change:"+۱.۲٪", buy:"۵۸,۱۰۰", sell:"۵۸,۷۴۰" },
  { pair:"EUR/IRR", rate:"۶۳,۸۱۰", change:"+۰.۸٪", buy:"۶۳,۵۰۰", sell:"۶۴,۱۲۰" },
  { pair:"AED/IRR", rate:"۱۵,۹۱۰", change:"-۰.۳٪", buy:"۱۵,۸۵۰", sell:"۱۵,۹۷۰" },
  { pair:"GBP/IRR", rate:"۷۴,۲۳۰", change:"+۰.۵٪", buy:"۷۳,۹۰۰", sell:"۷۴,۵۶۰" },
  { pair:"EUR/USD", rate:"۱.۰۹۴", change:"+۰.۱٪", buy:"۱.۰۹۲", sell:"۱.۰۹۶" },
  { pair:"GBP/USD", rate:"۱.۲۷۱", change:"-۰.۲٪", buy:"۱.۲۶۹", sell:"۱.۲۷۳" },
];

interface Props { onNavigate: (p: WebPage) => void; }

export default function WebFinancial({ onNavigate }: Props) {
  const [section, setSection] = useState<Section>("overview");
  const [sort, setSort]       = useState<"rank"|"change"|"volume">("rank");
  const [calcAmt, setCalcAmt] = useState("1000");
  const [calcRate, setCalcRate] = useState("12");
  const [calcYears, setCalcYears] = useState("3");

  const sorted = [...CRYPTO_ASSETS].sort((a,b) => {
    if (sort === "rank")   return a.rank - b.rank;
    if (sort === "change") return b.change24h - a.change24h;
    return b.volume24h - a.volume24h;
  });

  const calcResult = (() => {
    const p = parseFloat(calcAmt)||0, r = parseFloat(calcRate)||0, t = parseFloat(calcYears)||0;
    return p * Math.pow(1 + r/100, t);
  })();

  const navItems: { id: Section; label: string; icon: string }[] = [
    { id:"overview", label:"نمای کلی", icon:"activity" },
    { id:"crypto",   label:"ارزهای دیجیتال", icon:"zap" },
    { id:"forex",    label:"ارز و طلا", icon:"trending-up" },
    { id:"tools",    label:"ابزارها", icon:"calculator" },
  ];

  return (
    <div className="w-fade" dir="rtl" style={{ display:"flex", flexDirection:"column", minHeight:"calc(100vh - var(--w-header))" }}>
      {/* Platform Header */}
      <div style={{ background:"var(--w-surface)", borderBottom:"1px solid var(--w-border)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, height:56 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:"rgba(5,150,105,0.12)", border:"1px solid rgba(5,150,105,0.22)", display:"flex", alignItems:"center", justifyContent:"center", color:"#059669" }}>
                <WI n="financial" s={16}/>
              </div>
              <div style={{ fontSize:16, fontWeight:900 }}>مرکز مالی</div>
            </div>
            {navItems.map(n => (
              <button key={n.id} onClick={()=>setSection(n.id)}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:8, border:"none", background:section===n.id?"rgba(5,150,105,0.1)":"transparent", color:section===n.id?"#059669":"var(--w-muted)", fontSize:13, fontWeight:section===n.id?700:500, cursor:"pointer", transition:"all 0.14s" }}>
                <WI n={n.icon} s={14}/>{n.label}
              </button>
            ))}
            <button onClick={()=>onNavigate("home")} style={{ marginRight:"auto", background:"none", border:"none", cursor:"pointer", color:"var(--w-muted)", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
              <WI n="arrow-right" s={13}/> بازگشت
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex:1, maxWidth:1280, margin:"0 auto", width:"100%", padding:"24px" }}>

        {/* ── Overview ─────────────────────────────── */}
        {section === "overview" && (
          <>
            {/* Market indices */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14, marginBottom:28 }}>
              {MARKET_INDICES.map(idx => (
                <div key={idx.name} className="w-card" style={{ padding:"18px" }}>
                  <div style={{ fontSize:11, color:"var(--w-muted)", marginBottom:6 }}>{idx.nameFa}</div>
                  <div style={{ fontSize:20, fontWeight:900, marginBottom:4 }}>{idx.value.toLocaleString()}</div>
                  <div style={{ fontSize:12, color:color(idx.changePercent), fontWeight:700 }}>
                    {idx.changePercent >= 0 ? "+" : ""}{idx.changePercent.toFixed(2)}٪
                    <span style={{ color:"var(--w-muted)", fontWeight:400, marginRight:4 }}>({idx.change >= 0 ? "+" : ""}{idx.change.toFixed(2)})</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Top movers + mini crypto table */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              {/* Top Gainers */}
              <div className="w-card" style={{ padding:"20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                  <WI n="trending-up" s={16} style={{ color:"#10b981" }}/>
                  <div style={{ fontSize:14, fontWeight:800 }}>برترین رشدها</div>
                  <div style={{ marginRight:"auto", fontSize:11, color:"var(--w-muted)" }}>۲۴ ساعت گذشته</div>
                </div>
                {[...CRYPTO_ASSETS].sort((a,b)=>b.change24h-a.change24h).slice(0,5).map(a => (
                  <div key={a.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid var(--w-border)" }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:a.logoColor, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10, fontWeight:800, flexShrink:0 }}>{a.symbol.slice(0,2)}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700 }}>{a.nameFa}</div>
                      <div style={{ fontSize:10, color:"var(--w-muted)" }}>{a.symbol}</div>
                    </div>
                    <div style={{ fontSize:12, fontWeight:800, color:"#10b981" }}>+{a.change24h.toFixed(2)}٪</div>
                  </div>
                ))}
              </div>

              {/* Top Losers */}
              <div className="w-card" style={{ padding:"20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                  <WI n="trending-down" s={16} style={{ color:"#f43f5e" }}/>
                  <div style={{ fontSize:14, fontWeight:800 }}>بیشترین افت</div>
                  <div style={{ marginRight:"auto", fontSize:11, color:"var(--w-muted)" }}>۲۴ ساعت گذشته</div>
                </div>
                {[...CRYPTO_ASSETS].sort((a,b)=>a.change24h-b.change24h).slice(0,5).map(a => (
                  <div key={a.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid var(--w-border)" }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:a.logoColor, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10, fontWeight:800, flexShrink:0 }}>{a.symbol.slice(0,2)}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700 }}>{a.nameFa}</div>
                      <div style={{ fontSize:10, color:"var(--w-muted)" }}>{a.symbol}</div>
                    </div>
                    <div style={{ fontSize:12, fontWeight:800, color:"#f43f5e" }}>{a.change24h.toFixed(2)}٪</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{ marginTop:20, padding:"14px 18px", background:"rgba(217,119,6,0.07)", border:"1px solid rgba(217,119,6,0.18)", borderRadius:10, fontSize:12, color:"#d97706", display:"flex", gap:8, alignItems:"flex-start" }}>
              <WI n="alert-triangle" s={14} style={{ flexShrink:0, marginTop:1 }}/>
              <span>اطلاعات نمایش‌داده‌شده صرفاً جهت آموزش و اطلاع‌رسانی است. این اطلاعات مشاوره سرمایه‌گذاری محسوب نمی‌شود. پیش از هر تصمیم مالی با متخصص مشورت کنید.</span>
            </div>
          </>
        )}

        {/* ── Crypto Table ─────────────────────────── */}
        {section === "crypto" && (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
              <div style={{ fontSize:18, fontWeight:900 }}>قیمت ارزهای دیجیتال</div>
              <div style={{ marginRight:"auto", display:"flex", gap:8 }}>
                {(["rank","change","volume"] as const).map(s => (
                  <button key={s} onClick={()=>setSort(s)}
                    style={{ padding:"5px 14px", borderRadius:7, border:`1px solid ${sort===s?"rgba(5,150,105,0.4)":"var(--w-border)"}`, background:sort===s?"rgba(5,150,105,0.1)":"transparent", color:sort===s?"#059669":"var(--w-muted)", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                    {s==="rank"?"رتبه":s==="change"?"بیشترین رشد":"حجم"}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-card" style={{ overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid var(--w-border)" }}>
                    {["#","ارز","قیمت (USDT)","قیمت (تومان)","تغییر ۲۴ه","حجم ۲۴ه","مارکت‌کپ"].map(h=>(
                      <th key={h} style={{ padding:"12px 16px", textAlign:"right", color:"var(--w-muted)", fontWeight:600, fontSize:11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((a, i) => (
                    <tr key={a.id} style={{ borderBottom:"1px solid var(--w-border)", transition:"background 0.1s" }}
                      onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background="var(--w-hover)"}
                      onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background="transparent"}
                    >
                      <td style={{ padding:"12px 16px", color:"var(--w-muted)", fontWeight:600, width:40 }}>{FA(i+1)}</td>
                      <td style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:30, height:30, borderRadius:"50%", background:a.logoColor, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10, fontWeight:800, flexShrink:0 }}>{a.symbol.slice(0,2)}</div>
                          <div>
                            <div style={{ fontWeight:700 }}>{a.nameFa}</div>
                            <div style={{ fontSize:10, color:"var(--w-muted)" }}>{a.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"12px 16px", fontWeight:700, fontVariantNumeric:"tabular-nums" }}>${a.price.toLocaleString()}</td>
                      <td style={{ padding:"12px 16px", fontVariantNumeric:"tabular-nums" }}>{FA(a.priceIrt.toLocaleString())}</td>
                      <td style={{ padding:"12px 16px", color:color(a.change24h), fontWeight:700 }}>{a.change24h >= 0 ? "+" : ""}{a.change24h.toFixed(2)}٪</td>
                      <td style={{ padding:"12px 16px", color:"var(--w-muted)" }}>{fmtN(a.volume24h)}</td>
                      <td style={{ padding:"12px 16px", color:"var(--w-muted)" }}>{fmtN(a.marketCap)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Forex ────────────────────────────────── */}
        {section === "forex" && (
          <>
            <div style={{ fontSize:18, fontWeight:900, marginBottom:18 }}>نرخ ارز و طلا</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
              {FOREX.map(f => (
                <div key={f.pair} className="w-card" style={{ padding:"20px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:15, fontWeight:900, letterSpacing:1 }}>{f.pair}</div>
                      <div style={{ fontSize:22, fontWeight:900, marginTop:4 }}>{f.rate}</div>
                    </div>
                    <span style={{ padding:"3px 10px", borderRadius:20, background:f.change.startsWith("+")?"rgba(16,185,129,0.1)":"rgba(244,63,94,0.1)", color:f.change.startsWith("+")?"#10b981":"#f43f5e", fontSize:12, fontWeight:700 }}>{f.change}</span>
                  </div>
                  <div style={{ height:1, background:"var(--w-border)", margin:"10px 0" }}/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontSize:12 }}>
                    <div><div style={{ color:"var(--w-muted)", marginBottom:3 }}>خرید</div><div style={{ fontWeight:700, color:"#10b981" }}>{f.buy}</div></div>
                    <div><div style={{ color:"var(--w-muted)", marginBottom:3 }}>فروش</div><div style={{ fontWeight:700, color:"#f43f5e" }}>{f.sell}</div></div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:14, padding:"12px 16px", background:"rgba(5,150,105,0.07)", border:"1px solid rgba(5,150,105,0.18)", borderRadius:10, fontSize:12, color:"#059669" }}>
              نرخ‌ها هر ۱۵ دقیقه یک‌بار به‌روزرسانی می‌شوند. نرخ صرافی‌های معتبر بازار تهران.
            </div>
          </>
        )}

        {/* ── Tools ────────────────────────────────── */}
        {section === "tools" && (
          <>
            <div style={{ fontSize:18, fontWeight:900, marginBottom:18 }}>ابزارهای مالی</div>
            <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:20, alignItems:"start" }}>
              {/* Compound interest calculator */}
              <div className="w-card" style={{ padding:"24px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
                  <WI n="calculator" s={18} style={{ color:"#059669" }}/>
                  <div style={{ fontSize:15, fontWeight:800 }}>ماشین‌حساب سود مرکب</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:"var(--w-muted)", display:"block", marginBottom:5 }}>سرمایه اولیه (دلار)</label>
                    <input value={calcAmt} onChange={e=>setCalcAmt(e.target.value)} inputMode="decimal" className="w-input"/>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:"var(--w-muted)", display:"block", marginBottom:5 }}>نرخ سود سالانه (٪)</label>
                    <input value={calcRate} onChange={e=>setCalcRate(e.target.value)} inputMode="decimal" className="w-input"/>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:"var(--w-muted)", display:"block", marginBottom:5 }}>مدت (سال)</label>
                    <input value={calcYears} onChange={e=>setCalcYears(e.target.value)} inputMode="decimal" className="w-input"/>
                  </div>
                  <div style={{ padding:"16px", background:"rgba(5,150,105,0.08)", border:"1px solid rgba(5,150,105,0.2)", borderRadius:11, textAlign:"center" }}>
                    <div style={{ fontSize:11, color:"var(--w-muted)", marginBottom:4 }}>ارزش نهایی</div>
                    <div style={{ fontSize:26, fontWeight:900, color:"#059669" }}>${calcResult.toFixed(2)}</div>
                    <div style={{ fontSize:11, color:"var(--w-muted)", marginTop:4 }}>
                      سود: <span style={{ color:"#059669", fontWeight:700 }}>${(calcResult - parseFloat(calcAmt)||0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other tools grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
                {TOOLS.slice(1).map(t => (
                  <div key={t.title} className="w-card" style={{ padding:"20px", cursor:"pointer" }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="rgba(5,150,105,0.3)";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="var(--w-border)";}}
                  >
                    <div style={{ width:40, height:40, borderRadius:11, background:"rgba(5,150,105,0.1)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, color:"#059669" }}>
                      <WI n={t.icon} s={20}/>
                    </div>
                    <div style={{ fontSize:13, fontWeight:800, marginBottom:4 }}>{t.title}</div>
                    <div style={{ fontSize:11, color:"var(--w-muted)", lineHeight:1.5 }}>{t.desc}</div>
                    <div style={{ marginTop:12, fontSize:11, color:"#059669", fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>به‌زودی <WI n="arrow-left" s={11}/></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
