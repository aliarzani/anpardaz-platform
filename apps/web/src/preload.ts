// Preload all static image assets before React renders.
// Importing this module causes the browser to start fetching all images
// immediately — so by the time any component renders, assets are already
// in the HTTP cache and appear instantly.

import anPardazLogo from "@/imports/ChatGPT_Image_Aug_10__2026__06_38_53_PM__3_.png";
import logoHekmat from "@/imports/Bank-Hekmat-Iranian-Logo.png";
import logoMehr from "@/imports/Bank-Mehr-Iran.png";
import logoHamrahAval from "@/imports/Hamrahe_Aval__2_.png";
import logoIrancell from "@/imports/_wp-content_uploads_2023_12_MTNI-Logo-Yellow-FA-1024-563.png";
import logoAnsar from "@/imports/bank-ansar.png";
import logoKarafarin from "@/imports/bank-karafarin-3.png";
import logoParsian from "@/imports/bank-parsian.png";
import logoRefah from "@/imports/bank-refah.png";
import logoRightel from "@/imports/new-logo4.png";
import logoSarmayeh from "@/imports/bank-sarmayeh.png";
import logoShahr from "@/imports/bank-shahr.png";
import logoTejarat from "@/imports/bank-tejarat.png";
import logoSanatMadan from "@/imports/Sanat-va-madan.png";
import logoMeli from "@/imports/bank-meli__2_.png";
import logoMelal from "@/imports/Melal-Credit-Institution-Logo.png";
import logoToseeTaavon from "@/imports/Tosee-Taavon-Bank-Logo.png";
import logoDi from "@/imports/bank-ayandeh.png";
import logoIranZamin from "@/imports/bank-iranzamin.png";
import logoKeshavarzi from "@/imports/Bank-Keshavarzi-Logo.png";
import logoMaskan from "@/imports/bank-maskan.png";
import logoResalat from "@/imports/bank-resalat.png";
import logoSepah from "@/imports/bank-sepah.png";
import slide2Img from "@/imports/ChatGPT_Image_Aug_26__2026__03_51_21_PM-1.png";
import slide3Img from "@/imports/ChatGPT_Image_Aug_26__2026__03_27_20_PM.png";
import logoGardeshgari from "@/imports/gardeshgari.png";
import logoToseeSaderat from "@/imports/Export-Development-Bank-of-Iran-Logo.png";
import billImgHamrah from "@/imports/67ea208c-b6ea-4a03-9408-156cfa836850.png";
import billImgIrancell from "@/imports/8bd188ae-0d5a-41e2-b9e2-719e1850fb93.png";
import billImgAb from "@/imports/ecad70dc-ed5e-4c95-aac7-cf369ea9d460.png";
import billImgBrq from "@/imports/cb91bb35-cad8-4893-afb8-7256a27ae26e.png";
import billImgMakhab from "@/imports/db7f952b-560e-4108-962f-40b21acd1fde.png";
import charityLogoKomite from "@/imports/bd981266-0952-497e-adc2-6979c25929dd.png";
import charityLogoRedCrescent from "@/imports/50ee0495-3e4f-4701-97e0-f37994adb0e1.png";
import charityLogoChildren from "@/imports/3bea6472-d221-4630-b1c2-ad7882ba4659.png";
import charityLogoBarekat from "@/imports/fea9ea50-c987-4daf-a63c-fc8720539963.png";
import charityLogoEnvironment from "@/imports/39de94f2-ebfb-499f-8225-90f5f5c90ad7-1.png";
import billImgGaz from "@/imports/dfbca881-b660-417c-b45e-7e5ab1120d16.png";
import logoPostBank from "@/imports/postbank.png";
import logoMellat from "@/imports/bank-mellat.png";

const ALL_ASSETS: string[] = [
  anPardazLogo,
  logoHekmat, logoMehr, logoHamrahAval, logoIrancell,
  logoAnsar, logoKarafarin, logoParsian, logoRefah, logoRightel,
  logoSarmayeh, logoShahr, logoTejarat, logoSanatMadan, logoMeli,
  logoMelal, logoToseeTaavon, logoDi, logoIranZamin, logoKeshavarzi,
  logoMaskan, logoResalat, logoSepah, logoGardeshgari, logoToseeSaderat,
  logoPostBank, logoMellat,
  slide2Img, slide3Img,
  billImgHamrah, billImgIrancell, billImgAb, billImgBrq,
  billImgMakhab, billImgGaz,
  charityLogoKomite, charityLogoRedCrescent, charityLogoChildren,
  charityLogoBarekat, charityLogoEnvironment,
];

// Fire and forget — browser will cache these responses.
// High-priority images load first; the rest follow.
const HIGH_PRIORITY = [anPardazLogo, logoMellat, logoMeli, logoHamrahAval, logoIrancell, logoRightel];

function preloadImage(src: string, priority: "high" | "low" = "low"): void {
  const img = new Image();
  if (priority === "high") {
    (img as HTMLImageElement & { fetchpriority?: string }).fetchpriority = "high";
    img.decoding = "sync";
  } else {
    img.decoding = "async";
  }
  img.src = src;
}

HIGH_PRIORITY.forEach(src => preloadImage(src, "high"));
ALL_ASSETS.filter(src => !HIGH_PRIORITY.includes(src)).forEach(src => preloadImage(src, "low"));
