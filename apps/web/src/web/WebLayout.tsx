// ─────────────────────────────────────────────────
// An Pardaz Web Portal — Layout (Header + Footer)
// ─────────────────────────────────────────────────
import { useState, useEffect } from "react";
import WI from "./WebIcons";
import anPardazLogo from "@/imports/ChatGPT_Image_Aug_10__2026__06_38_53_PM__3_.png";
import type { WebPage, UserRole } from "./types";
import { FOOTER_CONFIG } from "./mockData";

// ── Design tokens ────────────────────────────────
export const CSS_VARS = `
  :root{
    --w-bg:#f5f5fb; --w-surface:#ffffff; --w-card:#ffffff;
    --w-card2:#f8f8fc; --w-border:rgba(0,0,0,0.07);
    --w-border2:rgba(0,0,0,0.12); --w-text:#111118;
    --w-muted:rgba(17,17,24,0.52); --w-accent:#7c3aed;
    --w-accent2:#5b21b6; --w-accent-fg:#ffffff;
    --w-success:#059669; --w-danger:#dc2626; --w-warning:#d97706;
    --w-sarraf:#0891b2; --w-market:#d97706; --w-banner:#e8354e;
    --w-hoosh:#7c3aed; --w-financial:#059669;
    --w-hover:rgba(0,0,0,0.04);
    --w-radius:14px; --w-radius-lg:20px; --w-radius-sm:8px;
    --w-shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04);
    --w-shadow-md:0 4px 12px rgba(0,0,0,0.08),0 12px 32px rgba(0,0,0,0.06);
    --w-shadow-lg:0 8px 24px rgba(0,0,0,0.12),0 24px 64px rgba(0,0,0,0.08);
    --w-font:"Vazirmatn",system-ui,sans-serif;
    --w-header:64px;
  }
  .dark-theme{
    --w-bg:#09090f; --w-surface:#0e0e18; --w-card:#13131f;
    --w-card2:#17172a; --w-border:rgba(255,255,255,0.07);
    --w-border2:rgba(255,255,255,0.13); --w-text:#edecfa;
    --w-hover:rgba(255,255,255,0.04);
    --w-muted:rgba(237,236,250,0.4); --w-accent:#8b5cf6;
    --w-accent2:#7c3aed; --w-shadow:0 1px 3px rgba(0,0,0,0.3),0 4px 16px rgba(0,0,0,0.2);
    --w-shadow-md:0 4px 12px rgba(0,0,0,0.35),0 12px 32px rgba(0,0,0,0.25);
    --w-shadow-lg:0 8px 24px rgba(0,0,0,0.45),0 24px 64px rgba(0,0,0,0.35);
  }
  *,*::before,*::after{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{margin:0;background:var(--w-bg);color:var(--w-text);font-family:var(--w-font);direction:rtl;}
  .w-portal{min-height:100vh;display:flex;flex-direction:column;background:var(--w-bg);color:var(--w-text);}
  .w-main{flex:1;padding-top:var(--w-header);}
  input,textarea,select,button{font-family:var(--w-font);}
  a{color:inherit;text-decoration:none;}
  img{max-width:100%;}
  .w-scroll::-webkit-scrollbar{width:4px;height:4px;}
  .w-scroll::-webkit-scrollbar-thumb{background:var(--w-border2);border-radius:4px;}
  .w-noscroll::-webkit-scrollbar{display:none;}
  .w-noscroll{scrollbar-width:none;}
  button:focus-visible,a:focus-visible{outline:2px solid var(--w-accent);outline-offset:2px;}
  @keyframes wFade{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
  @keyframes wSlide{from{opacity:0;transform:translateX(16px);}to{opacity:1;transform:none;}}
  .w-fade{animation:wFade 0.28s ease both;}
  .w-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:none;cursor:pointer;font-family:var(--w-font);font-weight:700;transition:all 0.15s;border-radius:var(--w-radius-sm);}
  .w-btn-primary{background:var(--w-accent);color:#fff;padding:10px 20px;font-size:14px;}
  .w-btn-primary:hover{background:var(--w-accent2);transform:translateY(-1px);}
  .w-btn-primary:active{transform:none;}
  .w-btn-ghost{background:transparent;color:var(--w-muted);padding:8px 14px;font-size:13px;border:1.5px solid var(--w-border);}
  .w-btn-ghost:hover{background:var(--w-card2);border-color:var(--w-border2);color:var(--w-text);}
  .w-btn-outline{background:transparent;color:var(--w-accent);padding:9px 18px;font-size:13px;border:1.5px solid rgba(124,58,237,0.3);}
  .w-btn-outline:hover{background:rgba(124,58,237,0.07);}
  .w-input{width:100%;padding:10px 14px;background:var(--w-card2);border:1.5px solid var(--w-border);border-radius:var(--w-radius-sm);color:var(--w-text);font-size:14px;font-family:var(--w-font);outline:none;transition:border-color 0.14s;}
  .w-input:focus{border-color:rgba(124,58,237,0.4);}
  .w-input::placeholder{color:var(--w-muted);}
  .w-card{background:var(--w-card);border:1px solid var(--w-border);border-radius:var(--w-radius);box-shadow:var(--w-shadow);}
  .w-divider{height:1px;background:var(--w-border);margin:0;}
  .w-badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;}
  .w-badge-new{background:rgba(124,58,237,0.12);color:#7c3aed;}
  .w-badge-pro{background:rgba(217,119,6,0.12);color:#d97706;}
  .w-badge-up{background:rgba(5,150,105,0.12);color:#059669;}
  .w-badge-down{background:rgba(220,38,38,0.1);color:#dc2626;}
  .w-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;}
  .w-btn-muted{background:var(--w-card2);color:var(--w-muted);padding:8px 14px;font-size:13px;border:1px solid var(--w-border);}
  .w-btn-muted:hover{background:var(--w-card);color:var(--w-text);}

  /* Desktop-only layout. The page is one fixed desktop canvas on every device. */
  body{min-width:0;}
  .w-main{overflow-x:hidden;}
  .w-container{max-width:1480px;margin:0 auto;padding:0 20px;}

  /* Platform page headers */
  .w-platform-header{
    display:flex;align-items:center;gap:12px;height:52px;
    background:var(--w-surface);border-bottom:1px solid var(--w-border);
  }

  /* Sidebar */
  .w-sidebar{transition:transform 0.22s,opacity 0.22s;}

  /* Chip/pill row */
  .w-chip-row{display:flex;gap:6px;overflow-x:auto;padding:0 0 4px;scrollbar-width:none;}
  .w-chip-row::-webkit-scrollbar{display:none;}
  .w-chip{
    flex-shrink:0;padding:6px 14px;border-radius:20px;
    border:1px solid var(--w-border);background:var(--w-card2);
    color:var(--w-muted);font-size:12px;font-weight:600;
    cursor:pointer;white-space:nowrap;font-family:var(--w-font);
    transition:all 0.12s;
  }
  .w-chip-active{background:var(--w-accent)!important;color:#fff!important;border-color:var(--w-accent)!important;}

  /* Grids */
  .w-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;}
  .w-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
  .w-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
  .w-grid-auto{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;}

  /* Platforms grid */
  .w-platforms-grid{
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
    gap:16px;
  }

  /* Market table — desktop grid, mobile cards always hidden */
  .w-market-row-desktop{display:grid;}
  .w-market-row-mobile{display:none!important;}
  .w-crypto-table-desktop{display:block;}
  .w-crypto-table-mobile{display:none!important;}

  /* Trade layout */
  .w-trade-layout{display:flex;flex:1;overflow:hidden;}

  /* Tab scroll */
  .w-tab-row{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;}
  .w-tab-row::-webkit-scrollbar{display:none;}

  /* Text utilities */
  .w-truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

  /* Prevent body scroll when overlay is open */
  .w-no-scroll{overflow:hidden!important;}
`;


const FA = (s: string | number) => String(s).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]);

// ── NAV ITEMS ─────────────────────────────────────
interface NavItem { id: WebPage; label: string; icon: string; color?: string; }

const PLATFORM_NAV: NavItem[] = [
  { id:"sarraf",    label:"آن صراف",   icon:"sarraf",   color:"#0891b2" },
  { id:"market",    label:"آن مارکت", icon:"market",   color:"#d97706" },
  { id:"banner",    label:"آن بنر",   icon:"banner",   color:"#e8354e" },
  { id:"hoosh",     label:"آن هوش",   icon:"hoosh",    color:"#7c3aed" },
  { id:"financial", label:"سبد ارز دیجیتال",icon:"financial", color:"#059669" },
];

const CONTENT_NAV: NavItem[] = [
  { id:"news",      label:"اخبار",     icon:"newspaper" },
  { id:"education", label:"آموزش",     icon:"graduation" },
  { id:"video",     label:"مرکز ویدئو",icon:"video" },
];
