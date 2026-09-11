import type { BabyEventKey, BabyProfile } from '../types';

export type ReminderCategory =
  | 'feeding' | 'nappy' | 'sleep' | 'bath' | 'umbilical' | 'vitamins'
  | 'physical' | 'vision' | 'hearing' | 'communication' | 'social'
  | 'teeth' | 'weaning' | 'allergens' | 'vaccination' | 'safety'
  | 'play' | 'bonding' | 'newborn';

export type ReminderPriority = 'important' | 'action' | 'development' | 'tip';
export type ReminderTrigger = 'exact_day' | 'event_based';
export type FeedingMethod = NonNullable<BabyProfile['feedingMethod']>;

export interface BabyReminder {
  id: string;
  emoji: string;
  title: string;
  shortText: string;
  detailText: string;
  category: ReminderCategory;
  priority: ReminderPriority;
  triggerType: ReminderTrigger;
  startDay: number;
  eventKey?: BabyEventKey;
  eventCondition?: 'set' | 'unset';
  feedingMethods?: FeedingMethod[];
  guideTargetId?: string;
  sourceName?: string;
  sourceUrl?: string;
}

export interface ReminderSource {
  sourceName: string;
  sourceUrl: string;
}

const SOURCES = {
  sleep: { sourceName: 'NHS', sourceUrl: 'https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/' },
  feeding: { sourceName: 'NHS Best Start in Life', sourceUrl: 'https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/' },
  newborn: { sourceName: 'NHS', sourceUrl: 'https://www.nhs.uk/baby/caring-for-a-newborn/' },
  bath: { sourceName: 'NHS', sourceUrl: 'https://www.nhs.uk/baby/caring-for-a-newborn/washing-and-bathing-your-baby/' },
  vitamins: { sourceName: 'NHS Best Start in Life', sourceUrl: 'https://www.nhs.uk/best-start-in-life/baby/baby-basics/caring-for-your-baby/vitamins-for-babies/' },
  development: { sourceName: 'NHS Best Start in Life', sourceUrl: 'https://www.nhs.uk/best-start-in-life/baby/baby-moves/' },
  weaning: { sourceName: 'NHS Best Start in Life', sourceUrl: 'https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/' },
  allergens: { sourceName: 'NHS', sourceUrl: 'https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/' },
  safety: { sourceName: 'NHS', sourceUrl: 'https://www.nhs.uk/baby/first-aid-and-safety/safety/baby-and-toddler-safety/' },
  vaccine: { sourceName: 'UKHSA／GOV.UK', sourceUrl: 'https://www.gov.uk/government/publications/routine-childhood-immunisation-schedule/routine-childhood-immunisations-from-1-july-2026' },
} satisfies Record<string, ReminderSource>;

type ReminderEntry = Omit<BabyReminder, 'sourceName' | 'sourceUrl'> & { source?: ReminderSource };

function r(entry: ReminderEntry): BabyReminder {
  const { source, ...content } = entry;
  return { ...source, ...content };
}

/**
 * One-shot age timeline.
 * Every entry belongs to one specific baby-age day. It is deliberately NOT a
 * long-lived eligibility window, so old advice never piles up into a backlog.
 * Developmental wording stays approximate even though the card is scheduled
 * on one representative day.
 */
