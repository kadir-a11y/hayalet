export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const languageNames: Record<string, string> = {
  tr: "T\u00FCrk\u00E7e",
  en: "English",
  de: "Deutsch",
  fr: "Fran\u00E7ais",
  es: "Espa\u00F1ol",
  ar: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
  ru: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
  pt: "Portugu\u00EAs",
  ja: "\u65E5\u672C\u8A9E",
  zh: "\u4E2D\u6587",
  ko: "\uD55C\uAD6D\uC5B4",
  it: "Italiano",
  nl: "Nederlands",
  pl: "Polski",
  sv: "Svenska",
  hi: "\u0939\u093F\u0928\u094D\u0926\u0940",
  bn: "\u09AC\u09BE\u0982\u09B2\u09BE",
  ur: "\u0627\u0631\u062F\u0648",
  fa: "\u0641\u0627\u0631\u0633\u06CC",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  th: "\u0E44\u0E17\u0E22",
  vi: "Ti\u1EBFng Vi\u1EC7t",
  tl: "Filipino",
  el: "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC",
  cs: "\u010Ce\u0161tina",
  ro: "Rom\u00E2n\u0103",
  hu: "Magyar",
  da: "Dansk",
  no: "Norsk",
  fi: "Suomi",
  uk: "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430",
  he: "\u05E2\u05D1\u05E8\u05D9\u05EA",
  sw: "Kiswahili",
  az: "Az\u0259rbaycan",
  kk: "\u049A\u0430\u0437\u0430\u049B\u0448\u0430",
  uz: "O\u02BBzbek",
  ka: "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8",
  sr: "\u0421\u0440\u043F\u0441\u043A\u0438",
  hr: "Hrvatski",
  bg: "\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438",
  sq: "Shqip",
  ca: "Catal\u00E0",
  sk: "Sloven\u010Dina",
  lt: "Lietuvi\u0173",
  lv: "Latvie\u0161u",
  et: "Eesti",
  sl: "Sloven\u0161\u010Dina",
  mk: "\u041C\u0430\u043A\u0435\u0434\u043E\u043D\u0441\u043A\u0438",
};

export const usageLevelLabels: Record<string, string> = {
  none: "Hi\u00E7",
  minimal: "Minimal",
  moderate: "Orta",
  heavy: "Yo\u011Fun",
};

export const statusLabels: Record<string, string> = {
  draft: "Taslak",
  scheduled: "Zamanlanm\u0131\u015F",
  published: "Yay\u0131nlanm\u0131\u015F",
  failed: "Ba\u015Far\u0131s\u0131z",
};

export const statusColors: Record<string, string> = {
  draft: "secondary",
  scheduled: "outline",
  published: "default",
  failed: "destructive",
};

export const platformNames: Record<string, string> = {
  twitter: "X (Twitter)",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  threads: "Threads",
  pinterest: "Pinterest",
  reddit: "Reddit",
};

export function platformIcon(platform: string): string {
  const icons: Record<string, string> = {
    twitter: "X", instagram: "IG", facebook: "FB", linkedin: "LI",
    tiktok: "TT", youtube: "YT", threads: "TH", pinterest: "PI", reddit: "RD",
  };
  return icons[platform.toLowerCase()] || platform.slice(0, 2).toUpperCase();
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
