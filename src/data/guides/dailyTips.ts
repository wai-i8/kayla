import type { IconName } from '../../components/Icon';

export interface DailyGuideTip {
  id: string;
  title: string;
  text: string;
  guideTargetId: string;
  icon: IconName;
  fromDays?: number;
  toDays?: number;
}

/**
 * Short homepage reminders adapted from the existing, source-reviewed guide
 * topics. guideTargetId always points to an existing guide topic or timeline
 * anchor so the full context and official sources stay one tap away.
 */
export const dailyGuideTips = [
  {
    id: 'notice-early-feeding-cues',
    title: '留意早期肚餓訊號',
    text: 'BB 搵乳、郁嘴、食手或轉頭時已可以回應，唔使等到喊先餵。',
    guideTargetId: 'feeding',
    icon: 'bottle',
  },
  {
    id: 'feeds-vary',
    title: '每餐長短可以唔同',
    text: '唔使單靠分鐘判斷；仲要留意吞嚥、食完反應、尿片同體重趨勢。',
    guideTargetId: 'feeding',
    icon: 'clock',
  },
  {
    id: 'responsive-bottle',
    title: '奶樽保持近水平',
    text: '抱 BB 半直坐並承托頭頸；見到要停嘅訊號就休息，唔好逼佢飲完。',
    guideTargetId: 'feeding',
    icon: 'bottle',
  },
  {
    id: 'fresh-formula',
    title: '每餐新鮮沖配方奶',
    text: '按完整安全步驟先落準確水量、再落平匙奶粉，冷卻至合適溫度先餵；飲剩嘅奶要倒走。',
    guideTargetId: 'feeding',
    icon: 'bottle',
  },
  {
    id: 'vitamin-d',
    title: '核對維他命 D',
    text: '全母乳或混合餵哺 BB 通常由出生起需要維他命 D；純配方奶每日飲到約 500 mL 通常唔使另加。只跟標籤或醫護指示。',
    guideTargetId: 'feeding',
    icon: 'medicine',
    toDays: 183,
  },
  {
    id: 'sleep-on-back',
    title: '每次瞓覺都要仰睡',
    text: '日頭小睡同夜晚一樣：仰睡、平坦堅實獨立睡床，床內保持清空。',
    guideTargetId: 'sleep',
    icon: 'moon',
  },
  {
    id: 'sleep-room-temperature',
    title: '摸胸口或後頸試冷熱',
    text: '手腳偏涼可以正常；如果出汗或胸口摸落熱，就減一層衣物。',
    guideTargetId: 'sleep',
    icon: 'temperature',
  },
  {
    id: 'safe-place-after-waking',
    title: '初醒時先輕輕回應',
    text: 'BB 醒咗但仍安靜時，可以先望住佢、輕聲講嘢，再跟食奶或互動訊號回應。',
    guideTargetId: 'timeline',
    icon: 'user',
  },
  {
    id: 'change-on-floor',
    title: '換片最好喺地墊做',
    text: '先將用品放手邊，唔好留 BB 喺床、梳化或換片枱邊，就算一陣都唔得。',
    guideTargetId: 'nappies-care',
    icon: 'nappy',
  },
  {
    id: 'poo-transition',
    title: '便便顏色會逐步轉變',
    text: '最初胎糞多數深綠黑，之後會轉啡綠、再變黃；記錄幾日趨勢比單次更有用。',
    guideTargetId: 'nappies-care',
    icon: 'nappy',
    toDays: 28,
  },
  {
    id: 'wet-nappy-trend',
    title: '由第 5 日起留意濕尿片',
    text: '通常每 24 小時至少 6 塊重濕或明顯濕尿片；明顯少咗要盡快問醫護。',
    guideTargetId: 'days-3-7',
    icon: 'nappy',
    fromDays: 4,
    toDays: 28,
  },
  {
    id: 'cord-dry',
    title: '臍帶保持清潔乾爽',
    text: '污糟先用清水洗，再輕輕拍乾，等佢自然脫落。',
    guideTargetId: 'nappies-care',
    icon: 'shield',
    toDays: 28,
  },
  {
    id: 'bath-never-alone',
    title: '沖涼任何時候都唔離手',
    text: '門鐘、電話同漏咗嘅用品都等得；要走開就先抱 BB 出水。',
    guideTargetId: 'nappies-care',
    icon: 'shield',
  },
  {
    id: 'nappy-rash-air',
    title: '尿布疹要溫和清潔',
    text: '密啲換片、輕輕拍乾同俾皮膚透氣；唔好用爽身粉。',
    guideTargetId: 'nappies-care',
    icon: 'nappy',
  },
  {
    id: 'temperature-under-arm',
    title: '體溫用數碼溫度計量腋下',
    text: '將探頭放腋下、手臂貼實身體；記埋數值、時間同量度位置。',
    guideTargetId: 'symptoms',
    icon: 'temperature',
  },
  {
    id: 'safe-pause',
    title: '頂唔順可以安全停一停',
    text: '將 BB 仰睡放入清空、安全睡床，離開幾分鐘冷靜，再返去查看；絕對唔好搖 BB。',
    guideTargetId: 'caregiver-wellbeing',
    icon: 'user',
  },
  {
    id: 'car-seat-rear-facing',
    title: '每程都用後向式安全座椅',
    text: '跟座椅說明正確安裝同調校安全帶；後向式放前座必須關掉氣袋。',
    guideTargetId: 'safety',
    icon: 'shield',
  },
  {
    id: 'small-hazards-up-high',
    title: '細小危險物鎖好放高',
    text: '鈕扣電池、細磁石、藥物同細小物件都要離開 BB 手可及範圍。',
    guideTargetId: 'safety',
    icon: 'shield',
  },
  {
    id: 'awake-tummy-time',
    title: '清醒時玩一陣 tummy time',
    text: '由短時間開始，全程看守、逐少增加；要瞓覺就放返仰睡。',
    guideTargetId: 'weeks-3-4',
    icon: 'user',
    fromDays: 14,
  },
  {
    id: 'talk-sing-pause',
    title: '講、唱，然後等 BB 回應',
    text: '面對面輕聲講嘢或唱歌，停一停等佢用眼神、表情或聲音回應。',
    guideTargetId: 'months-2-3',
    icon: 'user',
    fromDays: 28,
  },
  {
    id: 'no-rush-solids',
    title: '夜醒或食手唔等於要加固',
    text: '通常約 6 個月、同時見到頭頸控制、手眼協調同吞嚥能力先開始。',
    guideTargetId: 'months-5-6',
    icon: 'bottle',
    fromDays: 120,
  },
  {
    id: 'red-book-ready',
    title: '預約要帶 Red Book',
    text: '每次接種、篩查或見醫護前核對日期，並帶埋 Red Book 方便更新紀錄。',
    guideTargetId: 'vaccinations',
    icon: 'calendar',
  },
  {
    id: 'record-context',
    title: '記錄重點係俾醫護睇趨勢',
    text: '體溫、食奶、尿片同症狀時間線都有用；記錄唔代表自行診斷。',
    guideTargetId: 'using-and-recording',
    icon: 'records',
  },
] satisfies DailyGuideTip[];

function ukCalendarDay(timestamp: number) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(timestamp);
  const values = Object.fromEntries(parts.map((part) => [part.type, Number(part.value)]));
  return Math.floor(Date.UTC(values.year, values.month - 1, values.day) / 86_400_000);
}

export function getDailyGuideTip(ageDays: number, timestamp = Date.now()): DailyGuideTip {
  const normalisedAge = Math.max(0, Math.floor(ageDays));
  const eligible = dailyGuideTips.filter((tip) => (
    (tip.fromDays === undefined || normalisedAge >= tip.fromDays)
    && (tip.toDays === undefined || normalisedAge <= tip.toDays)
  ));
  const pool = eligible.length ? eligible : dailyGuideTips;
  return pool[ukCalendarDay(timestamp) % pool.length];
}