export const babyReminders: BabyReminder[] = [
  r({ id: 'day0-first-bath', emoji: '🛁', title: '今日唔使急住沖涼', shortText: 'BB 啱啱出世，先以保暖、skin-to-skin 同餵奶為主；第一次浸浴唔需要即刻做。', detailText: '初生頭一日通常唔需要急住浸浴。先俾 BB 穩定體溫、食奶同休息；之後再按 BB 狀況同醫護建議開始。', category: 'bath', priority: 'action', triggerType: 'exact_day', startDay: 0, guideTargetId: 'nappies-care', source: SOURCES.bath }),
  r({ id: 'day0-safe-sleep', emoji: '😴', title: '第一晚記住：每次都仰睡', shortText: '日頭同夜晚都一樣，BB 睡覺要仰睡，睡床保持平坦、堅實同清空。', detailText: '初生 BB 每一次睡眠都應仰睡；避免枕頭、床圍、鬆散被鋪同玩具。', category: 'sleep', priority: 'important', triggerType: 'exact_day', startDay: 0, guideTargetId: 'sleep', source: SOURCES.sleep }),
  r({ id: 'day1-meconium', emoji: '💩', title: '黑色黏便便係胎糞', shortText: '頭一兩日見到深綠黑、好黏嘅便便通常係胎糞，之後會慢慢轉色。', detailText: '胎糞通常會由深綠黑逐步轉成較淺色。記錄趨勢比單次顏色更有用。', category: 'nappy', priority: 'development', triggerType: 'exact_day', startDay: 1, guideTargetId: 'nappies-care', source: SOURCES.newborn }),
  r({ id: 'day1-cord', emoji: '🧡', title: '臍帶先保持乾爽', shortText: '而家最重要係保持臍帶清潔乾爽，唔好拉、唔好刻意剝。', detailText: '如果臍帶位置污糟，可以按護理指引用清水清潔，再輕輕拍乾，等佢自然乾枯脫落。', category: 'umbilical', priority: 'action', triggerType: 'exact_day', startDay: 1, guideTargetId: 'nappies-care', source: SOURCES.newborn }),
  r({ id: 'day2-first-bath-ready', emoji: '🛁', title: '今日開始可以考慮第一次沖涼', shortText: '如果 BB 情況穩定，可以開始試第一次短時間沖涼；唔需要日日洗。', detailText: '水溫、房溫同用品先準備好，整個過程保持短同舒服。臍帶未甩唔代表一定唔可以沖涼，但之後要輕輕印乾。', category: 'bath', priority: 'action', triggerType: 'exact_day', startDay: 2, guideTargetId: 'nappies-care', source: SOURCES.bath }),
  r({ id: 'day2-face-contrast', emoji: '👀', title: 'BB 最鍾意近距離望人臉', shortText: '而家視力仲好初步，近距離人臉同高對比黑白圖案通常最容易吸引佢。', detailText: '唔需要用複雜玩具；抱近少少、慢慢移動你塊面或者黑白卡已經係好刺激。', category: 'vision', priority: 'development', triggerType: 'exact_day', startDay: 2, guideTargetId: 'timeline', source: SOURCES.development }),
  r({ id: 'day3-poo-transition', emoji: '💩', title: '便便可能開始由黑轉綠／黃', shortText: '呢幾日胎糞通常會慢慢轉色，見到顏色變化唔一定係有問題。', detailText: '由深色胎糞過渡到較綠、啡、黃係常見過程；餵哺方式亦會影響便便外觀。', category: 'nappy', priority: 'development', triggerType: 'exact_day', startDay: 3, guideTargetId: 'nappies-care', source: SOURCES.newborn }),
  r({ id: 'day3-bath-no-hair-needed', emoji: '🛁', title: '沖涼唔一定次次洗頭', shortText: '初生 BB 唔需要每次沖涼都洗頭；短時間洗身、保持舒服已經可以。', detailText: 'BB 皮膚幼嫩，過度清洗反而容易乾。按實際需要清潔就得。', category: 'bath', priority: 'tip', triggerType: 'exact_day', startDay: 3, guideTargetId: 'nappies-care', source: SOURCES.bath }),
  r({ id: 'day4-feeding-frequency', emoji: '🍼', title: '密密食奶可以係正常', shortText: '初生頭幾日有時會密密食，唔需要用「每隔幾多鐘」一刀切判斷。', detailText: '留意早期肚餓訊號、吞嚥、食完反應、尿片同體重趨勢，比淨係睇鐘更有用。', category: 'feeding', priority: 'development', triggerType: 'exact_day', startDay: 4, guideTargetId: 'feeding', source: SOURCES.feeding }),
  r({ id: 'day4-cord-darkening', emoji: '🧡', title: '臍帶變乾、變深色通常係正常', shortText: '呢幾日臍帶可能明顯乾縮、變黑，通常係自然脫落前嘅過程。', detailText: '唔好因為見到乾黑就剪或拉；等佢自己甩。', category: 'umbilical', priority: 'development', triggerType: 'exact_day', startDay: 4, guideTargetId: 'nappies-care', source: SOURCES.newborn }),
  r({ id: 'day5-wet-nappies', emoji: '🚼', title: '第 5 日開始特別留意濕尿片', shortText: '去到呢個階段，濕尿片數量通常應明顯增加；今日開始可以更留意每日趨勢。', detailText: '濕尿片係判斷攝取情況嘅其中一個線索。如果明顯少過平時、BB 精神差或你有疑慮，應盡快問醫護。', category: 'nappy', priority: 'important', triggerType: 'exact_day', startDay: 5, guideTargetId: 'days-3-7', source: SOURCES.newborn }),
  r({ id: 'day6-cluster-feeding', emoji: '🍼', title: '今晚突然密密食？可能係 cluster feeding', shortText: '有啲初生 BB 會一段時間密密要求食奶，尤其黃昏或夜晚。', detailText: '密密食唔代表一定「唔夠奶」；仍要綜合吞嚥、尿片、體重同 BB 狀態判斷。', category: 'feeding', priority: 'development', triggerType: 'exact_day', startDay: 6, guideTargetId: 'feeding', source: SOURCES.feeding }),
  r({ id: 'day7-week-one', emoji: '👶', title: '一星期大：開始認熟你把聲', shortText: 'BB 出世前已經聽過熟悉聲音，而家同佢講嘢、唱歌會慢慢建立熟悉感。', detailText: '面對面、慢慢講、停一停等 BB 反應，就已經係非常好嘅早期互動。', category: 'hearing', priority: 'development', triggerType: 'exact_day', startDay: 7, guideTargetId: 'timeline', source: SOURCES.development }),
  r({ id: 'day8-cord-window', emoji: '🧡', title: '呢幾日臍帶可能開始自然甩', shortText: '好多 BB 會喺頭一至兩星期左右甩臍帶；就算淨返少少連住都唔好拉。', detailText: '自然脫落時間每個 BB 唔同。甩咗之後保持位置清潔乾爽；如果持續出血、紅腫、流膿或有臭味要問醫護。', category: 'umbilical', priority: 'action', triggerType: 'exact_day', startDay: 8, guideTargetId: 'nappies-care', source: SOURCES.newborn }),
  r({ id: 'day9-tummy-on-chest', emoji: '🤸', title: '可以由胸口 tummy time 開始', shortText: 'BB 清醒而你全程睇住時，可以先伏喺你胸口短短一陣。', detailText: '由好短時間開始，BB 唔舒服就停。要瞓覺時仍然要仰睡。', category: 'physical', priority: 'development', triggerType: 'exact_day', startDay: 9, guideTargetId: 'weeks-3-4', source: SOURCES.development }),
  r({ id: 'day10-nails', emoji: '✂️', title: '望下指甲會唔會開始刮面', shortText: '初生 BB 指甲可以長得幾快；今日可以檢查下有冇尖角開始刮到自己。', detailText: '如果需要修剪，可以揀 BB 熟睡或好安靜時做，逐隻手指慢慢處理，避免剪得太貼。', category: 'newborn', priority: 'tip', triggerType: 'exact_day', startDay: 10, guideTargetId: 'nappies-care', source: SOURCES.newborn }),
  r({ id: 'day11-skin-peeling', emoji: '🧴', title: '皮膚有少少脫皮未必需要搽好多嘢', shortText: '初生頭幾星期手腳有少少乾、脫皮幾常見，通常會慢慢改善。', detailText: '避免過度清洗同太多香料產品；如果紅腫、滲液或令 BB 明顯唔舒服就問醫護。', category: 'newborn', priority: 'tip', triggerType: 'exact_day', startDay: 11, guideTargetId: 'nappies-care', source: SOURCES.newborn }),
  r({ id: 'day12-voice-turn', emoji: '👂', title: '留意 BB 會唔會對熟悉聲音有反應', shortText: '呢個階段你可能開始見到 BB 聽到你把聲時安靜、眨眼或者有細微反應。', detailText: '唔需要測試佢；日常講嘢、唱歌同安靜互動已經足夠。', category: 'hearing', priority: 'development', triggerType: 'exact_day', startDay: 12, guideTargetId: 'timeline', source: SOURCES.development }),
  r({ id: 'day13-bath-frequency', emoji: '🛁', title: 'BB 唔需要日日沖涼', shortText: '一星期幾次通常已經夠，其他日子重點清潔面、頸摺、手同下身。', detailText: '過度清洗容易令皮膚乾；按實際污糟程度同 BB 皮膚狀況調整。', category: 'bath', priority: 'tip', triggerType: 'exact_day', startDay: 13, guideTargetId: 'nappies-care', source: SOURCES.bath }),
  r({ id: 'day14-two-weeks', emoji: '👀', title: '兩星期大：近距離望你會越來越有反應', shortText: '你可能開始見到 BB 望面耐咗少少，或者短暫追住慢慢移動嘅目標。', detailText: '視覺發展係漸進嘅，每個 BB 速度唔同；用近距離人臉同簡單高對比圖案就夠。', category: 'vision', priority: 'development', triggerType: 'exact_day', startDay: 14, guideTargetId: 'timeline', source: SOURCES.development }),
  r({ id: 'day15-tummy-repeat', emoji: '🤸', title: 'tummy time 可以開始分幾次做', shortText: '如果之前已經試過，今日可以繼續用短時間、多次數方式慢慢累積。', detailText: '每次幾十秒至幾分鐘都可以，視乎 BB 接受程度；全程清醒及有人看守。', category: 'physical', priority: 'development', triggerType: 'exact_day', startDay: 15, guideTargetId: 'weeks-3-4', source: SOURCES.development }),
  r({ id: 'day16-face-mimic', emoji: '😊', title: '試下慢慢模仿 BB 表情', shortText: '近距離同 BB 對望、慢慢張口、笑或者伸舌，可能會見到佢開始留意。', detailText: '唔需要追求佢即刻模仿；重點係建立來回互動。', category: 'social', priority: 'development', triggerType: 'exact_day', startDay: 16, guideTargetId: 'months-2-3', source: SOURCES.development }),
  r({ id: 'day17-head-support', emoji: '🤱', title: '抱起時仍然要穩穩承托頭頸', shortText: '頸力會慢慢進步，但而家仲未到可以放鬆承托嘅階段。', detailText: '抱起、放低、掃風同轉手時都繼續托實頭頸。', category: 'physical', priority: 'action', triggerType: 'exact_day', startDay: 17, guideTargetId: 'weeks-3-4', source: SOURCES.development }),
  r({ id: 'day18-day-night', emoji: '🌙', title: '開始慢慢幫 BB 分日夜', shortText: '日頭可以保持正常光線同生活聲，夜晚就減低燈光同刺激。', detailText: '初生睡眠仍然好零碎，唔需要期望即刻建立固定作息；只係用環境慢慢提供日夜線索。', category: 'sleep', priority: 'tip', triggerType: 'exact_day', startDay: 18, guideTargetId: 'sleep', source: SOURCES.sleep }),
  r({ id: 'day19-hands-mouth', emoji: '🖐️', title: '食手唔一定代表肚餓', shortText: 'BB 開始多啲郁手掂面、放手近嘴邊，未必次次都係想食奶。', detailText: '要連同搵乳、轉頭、嘴郁、煩躁程度等訊號一齊睇。', category: 'feeding', priority: 'tip', triggerType: 'exact_day', startDay: 19, guideTargetId: 'feeding', source: SOURCES.feeding }),
  r({ id: 'day20-startle', emoji: '👶', title: '突然張開手腳嘅驚跳反射仲可以好明顯', shortText: '突然聲音或動作時 BB 張開手腳，呢個階段仍然常見。', detailText: '動作通常會隨神經系統成熟而慢慢減少；如果你對反應有疑慮，可喺例行檢查問 health visitor。', category: 'newborn', priority: 'development', triggerType: 'exact_day', startDay: 20, guideTargetId: 'timeline', source: SOURCES.development }),
  r({ id: 'day21-three-weeks', emoji: '👀', title: '三星期：追視可能開始清楚少少', shortText: '你可以用自己塊面或簡單圖案慢慢左右移，睇下 BB 會唔會短暫跟住望。', detailText: '唔需要當成測驗；視覺發展係逐步嘅，有時有反應、有時冇都可以。', category: 'vision', priority: 'development', triggerType: 'exact_day', startDay: 21, guideTargetId: 'weeks-3-4', source: SOURCES.development }),
  r({ id: 'day22-tummy-elbows', emoji: '🤸', title: 'tummy time 時可能開始試住抬少少頭', shortText: '有啲 BB 呢段時間會短暫抬頭或轉頭，但未穩定係好正常。', detailText: '繼續短時間練習，唔需要比較角度或維持幾耐。', category: 'physical', priority: 'development', triggerType: 'exact_day', startDay: 22, guideTargetId: 'weeks-3-4', source: SOURCES.development }),
  r({ id: 'day23-talk-pause', emoji: '🗣️', title: '講一句，停一停等 BB 回應', shortText: '今日可以試下同 BB 面對面講短句，再停幾秒等眼神、表情或聲音。', detailText: '呢種「一來一回」就係早期溝通，唔需要 BB 真係發到聲先算。', category: 'communication', priority: 'development', triggerType: 'exact_day', startDay: 23, guideTargetId: 'months-2-3', source: SOURCES.development }),
  r({ id: 'day24-nails-check', emoji: '✂️', title: '今日再望下 BB 指甲', shortText: '三星期左右指甲可能又長咗；有尖角就容易刮到面，可以趁熟睡時慢慢修。', detailText: '唔一定每次都要剪；先摸下邊位有冇尖，再決定。', category: 'newborn', priority: 'tip', triggerType: 'exact_day', startDay: 24, guideTargetId: 'nappies-care', source: SOURCES.newborn }),
  r({ id: 'day25-baby-acne', emoji: '🙂', title: '面仔出粒粒未必係敏感', shortText: '呢段時間有啲 BB 會出現初生嬰兒暗瘡樣粒粒，通常會自己慢慢退。', detailText: '避免擠、磨或亂搽藥膏；如果有水泡、滲液、發燒或 BB 明顯唔舒服就要問醫護。', category: 'newborn', priority: 'tip', triggerType: 'exact_day', startDay: 25, guideTargetId: 'nappies-care', source: SOURCES.newborn }),
  r({ id: 'day26-hair-scalp', emoji: '🧴', title: '頭皮有少少皮屑可以先溫和處理', shortText: '如果開始見到乾皮或頭皮屑，唔好大力摳；洗頭時溫和清潔就得。', detailText: '如果頭皮紅、滲液、範圍擴大或令 BB 唔舒服，再向 health visitor／GP 查詢。', category: 'newborn', priority: 'tip', triggerType: 'exact_day', startDay: 26, guideTargetId: 'nappies-care', source: SOURCES.newborn }),
  r({ id: 'day27-voice-social', emoji: '👂', title: '熟悉聲音可能開始更容易令 BB 安靜', shortText: '你可能發現 BB 聽到你把聲會停一停、望一望或者比較易安定。', detailText: '繼續用自然語氣講嘢同唱歌，唔需要開大聲音刺激。', category: 'hearing', priority: 'development', triggerType: 'exact_day', startDay: 27, guideTargetId: 'months-2-3', source: SOURCES.development }),
  r({ id: 'day28-four-weeks', emoji: '😊', title: '四星期：開始留意「社交笑」前奏', shortText: '有啲 BB 呢幾星期會越來越常望住人臉、表情放鬆，之後可能出現真正社交微笑。', detailText: '唔需要今日就識笑；好多 BB 要再過幾星期先明顯。', category: 'social', priority: 'development', triggerType: 'exact_day', startDay: 28, guideTargetId: 'months-2-3', source: SOURCES.development }),
  r({ id: 'day30-one-month', emoji: '👀', title: '一個月：開始加入多啲簡單顏色', shortText: 'BB 視覺仲係發展中，除咗黑白高對比，今日可以慢慢加入鮮明、簡單顏色。', detailText: '色彩視覺唔係某一日突然「開啟」，而係逐步成熟；簡單大圖形比細碎圖案容易睇。', category: 'vision', priority: 'development', triggerType: 'exact_day', startDay: 30, guideTargetId: 'months-2-3', source: SOURCES.development }),
  r({ id: 'day35-five-weeks', emoji: '🤸', title: '五星期：tummy time 可以慢慢加長', shortText: '如果 BB 接受，可以將每日 tummy time 分幾次慢慢累積多啲。', detailText: '每次仍然以 BB 舒服為先；清醒、有人看守，瞓覺就仰睡。', category: 'physical', priority: 'development', triggerType: 'exact_day', startDay: 35, guideTargetId: 'months-2-3', source: SOURCES.development }),
  r({ id: 'day42-six-weeks-smile', emoji: '😊', title: '六星期左右：可能開始見到真正社交微笑', shortText: '有啲 BB 呢段時間會開始因為見到你、聽到你而笑，唔再只係睡夢反射。', detailText: '時間差異可以幾大；用面對面互動、講嘢同笑容回應就好。', category: 'social', priority: 'development', triggerType: 'exact_day', startDay: 42, guideTargetId: 'months-2-3', source: SOURCES.development }),
  r({ id: 'day49-vaccine-soon', emoji: '💉', title: '8 星期疫苗就快到', shortText: '仲有大約一星期到 8 星期例行疫苗時間，可以留意 GP 有冇 appointment 安排。', detailText: '實際安排以 GP／Red Book／最新 England schedule 為準；呢個提醒唔代表預約已經自動完成。', category: 'vaccination', priority: 'action', triggerType: 'exact_day', startDay: 49, guideTargetId: 'vaccinations', source: SOURCES.vaccine }),
  r({ id: 'day56-eight-week-vaccine', emoji: '💉', title: '今日到 8 星期疫苗時間點', shortText: 'BB 今日 8 星期大，通常係 England 第一輪 routine vaccination 嘅時間點。', detailText: '核對 GP appointment 同 Red Book；如日期有改動，以醫護安排為準。', category: 'vaccination', priority: 'important', triggerType: 'exact_day', startDay: 56, guideTargetId: 'vaccinations', source: SOURCES.vaccine }),
  r({ id: 'day63-nine-weeks-hands', emoji: '🖐️', title: '開始留意 BB 對自己隻手有興趣', shortText: '有啲 BB 呢段時間會多啲望手、張開拳頭或者將手帶近嘴邊。', detailText: '呢啲都係逐步發展嘅手眼協調前奏，唔需要訓練到做到先算。', category: 'physical', priority: 'development', triggerType: 'exact_day', startDay: 63, guideTargetId: 'months-2-3', source: SOURCES.development }),
  r({ id: 'day70-ten-weeks-colour', emoji: '🌈', title: '色彩世界開始豐富好多', shortText: '兩個幾月時，BB 對鮮明顏色同較複雜圖案可能越來越有興趣。', detailText: '視覺係連續發展，唔係今日突然由黑白變彩色；可以慢慢加入紅、黃、藍等鮮明物件。', category: 'vision', priority: 'development', triggerType: 'exact_day', startDay: 70, guideTargetId: 'months-2-3', source: SOURCES.development }),
  r({ id: 'day77-cooing', emoji: '🗣️', title: '可能開始聽到更多「咕咕」聲', shortText: '有啲 BB 呢段時間會開始用唔同小聲音回應你，可以同佢一來一回。', detailText: '你講一句、等佢發聲，再回應，已經係好好嘅早期語言互動。', category: 'communication', priority: 'development', triggerType: 'exact_day', startDay: 77, guideTargetId: 'months-2-3', source: SOURCES.development }),
  r({ id: 'day84-twelve-week-vaccine', emoji: '💉', title: '今日到 12 星期疫苗時間點', shortText: 'BB 今日 12 星期大，通常係下一輪 routine vaccination 嘅時間點。', detailText: '核對 GP appointment 同最新 England schedule；實際接種日期可以因安排而不同。', category: 'vaccination', priority: 'important', triggerType: 'exact_day', startDay: 84, guideTargetId: 'vaccinations', source: SOURCES.vaccine }),
  r({ id: 'day91-three-months-head', emoji: '🤸', title: '三個月左右：頭頸控制通常會明顯進步', shortText: '你可能開始覺得抱起同 tummy time 時個頭穩定咗，但仍要按實際能力承托。', detailText: '每個 BB 速度唔同；未穩時繼續托頭頸，唔好因為「夠三個月」就突然停止。', category: 'physical', priority: 'development', triggerType: 'exact_day', startDay: 91, guideTargetId: 'months-2-3', source: SOURCES.development }),
  r({ id: 'day98-grab', emoji: '🧸', title: '開始試下俾 BB 掂輕身玩具', shortText: '有啲 BB 呢段時間會開始更主動伸手、拍或短暫捉住物件。', detailText: '選大件、輕身、冇細小甩脫部件嘅玩具，放近中線俾佢自己探索。', category: 'play', priority: 'development', triggerType: 'exact_day', startDay: 98, guideTargetId: 'months-2-3', source: SOURCES.development }),
  r({ id: 'day105-rolling-warning', emoji: '⚠️', title: '未識翻身都要當佢隨時會識', shortText: '去到呢個階段，唔好再將 BB 單獨放喺床、梳化或換片枱等高處。', detailText: '翻身能力可以突然進步；高處跌落風險往往早過父母預期。', category: 'safety', priority: 'important', triggerType: 'exact_day', startDay: 105, guideTargetId: 'safety', source: SOURCES.safety }),
  r({ id: 'day112-sixteen-week-vaccine', emoji: '💉', title: '今日到 16 星期疫苗時間點', shortText: 'BB 今日 16 星期大，通常係嬰兒期下一輪 routine vaccination 嘅時間點。', detailText: '核對 GP appointment、Red Book 同最新 England schedule；實際日期以醫護安排為準。', category: 'vaccination', priority: 'important', triggerType: 'exact_day', startDay: 112, guideTargetId: 'vaccinations', source: SOURCES.vaccine }),
  r({ id: 'day120-four-months-teething', emoji: '🦷', title: '四個月左右：出牙跡象可能開始出現', shortText: '有啲 BB 會開始口水多、鍾意咬嘢，但第一隻牙幾時出可以差好遠。', detailText: '唔好將流口水一律當出牙；如果 BB 發燒或明顯唔舒服，要按症狀另外判斷。', category: 'teeth', priority: 'development', triggerType: 'exact_day', startDay: 120, guideTargetId: 'months-5-6', source: SOURCES.newborn }),
  r({ id: 'day135-babyproof', emoji: '🏠', title: '未識爬都可以開始 baby-proofing', shortText: '趁 BB 仲未四圍郁，今日可以由地面高度睇一次電線、細物件、櫃門同跌落風險。', detailText: '重點係提前做，而唔係等識爬先開始。', category: 'safety', priority: 'action', triggerType: 'exact_day', startDay: 135, guideTargetId: 'safety', source: SOURCES.safety }),
  r({ id: 'day150-five-months-solids', emoji: '🥣', title: '五個月：可以開始認識加固準備訊號', shortText: '唔使急住餵糊仔；先留意頭頸控制、坐姿穩定、手眼協調同吞嚥能力。', detailText: '一般大約 6 個月先開始 solids。夜醒、食手或想食多啲奶本身唔代表一定準備好。', category: 'weaning', priority: 'development', triggerType: 'exact_day', startDay: 150, guideTargetId: 'months-5-6', source: SOURCES.weaning }),
  r({ id: 'day165-high-chair', emoji: '🪑', title: '準備加固前先試好 high chair', shortText: '如果就快開始 solids，可以先確認座椅穩固、BB 坐姿直、腳位同安全帶合適。', detailText: '呢樣係開始食固體前準備，唔好等第一餐先臨急裝。', category: 'weaning', priority: 'action', triggerType: 'exact_day', startDay: 165, guideTargetId: 'months-5-6', source: SOURCES.weaning }),
  r({ id: 'day180-six-months-solids', emoji: '🥦', title: '六個月左右：可以開始探索固體食物', shortText: '如果 BB 已有準備好嘅訊號，可以由少量開始；奶仍然係重要營養來源。', detailText: '可逐步接觸 mashed、較有質感食物同安全 finger food，唔需要長時間只食完全幼滑糊仔。', category: 'weaning', priority: 'action', triggerType: 'exact_day', startDay: 180, guideTargetId: 'months-5-6', source: SOURCES.weaning }),
  r({ id: 'day181-allergens', emoji: '🥚', title: '開始 solids 後：致敏食物逐樣試', shortText: '雞蛋、花生等常見致敏食物可以按指引由少量、逐一引入，方便觀察反應。', detailText: '如果 BB 有嚴重濕疹、已知食物過敏或醫護曾特別提醒，先按專業建議安排。', category: 'allergens', priority: 'action', triggerType: 'exact_day', startDay: 181, guideTargetId: 'months-5-6', source: SOURCES.allergens }),
  r({ id: 'day182-cup', emoji: '🥤', title: '開始食 solids，可以順便學飲杯', shortText: '餐時可以提供少量水，慢慢試 open cup 或 free-flow cup。', detailText: '最初只係練習，灑出嚟好多好正常。', category: 'weaning', priority: 'development', triggerType: 'exact_day', startDay: 182, guideTargetId: 'months-5-6', source: SOURCES.weaning }),
  r({ id: 'day183-texture', emoji: '🥣', title: '唔好只停留喺完全幼滑糊仔', shortText: '能力許可時，可以慢慢加入 mashed、lumpy 同安全 finger food，俾 BB 練口腔協調。', detailText: '食物要煮軟、切成合適形狀，BB 要坐直並有人全程看守。', category: 'weaning', priority: 'development', triggerType: 'exact_day', startDay: 183, guideTargetId: 'months-5-6', source: SOURCES.weaning }),
  r({ id: 'day210-seven-months-mobility', emoji: '🚼', title: '七個月左右：移動能力可能突然加速', shortText: '有啲 BB 會開始轉圈、向後移、匍匐或者準備爬，地面安全要重新檢查。', detailText: '唔係每個 BB 都用同一方式移動；重點係環境安全，而唔係追住 milestone 日期。', category: 'physical', priority: 'development', triggerType: 'exact_day', startDay: 210, guideTargetId: 'safety', source: SOURCES.development }),
  r({ id: 'day240-eight-months-pincer', emoji: '🤏', title: '八個月左右：手指精細動作開始進步', shortText: '你可能見到 BB 由成隻手抓，慢慢變成用手指更準確咁拎食物或玩具。', detailText: '細小物件嘅窒息風險亦會同步增加，要再檢查地面同家具縫位。', category: 'physical', priority: 'development', triggerType: 'exact_day', startDay: 240, guideTargetId: 'safety', source: SOURCES.development }),
  r({ id: 'day270-nine-months-object', emoji: '🧸', title: '九個月左右：開始理解「睇唔到都仲喺度」', shortText: '躲貓貓、用布遮住一半玩具再搵返，會開始變得特別有趣。', detailText: '呢類遊戲幫助理解 object permanence，同時練習互動同等待。', category: 'play', priority: 'development', triggerType: 'exact_day', startDay: 270, guideTargetId: 'months-2-3', source: SOURCES.development }),
  r({ id: 'day300-ten-months-stand', emoji: '🧍', title: '十個月左右：家具突然變成練站工具', shortText: '有啲 BB 會開始扶住家具拉自己起身，記得固定容易翻倒嘅家具。', detailText: '唔需要催佢企；只要提供安全地面同穩固支撐，等佢自己探索。', category: 'safety', priority: 'important', triggerType: 'exact_day', startDay: 300, guideTargetId: 'safety', source: SOURCES.safety }),
  r({ id: 'day330-eleven-months-cup', emoji: '🥤', title: '十一個月：飲杯可以再多啲練習', shortText: '如果之前已開始用杯，今日可以慢慢增加餐時自己拎杯飲水嘅機會。', detailText: '預咗會倒瀉；重點係練協調，唔係一次過取代所有奶樽。', category: 'weaning', priority: 'development', triggerType: 'exact_day', startDay: 330, guideTargetId: 'months-5-6', source: SOURCES.weaning }),
  r({ id: 'day350-one-year-vaccine-soon', emoji: '💉', title: '一歲疫苗就快到', shortText: '第一個生日就快到，可以留意 GP 有冇下一輪 routine vaccination 安排。', detailText: '實際疫苗內容同日期以最新 England schedule、GP 同 Red Book 為準。', category: 'vaccination', priority: 'action', triggerType: 'exact_day', startDay: 350, guideTargetId: 'vaccinations', source: SOURCES.vaccine }),
  r({ id: 'day365-first-birthday', emoji: '🎂', title: '一歲啦：今日值得做一次成長回顧', shortText: '可以回顧食物質感、飲杯、牙齒、活動能力同安全環境，睇下下一階段要調整啲咩。', detailText: '發展速度人人唔同；重點係整體進展同健康檢查，而唔係逐項同其他 BB 比。', category: 'development' as ReminderCategory, priority: 'development', triggerType: 'exact_day', startDay: 365, guideTargetId: 'timeline', source: SOURCES.development }),
];

export const BABY_REMINDER_COUNT = babyReminders.length;
