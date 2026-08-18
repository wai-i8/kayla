export type GuidePageRange = {
  from: number;
  to: number;
  label?: string;
};

export type GuideSection = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  pageRanges: GuidePageRange[];
  keywords: string[];
  priority?: "urgent" | "important" | "reference";
};

export type AgeTimelineSection = {
  id: string;
  ageLabel: string;
  title: string;
  pageRanges: GuidePageRange[];
};

/**
 * Publication context copied from raw.pdf. Medical guidance must retain this
 * context wherever it is presented in the app.
 */
export const guideSourceContext = {
  title: "初生 BB 由第 1 日到半歲",
  edition: "2026–27 英國版",
  region: "英格蘭（含 Nuneaton／Warwickshire）",
  checkedAt: "2026-08-18",
  notice:
    "本指南係安全導航，不係個別診斷。生命危險請即刻 call 999；急需判斷請 call NHS 111。早產、低出生體重或有特別醫療需要嘅 BB，應以醫院及醫護人員嘅個別指示為先。",
  sourcesPages: { from: 44, to: 46 },
} as const;

/** Main browse/search topics. Page numbers refer to the printed PDF pages. */
export const guideSections: GuideSection[] = [
  {
    id: "emergency",
    title: "緊急判斷與求助",
    shortTitle: "緊急",
    description: "999、NHS 111、紅旗病徵、嚴重過敏、哽塞及緊急精神健康情況。",
    pageRanges: [
      { from: 4, to: 5, label: "30 秒緊急判斷卡" },
      { from: 28, to: 28, label: "嚴重過敏與哽塞" },
      { from: 33, to: 37, label: "急救與病徵紅旗" },
      { from: 39, to: 39, label: "照顧者緊急紅旗" },
    ],
    keywords: ["999", "111", "A&E", "呼吸", "抽搐", "過敏", "哽塞", "紅旗"],
    priority: "urgent",
  },
  {
    id: "timeline",
    title: "0–6 個月時間線",
    shortTitle: "時間線",
    description: "由出生後兩小時開始，按日、週及月齡順序閱讀照顧重點。",
    pageRanges: [{ from: 6, to: 28, label: "路線圖與各月齡章節" }],
    keywords: ["日齡", "週齡", "月齡", "發展", "檢查", "里程碑"],
    priority: "important",
  },
  {
    id: "feeding",
    title: "餵奶與開始加固",
    shortTitle: "餵奶",
    description: "飢餓訊號、母乳、配方奶、奶量趨勢、安全沖奶、擠奶保存及約 6 個月加固。",
    pageRanges: [
      { from: 8, to: 14, label: "出生初期餵食與尿便趨勢" },
      { from: 25, to: 28, label: "加固準備與安全開始" },
      { from: 29, to: 31, label: "餵奶技能課" },
    ],
    keywords: ["母乳", "配方奶", "奶量", "含乳", "沖奶", "70°C", "擠奶", "加固"],
    priority: "important",
  },
  {
    id: "sleep",
    title: "安全睡眠",
    shortTitle: "睡眠",
    description: "仰睡、同房分床、清空睡床、室溫、睡袋、同床風險及睡眠常見問題。",
    pageRanges: [
      { from: 11, to: 12, label: "初生期安全睡眠" },
      { from: 17, to: 19, label: "睡眠節奏、安撫與 tummy time" },
      { from: 31, to: 32, label: "睡眠技能課" },
    ],
    keywords: ["仰睡", "同房分床", "cot", "睡袋", "同床", "梳化", "SIDS"],
    priority: "urgent",
  },
  {
    id: "first-aid",
    title: "嬰兒急救",
    shortTitle: "急救",
    description: "哽塞處理、無反應及無正常呼吸時嘅嬰兒 CPR 記憶輔助。",
    pageRanges: [
      { from: 28, to: 28, label: "gagging 與 choking 分辨" },
      { from: 33, to: 35, label: "哽塞與 CPR 技能課" },
    ],
    keywords: ["哽塞", "choking", "gagging", "CPR", "背拍", "胸推", "AED"],
    priority: "urgent",
  },
  {
    id: "symptoms",
    title: "病徵與分流",
    shortTitle: "病徵",
    description: "體溫、呼吸、反應、餵食、水分、皮疹、黃疸及藥物安全。",
    pageRanges: [
      { from: 11, to: 16, label: "新生期常見情況與紅旗" },
      { from: 19, to: 21, label: "疫苗後反應與求助" },
      { from: 28, to: 28, label: "食物過敏" },
      { from: 36, to: 37, label: "常見病徵分流技能課" },
    ],
    keywords: ["發燒", "體溫", "黃疸", "皮疹", "脫水", "嘔吐", "呼吸", "藥物"],
    priority: "urgent",
  },
  {
    id: "safety",
    title: "日常與家居安全",
    shortTitle: "安全",
    description: "洗澡、訪客感染、翻身、防跌、揹帶、car seat、玩具、炎熱天氣及家居安全。",
    pageRanges: [
      { from: 14, to: 18, label: "洗澡、尿片、感染與安撫安全" },
      { from: 22, to: 24, label: "翻身、外出與 car seat" },
      { from: 25, to: 28, label: "加固與食物安全" },
      { from: 37, to: 38, label: "家居、產品、陽光與炎熱天氣" },
    ],
    keywords: ["防跌", "洗澡", "唇瘡", "翻身", "揹帶", "car seat", "玩具", "防曬"],
    priority: "important",
  },
  {
    id: "caregiver-wellbeing",
    title: "照顧者身心健康",
    shortTitle: "照顧者",
    description: "哭鬧高峰、ICON 安全離開策略、產後情緒及身體緊急紅旗。",
    pageRanges: [
      { from: 18, to: 18, label: "哭鬧高峰與 ICON" },
      { from: 38, to: 39, label: "照顧者身心健康" },
    ],
    keywords: ["ICON", "哭鬧", "情緒", "產後抑鬱", "postpartum psychosis", "休息"],
    priority: "important",
  },
  {
    id: "checklists",
    title: "每月檢查清單",
    shortTitle: "清單",
    description: "由出生至 6 個月嘅月齡任務、安全重點同家庭準備清單。",
    pageRanges: [{ from: 40, to: 41, label: "每個月一頁檢查清單" }],
    keywords: ["checklist", "清單", "每月", "準備", "完成"],
    priority: "reference",
  },
  {
    id: "vaccinations",
    title: "疫苗與篩查日曆",
    shortTitle: "疫苗",
    description: "出生風險疫苗、8／12／16 週常規疫苗、MenB 後護理及疫苗日曆。",
    pageRanges: [
      { from: 10, to: 10, label: "乙肝與 BCG 風險安排" },
      { from: 19, to: 21, label: "8、12、16 週疫苗" },
      { from: 41, to: 41, label: "英格蘭疫苗日曆" },
    ],
    keywords: ["疫苗", "6-in-1", "MenB", "rotavirus", "pneumococcal", "BCG", "乙肝"],
    priority: "important",
  },
  {
    id: "local-help",
    title: "Nuneaton／Warwickshire 求助",
    shortTitle: "本地求助",
    description: "本地 maternity、health visiting、feeding support 同緊急求助入口；使用前需再核對最新服務資料。",
    pageRanges: [{ from: 42, to: 42, label: "本地求助頁" }],
    keywords: ["Nuneaton", "Warwickshire", "George Eliot Hospital", "midwife", "health visitor"],
    priority: "important",
  },
  {
    id: "using-and-recording",
    title: "使用說明與求醫記錄",
    shortTitle: "記錄表",
    description: "安全標籤、全書目錄、24 小時餵食尿片表、SBAR 求醫小抄及照顧者交更清單。",
    pageRanges: [
      { from: 1, to: 3, label: "封面、目錄與使用說明" },
      { from: 43, to: 43, label: "記錄表與 SBAR 小抄" },
    ],
    keywords: ["使用說明", "目錄", "SBAR", "記錄表", "交更", "求醫"],
    priority: "reference",
  },
  {
    id: "sources-and-version",
    title: "官方資料來源與版本",
    shortTitle: "資料來源",
    description: "NHS、UKHSA、GOV.UK、Resuscitation Council UK、本地服務來源及版本紀錄。",
    pageRanges: [{ from: 44, to: 46, label: "來源、取捨與版本紀錄" }],
    keywords: ["NHS", "UKHSA", "GOV.UK", "來源", "版本", "查核日期"],
    priority: "reference",
  },
];

/** Age-specific navigation used by the home page and guide filters. */
export const ageTimelineSections: AgeTimelineSection[] = [
  {
    id: "birth-2-hours",
    ageLabel: "出生後 0–2 小時",
    title: "先穩定，再相識",
    pageRanges: [{ from: 8, to: 10 }],
  },
  {
    id: "day-1",
    ageLabel: "第 1 日",
    title: "觀察、餵食與安全睡眠",
    pageRanges: [{ from: 10, to: 12 }],
  },
  {
    id: "days-2-3",
    ageLabel: "第 2–3 日",
    title: "奶量建立與黃疸",
    pageRanges: [{ from: 12, to: 14 }],
  },
  {
    id: "days-3-7",
    ageLabel: "第 3–7 日",
    title: "洗澡、臍帶、尿片與 blood spot",
    pageRanges: [{ from: 14, to: 16 }],
  },
  {
    id: "weeks-1-2",
    ageLabel: "第 1–2 週",
    title: "訪視、感染預防與安全適應",
    pageRanges: [{ from: 16, to: 17 }],
  },
  {
    id: "weeks-3-4",
    ageLabel: "第 3–4 週",
    title: "睡眠、哭鬧與 tummy time",
    pageRanges: [{ from: 17, to: 19 }],
  },
  {
    id: "weeks-5-8",
    ageLabel: "第 5–8 週",
    title: "GP 覆檢、疫苗與哭鬧高峰",
    pageRanges: [{ from: 19, to: 20 }],
  },
  {
    id: "months-2-3",
    ageLabel: "第 2–3 個月",
    title: "互動、活動與 12／16 週疫苗",
    pageRanges: [{ from: 20, to: 21 }],
  },
  {
    id: "months-3-4",
    ageLabel: "第 3–4 個月",
    title: "翻身與環境升級",
    pageRanges: [{ from: 22, to: 22 }],
  },
  {
    id: "months-4-5",
    ageLabel: "第 4–5 個月",
    title: "地面活動、出街與家居準備",
    pageRanges: [{ from: 23, to: 24 }],
  },
  {
    id: "months-5-6",
    ageLabel: "第 5–6 個月",
    title: "加固準備與安全開始",
    pageRanges: [{ from: 25, to: 28 }],
  },
];

export const getGuideSection = (id: string) =>
  guideSections.find((section) => section.id === id);
