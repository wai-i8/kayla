import type { BabyEventKey, BabyProfile } from '../types';

export type ReminderCategory =
  | 'feeding' | 'nappy' | 'sleep' | 'bath' | 'umbilical' | 'vitamins'
  | 'physical' | 'vision' | 'hearing' | 'communication' | 'social'
  | 'teeth' | 'weaning' | 'allergens' | 'vaccination' | 'safety'
  | 'play' | 'bonding' | 'newborn' | 'maternal';

export type ReminderPriority = 'important' | 'action' | 'development' | 'tip';
export type ReminderTrigger = 'exact_day' | 'day_range' | 'event_based';
export type ReminderKind = 'milestone' | 'milestone_check' | 'care_check' | 'preparation' | 'screening';
export type ReminderEditorialValue = 'essential' | 'high' | 'helpful';
export type FeedingMethod = NonNullable<BabyProfile['feedingMethod']>;

export interface BabyReminder {
  id: string;
  emoji: string;
  title: string;
  /** What the parent may notice / the useful headline fact shown on the home card. */
  shortText: string;
  /** Why this information is relevant at this stage rather than generic parenting trivia. */
  whyNow: string;
  /** Reassuring context: what is commonly normal and what variation is expected. */
  normalText: string;
  /** If this is a developmental checkpoint, what to do if the baby is not doing it yet. */
  notYetText?: string;
  /** Concrete, low-friction action a parent can take today. */
  actionText: string;
  /** Red flags / when to ask a professional. Optional for low-risk developmental items. */
  whenToAsk?: string;
  category: ReminderCategory;
  priority: ReminderPriority;
  kind: ReminderKind;
  editorialValue: ReminderEditorialValue;
  triggerType: ReminderTrigger;
  startDay?: number;
  endDay?: number;
  eventKey?: BabyEventKey;
  eventOffsetDays?: number;
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
  feeding: { sourceName: 'NHS Best Start in Life', sourceUrl: 'https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding/the-first-few-days/' },
  formula: { sourceName: 'NHS family health service', sourceUrl: 'https://www.derbyshirefamilyhealthservice.nhs.uk/our-services/0-5-years/infant-feeding-and-nutrition/formula-feeding' },
  newborn: { sourceName: 'NHS', sourceUrl: 'https://www.nhs.uk/pregnancy/labour-and-birth/early-days/' },
  bath: { sourceName: 'NHS', sourceUrl: 'https://www.nhs.uk/baby/caring-for-a-newborn/washing-and-bathing-your-baby/' },
  vitamins: { sourceName: 'NHS Best Start in Life', sourceUrl: 'https://www.nhs.uk/best-start-in-life/baby/baby-basics/caring-for-your-baby/vitamins-for-babies/' },
  development: { sourceName: 'NHS Best Start in Life', sourceUrl: 'https://www.nhs.uk/best-start-in-life/baby/baby-moves/' },
  developmentGuide: { sourceName: 'NHS Start for Life development guide', sourceUrl: 'https://healthiertogether.westlondon.nhs.uk/application/files/1017/4308/8317/Start_for_Life_Development_Guide_v3.pdf' },
  vision: { sourceName: 'NHS Trust', sourceUrl: 'https://www.penninecare.nhs.uk/your-baby-and-you' },
  crying: { sourceName: 'NHS Healthier Together', sourceUrl: 'https://www.swlondon-healthiertogether.nhs.uk/professionals/midwives/safety-netting-parent-info-sheets/crying-baby' },
  bloodSpot: { sourceName: 'NHS', sourceUrl: 'https://www.nhs.uk/baby/newborn-screening/blood-spot-test/' },
  hearing: { sourceName: 'NHS', sourceUrl: 'https://www.nhs.uk/baby/newborn-screening/hearing-test/' },
  babyCheck: { sourceName: 'NHS', sourceUrl: 'https://www.nhs.uk/baby/newborn-screening/physical-examination/' },
  jaundice: { sourceName: 'NHS hospital guidance', sourceUrl: 'https://www.cuh.nhs.uk/patient-information/jaundice-in-newborn-babies-/' },
  cradleCap: { sourceName: 'NHS', sourceUrl: 'https://www.nhs.uk/conditions/cradle-cap/' },
  teeth: { sourceName: 'NHS Start for Life', sourceUrl: 'https://www.nhs.uk/start-for-life/how-to-take-care-of-your-baby-or-toddlers-teeth/' },
  weaning: { sourceName: 'NHS Best Start in Life', sourceUrl: 'https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/' },
  allergens: { sourceName: 'NHS', sourceUrl: 'https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/' },
  safety: { sourceName: 'NHS', sourceUrl: 'https://www.nhs.uk/baby/first-aid-and-safety/safety/baby-and-toddler-safety/' },
  vaccine: { sourceName: 'UKHSA／GOV.UK', sourceUrl: 'https://www.gov.uk/government/publications/routine-childhood-immunisation-schedule/routine-childhood-immunisations-from-1-july-2026' },
  postpartum: { sourceName: 'NHS：Early days after birth', sourceUrl: 'https://www.nhs.uk/pregnancy/labour-and-birth/early-days/' },
  postpartumBody: { sourceName: 'NHS：Your body after the birth', sourceUrl: 'https://www.nhs.uk/pregnancy/labour-and-birth/your-body/' },
  caesarean: { sourceName: 'Cambridge University Hospitals：Caesarean wound care', sourceUrl: 'https://www.cuh.nhs.uk/patient-information/caesarean-section-wound-care-/' },
  breastfeedingDiet: { sourceName: 'NHS：Breastfeeding and diet', sourceUrl: 'https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding-and-lifestyle/diet/' },
  breastfeedingSupply: { sourceName: 'NHS：Milk supply', sourceUrl: 'https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/breastfeeding/breastfeeding-challenges/milk-supply/' },
  postnatalCheck: { sourceName: 'NHS：6-week postnatal check', sourceUrl: 'https://www.nhs.uk/baby/support-and-services/your-6-week-postnatal-check/' },
} satisfies Record<string, ReminderSource>;

type ReminderEntry = Omit<BabyReminder, 'sourceName' | 'sourceUrl'> & { source?: ReminderSource };

function r(entry: ReminderEntry): BabyReminder {
  const { source, ...content } = entry;
  return { ...source, ...content };
}

/**
 * EDITORIAL CONTRACT — this is intentionally stricter than a generic tip feed.
 *
 * A reminder belongs here only when it passes all of these checks:
 * 1. AGE / EVENT LINKED: there is a reason this is useful now, not just at any age.
 * 2. PARENT VALUE: a first-time parent learns something that changes understanding,
 *    preparation or care. Obvious common-sense filler is excluded.
 * 3. ONE-SHOT: age reminders appear on one representative day only; they never
 *    become a growing backlog of everything that was ever eligible.
 * 4. TIMELY: preparation advice appears BEFORE the event it prepares for.
 * 5. FIVE-PART THINKING: what you may notice -> why now -> what is normal ->
 *    what to do -> when to ask for help (when relevant).
 * 6. NO FAKE DEADLINES: developmental milestones use approximate language even
 *    when we schedule the card on one representative day.
 * 7. IF NOT YET: major developmental checkpoints must tell a first-time parent
 *    what variation can still be normal, what simple practice can help, and what
 *    signs / age should prompt a chat with the health visitor or GP. The feed must
 *    never merely say what a baby 'should' do and leave the parent worried.
 */
export const babyReminders: BabyReminder[] = [
  r({ id: "day0-first-bath", emoji: "🛁", title: "第一日唔使急住沖涼", shortText: "BB 啱啱出世，今日重點係保暖、skin-to-skin 同餵奶；第一次浸浴可以等身體狀況穩定先。", whyNow: "出世後頭一日，BB 仲喺適應體溫、餵食同外界環境。", normalText: "唔即刻沖涼並唔代表唔乾淨；初生皮膚表面嘅天然保護層亦唔需要急住洗走。", actionText: "先保持 BB 暖同乾爽，需要清潔就局部輕抹；之後先按 BB 狀況同醫護建議開始短時間沖涼。", whenToAsk: "如果 BB 體溫唔穩、食奶差、精神差或者醫護有特別交代，先跟個別醫療建議。", category: "bath", priority: "action", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 0, guideTargetId: "nappies-care", source: SOURCES.bath }),
  r({ id: "day0-safe-sleep", emoji: "😴", title: "第一晚最值得記住：每次瞓都仰睡", shortText: "日頭同夜晚都一樣，BB 每次瞓覺都應該仰睡，睡眠位置保持平坦、堅實同清空。", whyNow: "初生 BB 會瞓好多次，每一次睡眠都係安全睡眠習慣嘅開始。", normalText: "初生瞓眠好零碎、成日醒係正常，唔需要靠枕頭、床圍或鬆散被鋪幫佢「瞓穩」。", actionText: "每次都放 BB 仰睡，cot／Moses basket 入面唔放枕頭、bumper、玩具或鬆散被鋪。", whenToAsk: "如果 BB 有醫療原因需要其他睡姿，只跟醫院／兒科團隊嘅個別指示。", category: "sleep", priority: "important", kind: "milestone", editorialValue: "essential", triggerType: "exact_day", startDay: 0, guideTargetId: "sleep", source: SOURCES.sleep }),
  r({ id: "day1-meconium", emoji: "💩", title: "黑色黏便便係胎糞，唔使嚇親", shortText: "頭一兩日見到深綠黑、又黏又難抹嘅便便，多數係胎糞，之後會慢慢轉色。", whyNow: "BB 出生後開始排走喺子宮內累積嘅胎糞。", normalText: "顏色通常會由黑綠逐步變綠、啡，再按餵哺方式變成較黃或其他常見顏色。", actionText: "換片時記錄顏色同次數，留意係咪逐日有變化就得。", whenToAsk: "如果 BB 完全冇排便、肚脹、持續嘔吐，或者你對便便顏色有疑慮，問 midwife／醫護。", category: "nappy", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 1, guideTargetId: "nappies-care", source: SOURCES.newborn }),
  r({ id: "day1-cord", emoji: "🧡", title: "臍帶而家最重要係乾爽，唔好手多多", shortText: "臍帶會自己乾枯同脫落；而家保持清潔乾爽，唔好拉、剪或者刻意剝。", whyNow: "出生後臍帶殘端會逐步失去水分、乾縮，之後自然分離。", normalText: "臍帶由啡色變深、變硬、變乾都可以係正常過程。", actionText: "尿片邊盡量唔好磨住臍帶；如果污糟，按護理指引清潔再輕輕印乾。", whenToAsk: "如果周圍愈來愈紅腫、流膿、有臭味、持續出血，或者 BB 發燒／精神差，要盡快問醫護。", category: "umbilical", priority: "action", kind: "milestone", editorialValue: "essential", triggerType: "exact_day", startDay: 1, guideTargetId: "nappies-care", source: SOURCES.newborn }),
  r({ id: "day2-first-bath-ready", emoji: "🛁", title: "如果 BB 穩定，今日起可以考慮第一次沖涼", shortText: "唔需要等臍帶甩先沖涼；只要 BB 情況穩定，可以試短時間沖涼，之後將臍帶位輕輕印乾。", whyNow: "過咗出生最初適應期後，穩定嘅 BB 通常可以開始正常清潔。", normalText: "初生 BB 唔需要日日沖涼，短時間、唔凍親、唔過度清洗已經足夠。", actionText: "沖之前先準備好毛巾、片同衫，確保全程一隻手穩穩托住 BB，沖完即刻印乾保暖。", whenToAsk: "如果 BB 體溫唔穩、早產、皮膚有傷口或醫護有特別交代，先跟個別建議。", category: "bath", priority: "action", kind: "care_check", editorialValue: "high", triggerType: "exact_day", startDay: 2, guideTargetId: "nappies-care", source: SOURCES.bath }),
  r({ id: "day3-poo-transition", emoji: "💩", title: "便便開始轉色，通常係好事", shortText: "呢幾日便便可能由黑綠慢慢變綠、啡或黃，反映胎糞逐步排走。", whyNow: "BB 開始持續食奶後，腸道內容物會由胎糞過渡成奶便。", normalText: "顏色同稀稠度會受母乳／配方奶影響，唔需要每塊都完全一樣。", actionText: "睇趨勢多過睇單一塊尿片：有冇逐步轉色、BB 食奶同精神係咪正常。", whenToAsk: "如果便便持續白灰色、鮮紅大量出血、黑色胎糞樣便便持續唔退，應問醫護。", category: "nappy", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 3, guideTargetId: "nappies-care", source: SOURCES.newborn }),
  r({ id: "day3-jaundice", emoji: "🌤️", title: "呢幾日面仔變黃？新生兒黃疸最常喺呢段時間出現", shortText: "黃疸常由出生後第 2–3 日開始變明顯，通常先見於面同眼白，所以呢幾日特別值得留意。", whyNow: "出生後 BB 身體要處理較多紅血球分解產生嘅 bilirubin，肝臟亦仲喺適應。", normalText: "輕微黃疸喺新生兒幾常見，但要配合 BB 食奶、精神同黃嘅程度一齊睇。", actionText: "換片或換衫時喺自然光望下面、眼白同口腔顏色，同時確保 BB 有正常食奶。", whenToAsk: "如果出生頭 24 小時已經黃、黃得愈來愈深、BB 好攰難叫醒、食得明顯差，或者你擔心，應即日問 midwife／醫護。", category: "newborn", priority: "important", kind: "milestone", editorialValue: "essential", triggerType: "exact_day", startDay: 3, guideTargetId: "timeline", source: SOURCES.jaundice }),
  r({ id: "day4-cord-darkening", emoji: "🧡", title: "臍帶變黑變硬，通常係準備自然甩", shortText: "呢幾日臍帶可能突然乾好多、顏色變深甚至黑色，通常係正常乾枯過程。", whyNow: "臍帶組織冇再有血液供應，會逐步乾縮分離。", normalText: "乾、硬、深色本身唔代表感染；最重要係周圍皮膚唔係愈來愈紅腫。", actionText: "繼續保持乾爽，唔好因為見到「就甩」就幫佢拉。", whenToAsk: "如果有臭味、膿、持續滲血、紅腫向外擴散或 BB 發燒，要問醫護。", category: "umbilical", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 4, guideTargetId: "nappies-care", source: SOURCES.newborn }),
  r({ id: "day5-blood-spot", emoji: "🩸", title: "第 5 日：記住 heel-prick blood spot screening", shortText: "英國 newborn blood spot（heel prick）通常就係第 5 日做，用幾滴腳跟血篩查一批罕見但嚴重、早發現有幫助嘅疾病。", whyNow: "英國 screening programme 將第 5 日定為最合適嘅常規採樣時間。", normalText: "採血好快，BB 可能會喊；抱住、保暖、食奶或安撫都可以幫到。", actionText: "確認 midwife／醫護有冇安排；完成後等結果記錄入 Red Book。", whenToAsk: "如果今日仍然完全冇安排到 blood spot test，主動問 midwife、health visitor 或 GP。", category: "newborn", priority: "important", kind: "screening", editorialValue: "essential", triggerType: "exact_day", startDay: 5, guideTargetId: "timeline", source: SOURCES.bloodSpot }),
  r({ id: "day5-wet-nappies", emoji: "🚼", title: "第 5 日起，濕尿片數量開始好有參考價值", shortText: "去到呢個階段，濕尿片通常應該明顯增加；對新手父母嚟講，呢個係觀察有冇食到足夠奶嘅實用線索之一。", whyNow: "頭幾日奶量同 BB 攝取會逐步增加，尿量亦應該跟住上升。", normalText: "唔好淨係睇一塊片，重點係 24 小時整體趨勢、食奶表現同體重。", actionText: "今日起可以特別留意濕片數量同尿色，配合餵奶紀錄一齊睇。", whenToAsk: "如果濕片明顯少過預期、尿色好深、BB 食得差、口乾或者好攰，應盡快問 midwife／health visitor。", category: "nappy", priority: "important", kind: "care_check", editorialValue: "essential", triggerType: "exact_day", startDay: 5, guideTargetId: "days-3-7", source: SOURCES.newborn }),
  r({ id: "day6-cluster-feeding", emoji: "🍼", title: "突然連環要食奶？先認識 cluster feeding", shortText: "初生 BB 有時會一段時間密密食，尤其黃昏或夜晚；呢個現象本身唔等於「你唔夠奶」。", whyNow: "頭幾星期餵食節奏仍然非常不規則，BB 亦會透過頻密吃奶刺激奶量同滿足安撫需要。", normalText: "有啲時段食得密、有啲時段隔耐少少可以正常；要連同吞嚥、濕片、體重同精神一齊判斷。", actionText: "跟早期 hunger cues 餵，唔使硬等鐘；如果係母乳，可留意含乳同吞嚥係咪有效。", whenToAsk: "如果 BB 幾乎不停食但仍然非常不安、濕片少、好難叫醒或體重有問題，就要搵 midwife／feeding support。", category: "feeding", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 6, guideTargetId: "feeding", source: SOURCES.feeding }),
  r({ id: "day7-vitamin-d", emoji: "☀️", title: "一星期大：如果有餵母乳，確認 Vitamin D 已經開始", shortText: "母乳或混合餵哺 BB 一般由出生起就需要每日 Vitamin D；一星期大係好時機確認屋企已經有合適產品同劑量。", whyNow: "母乳天然 Vitamin D 含量通常唔足以單靠餵奶滿足建議攝取。", normalText: "純配方奶 BB 如果每日飲到足夠配方奶，安排可以唔同，所以唔應該所有 BB 一刀切。", actionText: "按 NHS 建議同產品標籤確認每日劑量；如果係配方奶為主，就睇每日奶量同醫護建議。", whenToAsk: "如果你唔肯定產品濃度、每日滴數，或者 BB 係早產／有醫療需要，問 pharmacist、health visitor 或 GP。", category: "vitamins", priority: "action", kind: "care_check", editorialValue: "high", triggerType: "exact_day", startDay: 7, feedingMethods: ["breast", "mixed"], guideTargetId: "feeding", source: SOURCES.vitamins }),
  r({ id: "day8-cord-window", emoji: "🧡", title: "頭一至兩星期：臍帶可能開始自然甩", shortText: "呢幾日見到臍帶鬆咗、得返少少連住，好多時都係自然分離；最重要係忍手唔好拉。", whyNow: "臍帶乾枯到一定程度就會自行脫落，時間每個 BB 都唔完全一樣。", normalText: "甩嗰刻可能有少量血漬，但唔應該持續流血或者愈來愈紅腫。", actionText: "等佢自己甩；甩咗之後保持位置清潔乾爽。", whenToAsk: "如果持續出血、流膿、有臭味、周圍紅腫擴散或 BB 發燒，就要問醫護。", category: "umbilical", priority: "action", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 8, guideTargetId: "nappies-care", source: SOURCES.newborn }),
  r({ id: "day9-tummy-on-chest", emoji: "🤸", title: "Tummy time 唔使等大個：可以由你胸口開始", shortText: "BB 清醒、有人全程睇住時，可以先伏喺你胸口幾十秒至幾分鐘，唔一定一開始就放地墊。", whyNow: "早期短時間俯臥活動可以俾 BB 練頸、肩同上身肌肉，但初生耐力仲好短。", normalText: "一放低就唔鍾意、只能頂幾十秒都好常見，唔需要追時間。", actionText: "揀 BB 清醒又唔係啱啱食到好飽嘅時候，由短時間、多次開始。", whenToAsk: "如果 BB 一俯臥就呼吸困難、顏色改變，或者你擔心頭頸活動明顯唔對稱，問 health visitor／GP。", category: "physical", priority: "development", kind: "care_check", editorialValue: "high", triggerType: "exact_day", startDay: 9, guideTargetId: "weeks-3-4", source: SOURCES.development }),
  r({ id: "day10-nails", emoji: "✂️", title: "指甲長得快，今日摸下有冇尖角刮面", shortText: "初生 BB 指甲可以長得好快，面仔突然多咗幼細抓痕，好多時只係指甲尖咗。", whyNow: "BB 手部控制仲未成熟，會不自覺揮手掂面，所以尖角特別容易刮到自己。", normalText: "指甲軟、薄但邊位可以好利；唔需要見白邊就一定剪。", actionText: "先摸下有冇尖角，需要先修；可以趁 BB 熟睡或好安靜時慢慢剪／磨。", whenToAsk: "如果抓痕紅腫、流膿，或者指甲周圍發炎，就要問醫護。", category: "newborn", priority: "tip", kind: "care_check", editorialValue: "helpful", triggerType: "exact_day", startDay: 10, guideTargetId: "nappies-care", source: SOURCES.newborn }),
  r({ id: "day11-skin-peeling", emoji: "🧴", title: "手腳甩皮？初生頭幾星期幾常見", shortText: "手腕、腳腕、手腳掌有少少乾同脫皮，初生期可以好常見，唔代表你護膚做錯。", whyNow: "BB 由羊水環境轉到乾燥空氣後，最外層皮膚會自然適應同更新。", normalText: "輕微乾燥、薄薄脫皮通常會慢慢改善。", actionText: "避免過度沖涼、香料產品同大力搓；需要時用適合嬰兒嘅簡單 emollient。", whenToAsk: "如果皮膚明顯紅腫、滲液、水泡、裂到出血或者 BB 好唔舒服，要問醫護。", category: "newborn", priority: "tip", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 11, guideTargetId: "nappies-care", source: SOURCES.newborn }),
  r({ id: "day13-bath-frequency", emoji: "🛁", title: "兩星期前後：唔需要為「衛生」日日沖涼", shortText: "初生 BB 唔需要每日沖涼；頸摺、面、手同下身保持清潔，已經可以好乾淨。", whyNow: "好多新手父母返屋企後會開始建立固定 routine，但初生皮膚仍然好容易乾。", normalText: "一星期幾次完整沖涼已經可以，實際按 BB 皮膚同污糟程度調整。", actionText: "其他日子用溫水局部清潔容易積奶、汗或便便嘅位置。", whenToAsk: "如果皮膚持續乾裂、濕疹樣紅疹或滲液，就問 health visitor／GP。", category: "bath", priority: "tip", kind: "care_check", editorialValue: "high", triggerType: "exact_day", startDay: 13, guideTargetId: "nappies-care", source: SOURCES.bath }),
  r({ id: "day14-crying-curve", emoji: "😭", title: "兩星期起突然難湊咗？哭鬧本身可能開始增加", shortText: "好多 BB 大約由 2 星期開始哭多咗，之後幾星期可能再增加；知道有呢條「哭鬧曲線」，會少好多自責。", whyNow: "呢個係好多健康嬰兒都會經歷嘅正常早期哭鬧模式，通常會逐步增加到 6–8 星期左右最明顯。", normalText: "即使你已經餵飽、換片、抱住，BB 有時仍然會喊，唔代表你一定做錯。", actionText: "先逐樣排除肚餓、片濕、太熱太凍、太攰等需要，再用抱住、skin-to-skin、輕搖或安靜聲音安撫；頂唔順時同另一位照顧者輪流。", whenToAsk: "如果哭聲同平時完全唔同、BB 好難叫醒、食奶差、發燒、呼吸唔順或你直覺覺得唔對路，就要搵醫療意見。", category: "newborn", priority: "important", kind: "milestone", editorialValue: "essential", triggerType: "exact_day", startDay: 14, guideTargetId: "timeline", source: SOURCES.crying }),
  r({ id: "day16-vision-distance", emoji: "👀", title: "同 BB 對望，距離大約一隻前臂最啱", shortText: "初生 BB 最容易睇到大約 20–30 cm 左右嘅人臉；餵奶、抱住時嘅距離正正好適合互動。", whyNow: "早期視力仍然模糊，近距離對比強嘅臉孔比遠處細節容易處理。", normalText: "望幾秒就移開視線、今日追到聽日又唔追到，都可以係正常早期表現。", actionText: "抱近啲、慢慢講嘢，等 BB 自己望；唔需要用快速閃動或複雜玩具刺激。", whenToAsk: "如果你長期完全見唔到 BB 對光、面孔或移動有任何反應，可以喺 health visitor／GP 檢查時提出。", category: "vision", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 16, guideTargetId: "weeks-3-4", source: SOURCES.vision }),
  r({ id: "day18-day-night", emoji: "🌙", title: "而家可以開始畀「日頭光、夜晚暗」嘅線索", shortText: "唔係訓練 BB 瞓過夜，而係日頭保持正常光線同生活聲，夜晚餵奶換片就盡量暗同平靜。", whyNow: "初生嘅日夜節律未成熟，需要時間慢慢由環境線索建立。", normalText: "兩三星期大夜晚仍然密密醒、日夜調轉好常見，唔應該期望固定作息。", actionText: "日頭開窗簾、正常活動；夜晚減光、少玩、處理完需要就再安靜入睡。", whenToAsk: "如果你因為睡眠不足已經撐唔住，或者 BB 睡眠同餵食令你擔心，主動同 health visitor 傾。", category: "sleep", priority: "tip", kind: "care_check", editorialValue: "high", triggerType: "exact_day", startDay: 18, guideTargetId: "sleep", source: SOURCES.sleep }),
  r({ id: "day19-baby-acne", emoji: "🙂", title: "面仔突然出粒粒？初生嬰兒暗瘡可以喺呢幾星期出現", shortText: "面頰、鼻或額頭出細粒粒，呢個階段有機會係常見 baby acne，未必係奶敏感或者你食錯嘢。", whyNow: "出生後頭幾星期皮膚同皮脂腺仍然受荷爾蒙變化影響。", normalText: "如果 BB 精神正常、冇發燒，而粒粒唔滲液唔起水泡，多數會隨時間改善。", actionText: "用溫水溫和清潔，唔好擠、磨、亂搽成人暗瘡藥。", whenToAsk: "如果有水泡、流膿、皮膚明顯腫痛、發燒或 BB 唔舒服，要問醫護。", category: "newborn", priority: "tip", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 19, guideTargetId: "nappies-care", source: SOURCES.newborn }),
  r({ id: "day21-birthweight", emoji: "⚖️", title: "三星期左右：多數 BB 應該已經追回出生體重", shortText: "NHS 指引提到，多數 BB 會喺頭 3 星期左右追回出生體重；所以而家睇『趨勢』比逐餐奶量更有意思。", whyNow: "出生頭幾日好多 BB 會先跌少少體重，之後隨住餵食建立再慢慢回升。", normalText: "每個 BB 速度唔同，唔係第 21 日一定要啱啱返到某個數字；醫護會睇整體曲線。", actionText: "如果最近有 weighing 記錄，可以睇返趨勢；唔需要日日自己磅，按 health visitor／midwife 安排就得。", whenToAsk: "如果 BB 到呢個階段仍未追回出生體重、食奶困難、濕片少或醫護已經關注增重，就要跟進餵哺同體重評估。", category: "feeding", priority: "action", kind: "milestone", editorialValue: "essential", triggerType: "exact_day", startDay: 21, guideTargetId: "feeding", source: SOURCES.newborn }),
  r({ id: "day27-breastfeeding-pattern", emoji: "🍼", title: "三至四星期：母乳 BB 一日食 8–12 次以上仍然可以好正常", shortText: "呢個階段仲未必有固定餐表；8–12 次／24 小時甚至某段時間 cluster feeding，都可以係正常。", whyNow: "頭幾星期奶量供應同 BB 胃容量仍然配合緊，responsive feeding 比硬性每 3 小時一次更實際。", normalText: "每餐長短、兩餐間隔可以唔同；有效吞嚥、濕片、體重同 BB 食完反應比鐘數更重要。", actionText: "見到搵乳、食手、嘴郁等早期 hunger cues 就可以餵，唔使等喊先餵。", whenToAsk: "如果食奶好痛、聽唔到吞嚥、BB 長期食極都唔滿足、濕片少或增重有疑問，搵 midwife／health visitor／feeding support。", category: "feeding", priority: "action", kind: "milestone", editorialValue: "essential", triggerType: "exact_day", startDay: 27, feedingMethods: ["breast"], guideTargetId: "feeding", source: SOURCES.feeding }),
  r({ id: "day27-formula-pattern", emoji: "🍼", title: "三至四星期：配方奶睇全日總量同 BB 訊號，唔好硬塞每餐固定 ml", shortText: "第一星期後可用約 150–200 mL/kg/日做粗略參考，但每餐食幾多、隔幾耐仍然會因 BB 而異。", whyNow: "三星期左右好多家庭開始想建立「餐表」，但 BB 食量仍然會按體重、猛長期同當日需要波動。", normalText: "有時食少啲、有時密啲都可以；大餐唔代表下一餐一定隔得更耐。", actionText: "用 BB hunger/fullness cues 餵，唔好迫清樽；用濕片、體重同精神狀態判斷整體攝取。", whenToAsk: "如果 BB 經常食唔到、持續嘔吐、濕片少、體重增長有疑問，就問 health visitor／GP。", category: "feeding", priority: "action", kind: "milestone", editorialValue: "essential", triggerType: "exact_day", startDay: 27, feedingMethods: ["formula"], guideTargetId: "feeding", source: SOURCES.formula }),
  r({ id: "day27-mixed-pattern", emoji: "🍼", title: "三至四星期：混合餵唔需要追一個「完美固定奶量」", shortText: "母乳同樽餵一齊用時，每餐份量同間隔更容易變；重點係 BB 訊號、濕片、增重同你想維持嘅餵哺方式。", whyNow: "頭幾星期混合餵通常仍然喺摸索節奏，奶量供應亦會受親餵／泵奶頻率影響。", normalText: "同一日每餐差距可以幾大，唔需要用其他 BB 嘅餐表做標準答案。", actionText: "記錄大概節奏，見早期 hunger cues 就回應；如果想維持母乳量，要留意乳房刺激頻率。", whenToAsk: "如果唔肯定點樣平衡母乳同配方奶、濕片少或增重有疑問，搵 health visitor／infant feeding team。", category: "feeding", priority: "action", kind: "milestone", editorialValue: "essential", triggerType: "exact_day", startDay: 27, feedingMethods: ["mixed"], guideTargetId: "feeding", source: SOURCES.feeding }),
  r({ id: "day27-feeding-generic", emoji: "🍼", title: "三至四星期：仲未需要逼自己建立『完美餐表』", shortText: "呢個階段每餐長短同間隔仍然可以好飄忽；比起死跟鐘，更值得睇 hunger cues、濕片、食完反應同體重趨勢。", whyNow: "頭一個月餵食節奏仍然喺建立，猛長、安撫需要同每個 BB 胃口都會令餐與餐差好多。", normalText: "有時密食、有時隔耐少少都可以，單一餐食多或食少唔足以判斷整體攝取。", actionText: "用紀錄睇 24 小時整體趨勢，而唔係追求每餐完全一樣。", whenToAsk: "如果濕片少、食奶好辛苦、持續嘔吐、BB 好攰或者增重有疑問，問 health visitor／GP。", category: "feeding", priority: "action", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 27, feedingMethods: [""], guideTargetId: "feeding", source: SOURCES.feeding }),
  r({ id: "day23-hearing-screen", emoji: "👂", title: "接近 4 星期：確認 newborn hearing screen 已經做咗", shortText: "英國 newborn hearing screening 通常會喺 BB 4 星期前完成；如果仲未做或者未有安排，依家就值得追一追。", whyNow: "及早發現聽力問題，可以更早安排支援，對之後語言同溝通發展有幫助。", normalText: "有啲 BB 出院前已做，有啲會約返門診／社區做；第一次結果唔清晰亦唔代表一定有聽力問題。", actionText: "望下 Red Book／出院資料有冇結果；未做就問 health visitor、GP 或本地 hearing screening service。", whenToAsk: "如果已經錯過安排，唔好等到「睇下識唔識聽聲」先算，直接主動追 screening。", category: "hearing", priority: "action", kind: "screening", editorialValue: "essential", triggerType: "exact_day", startDay: 23, guideTargetId: "timeline", source: SOURCES.hearing }),
  r({ id: "day24-scalp", emoji: "🧴", title: "頭皮有白／黃色皮屑？可能係 cradle cap", shortText: "初生頭幾星期見到油油哋、白／黃色皮屑幾常見，通常唔痕唔痛，亦唔代表 BB 污糟或你洗得唔夠。", whyNow: "cradle cap 常見於嬰兒早期；確實成因未完全清楚，所以唔應該怪落「衛生差」或媽媽做錯。", normalText: "輕微鱗屑、結痂可以自己慢慢改善幾星期至幾個月。", actionText: "可以用適合嬰兒嘅 emollient／按 NHS 方法軟化，再用軟刷輕刷同 baby shampoo 清洗；唔好摳。", whenToAsk: "如果範圍好廣、出血、滲液、腫起，或者幾星期護理都冇改善，就問 pharmacist／GP。", category: "newborn", priority: "tip", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 24, guideTargetId: "nappies-care", source: SOURCES.cradleCap }),
  r({ id: "day26-vaccine-preview", emoji: "💉", title: "差唔多四星期大：8 星期第一輪疫苗可以開始有心理準備", shortText: "再過大約一個月就到 England 8-week routine vaccines；而家唔使做醫療準備，但可以先知會打咩、點解打。", whyNow: "8 星期係第一個主要 routine vaccination 時間點，提早幾星期知道安排，比到前一日先睇資料實用。", normalText: "2026 England schedule 嘅 8-week vaccines 包括 6-in-1、MenB 同 rotavirus，分別保護多種嚴重感染。", actionText: "留意 GP appointment 信／訊息，確認 Red Book 同聯絡資料正確；未收到通知唔代表一定漏咗，可以之後主動問 GP。", whenToAsk: "如果 BB 有特別醫療狀況、曾有疫苗反應家族疑問，預先問 GP／practice nurse。", category: "vaccination", priority: "action", kind: "preparation", editorialValue: "essential", triggerType: "exact_day", startDay: 26, guideTargetId: "vaccinations", source: SOURCES.vaccine }),
  r({ id: "day28-social-smile-preview", emoji: "😊", title: "四星期大：而家開始踏入「社交笑」前奏期", shortText: "你可能發現 BB 望人臉耐咗、表情放鬆咗，但未真正對你笑都完全正常。", whyNow: "頭一兩個月社交互動會逐步增加，真正社交微笑通常唔係某一日突然準時出現。", normalText: "有時似笑、有時只係睡夢表情；每個 BB 出現明顯社交笑嘅時間可以有差異。", actionText: "餵奶、換片或清醒時同佢近距離對望、笑、講嘢，等佢自己回應。", whenToAsk: "如果到之後發展檢查時你仍然擔心 BB 完全冇眼神互動或對人冇反應，可以同 health visitor／GP 提出。", category: "social", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 28, guideTargetId: "months-2-3", source: SOURCES.development }),
  r({ id: "day30-colour", emoji: "🌈", title: "一個月左右：視覺開始唔止得「黑白卡」", shortText: "BB 對高對比仍然最容易睇，但可以開始加入少量鮮明顏色同大圖形，唔使永遠只玩黑白。", whyNow: "色彩視覺係逐步成熟，而唔係某一日突然由黑白變彩色。", normalText: "短暫望、移開視線、隔一陣先再望都正常，唔需要逼佢「練眼」。", actionText: "一次只俾一兩個簡單、鮮明目標，慢慢移動，等 BB 自己跟。", whenToAsk: "如果你長期覺得 BB 完全唔追光、唔望面或兩隻眼活動好唔一致，就喺檢查時提出。", category: "vision", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 30, guideTargetId: "months-2-3", source: SOURCES.vision }),
  r({ id: "day35-six-week-check", emoji: "🩺", title: "五星期大：6–8 week baby check 就快到", shortText: "未來幾星期 GP 會再做一次較完整 baby physical check，會睇眼、心臟、髖關節等；而家可以開始記低你想問嘅問題。", whyNow: "NHS 會喺 6–8 星期再檢查一啲出生頭幾日未必容易發現嘅問題。", normalText: "呢個檢查係 routine，唔代表醫護懷疑 BB 有事。", actionText: "將餵奶、睡眠、哭鬧、皮膚、髖腳活動等你有疑問嘅嘢記低，到時一次過問。", whenToAsk: "如果到 8 星期仍未獲安排，主動聯絡 GP；有急症警號就唔好等 routine check。", category: "newborn", priority: "action", kind: "preparation", editorialValue: "essential", triggerType: "exact_day", startDay: 35, guideTargetId: "timeline", source: SOURCES.babyCheck }),
  r({ id: "day42-crying-peak", emoji: "😭", title: "六星期左右：可能正踏入哭鬧最辛苦嗰段", shortText: "好多 BB 嘅哭鬧會喺 6–8 星期左右去到高峰；如果你覺得突然難湊好多，唔一定係你做錯。", whyNow: "正常 crying curve 喺頭幾星期會逐步上升，之後通常會再慢慢下降。", normalText: "有時乜都試過仍然喊，可以係正常；照顧者覺得攰、煩躁亦係需要被處理嘅訊號。", actionText: "先檢查基本需要，再輪流抱、skin-to-skin、輕搖、安靜環境；如果情緒頂唔順，BB 安全放低後短暫離開幾分鐘再返嚟。永遠唔好搖 BB。", whenToAsk: "如果哭聲尖銳異常、BB 發燒、呼吸困難、好難叫醒、食得差，或者你覺得「唔似平時」，要即時搵醫療意見。", category: "newborn", priority: "important", kind: "milestone", editorialValue: "essential", triggerType: "exact_day", startDay: 42, guideTargetId: "timeline", source: SOURCES.crying }),
  r({ id: "day42-social-smile", emoji: "😊", title: "六星期左右：可能第一次見到真正「因為你而笑」", shortText: "有啲 BB 呢段時間開始見到熟悉面孔、聽到你把聲就笑，呢種社交笑同睡夢反射唔同。", whyNow: "社交同視覺互動能力喺頭兩個月逐步成熟。", normalText: "未出現都唔代表有問題，時間差異可以幾大。", actionText: "面對面笑住講嘢、停一停等佢回應，就係最好嘅互動。", whenToAsk: "如果之後去到 routine development review 仍然完全冇眼神／社交反應而你擔心，就同 health visitor／GP 傾。", category: "social", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 42, guideTargetId: "months-2-3", source: SOURCES.development }),
  r({ id: "day49-vaccine-soon", emoji: "💉", title: "仲有約一星期到 8-week vaccines：確認 appointment", shortText: "今個星期最實際係睇下 GP appointment 有冇落實，亦可以先知 rotavirus 係口服、其餘會用針。", whyNow: "去到接種前一星期，處理時間、交通、Red Book 同問題清單最適合。", normalText: "實際接種日可以唔係啱啱第 56 日，跟 GP 安排就可以。", actionText: "帶 Red Book；如果 BB 當日唔舒服或者你唔肯定可唔可以打，先打去 GP 問。", whenToAsk: "如果完全未收到安排，主動聯絡 GP practice。", category: "vaccination", priority: "action", kind: "preparation", editorialValue: "essential", triggerType: "exact_day", startDay: 49, guideTargetId: "vaccinations", source: SOURCES.vaccine }),
  r({ id: "day56-vaccines", emoji: "💉", title: "8 星期：第一輪 routine vaccines 主要防咩？", shortText: "2026 England schedule：6-in-1 防白喉、破傷風、百日咳、小兒麻痺、Hib、乙肝；另外有 MenB 同 rotavirus。", whyNow: "8 星期係 England routine childhood immunisation 第一個主要時間點。", normalText: "打完有機會短暫攰、煩躁、注射位痛；MenB 後發燒亦較常見，實際處理跟 NHS／接種護士指示。", actionText: "按 GP appointment 接種，帶 Red Book，接種前將過敏、病史同你想問嘅問題講清楚。", whenToAsk: "如果接種後出現嚴重過敏徵象、呼吸困難、極度嗜睡或你對反應有疑慮，按接種後指引求助。", category: "vaccination", priority: "important", kind: "milestone", editorialValue: "essential", triggerType: "exact_day", startDay: 56, guideTargetId: "vaccinations", source: SOURCES.vaccine }),
  r({ id: "day63-hands", emoji: "🖐️", title: "兩個月後：開始「研究自己隻手」係手眼協調前奏", shortText: "BB 可能開始望手、張開拳頭、將手帶近嘴邊；唔好每次見食手都自動當肚餓。", whyNow: "視覺、手臂控制同身體感覺開始慢慢連結。", normalText: "動作仲會好飄忽，左右手未必一樣熟練。", actionText: "俾佢自由郁手，用簡單輕身玩具放近中線俾佢望同掂。", whenToAsk: "如果你長期見到一邊手完全唔郁、明顯僵硬或你擔心動作不對稱，喺 health visitor／GP 提出。", category: "physical", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 63, guideTargetId: "months-2-3", source: SOURCES.development }),
  r({ id: "day70-colour", emoji: "🌈", title: "兩個幾月：鮮明顏色同較複雜圖案開始更有吸引力", shortText: "而家可以由單純黑白，慢慢加入紅、黃、藍等鮮明顏色同較大圖案。", whyNow: "視覺解析同色彩感知會喺頭幾個月快速成熟。", normalText: "BB 對某啲顏色冇興趣唔代表「睇唔到」，注意力本身就會飄。", actionText: "一次一個玩具，放喺近距離慢慢移動，比不停換刺激更容易觀察反應。", whenToAsk: "如果你覺得 BB 完全唔追物件、眼位長期偏斜或對光冇反應，問 health visitor／GP。", category: "vision", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 70, guideTargetId: "months-2-3", source: SOURCES.development }),
  r({ id: "day77-cooing", emoji: "🗣️", title: "兩個幾月：可能開始多咗「咕咕、呀呀」聲", shortText: "BB 發出唔同細聲時，你等一等再回應，已經係最早期嘅「對話」。", whyNow: "早期社交同發聲控制慢慢成熟，BB 開始試用聲音吸引你同回應你。", normalText: "有啲日子好多聲、有啲日子好靜，唔需要每日表現一樣。", actionText: "用自然語氣回應佢嘅聲音同表情，留空位等佢「答」。", whenToAsk: "如果同時對聲音完全冇反應，而你對聽力有疑慮，就問 health visitor／GP。", category: "communication", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 77, guideTargetId: "months-2-3", source: SOURCES.development }),
  r({ id: "day84-vaccine", emoji: "💉", title: "12 星期 routine vaccines：第二輪會延續保護", shortText: "2026 England schedule 喺 12 星期會再有 6-in-1、MenB 同第二劑 rotavirus，延續第一輪建立嘅免疫保護。", whyNow: "好多嬰兒疫苗需要分幾劑先建立較穩定保護，所以唔係「打過一次就完成」。", normalText: "實際日期跟 GP 排期，遲幾日唔代表失效。", actionText: "帶 Red Book，照常向 nurse 更新 BB 最近健康狀況同上次反應。", whenToAsk: "如果錯過 appointment，盡快聯絡 GP 重約，唔好自行當作「算數」。", category: "vaccination", priority: "important", kind: "milestone", editorialValue: "essential", triggerType: "exact_day", startDay: 84, guideTargetId: "vaccinations", source: SOURCES.vaccine }),
  r({ id: "day91-head-control", emoji: "🤸", title: "三個月左右：抱起時可能明顯覺得個頭穩咗", shortText: "頭頸控制通常會逐步進步，但「三個月」唔等於今日起可以完全唔托頭。", whyNow: "頸、肩同上背肌肉經過幾個月日常活動同 tummy time 後會逐漸有力。", normalText: "攰、啱啱瞓醒或姿勢轉換時仍然可能突然「跌頭」；發展速度亦可以有差異。", notYetText: "如果仲未抬得好頭，唔使突然加長訓練。每日做幾次短 tummy time，可以先伏喺你胸口／大髀，或者喺腋下墊一條細卷毛巾，慢慢增加；抱起時繼續托實頭頸。", actionText: "按 BB 實際能力逐步減少承托，而唔係按日曆一次過放手；多俾安全地面活動時間，少啲長時間困喺 reclined seat／bouncer。", whenToAsk: "如果到呢個階段頭部控制完全冇進步、俯臥時完全抬唔起頭胸、明顯只偏一邊，或者身體好軟／好僵，問 health visitor／GP。", category: "physical", priority: "development", kind: "milestone_check", editorialValue: "essential", triggerType: "exact_day", startDay: 91, guideTargetId: "months-2-3", source: SOURCES.developmentGuide }),
  r({ id: "day98-reaching", emoji: "🧸", title: "三個幾月：伸手掂玩具開始有意思", shortText: "BB 可能由亂揮手，慢慢變成有目的咁拍、掂或者短暫捉住物件。", whyNow: "手眼協調同肩臂控制正逐步成熟。", normalText: "初期經常捉唔準、跌玩具係正常。", actionText: "揀大件、輕身、冇細零件嘅玩具，放近中線俾佢自己試。", whenToAsk: "如果長期只用一邊手、另一邊幾乎唔郁，或者你擔心動作發展，喺檢查時提出。", category: "play", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 98, guideTargetId: "months-2-3", source: SOURCES.development }),
  r({ id: "day105-rolling-safety", emoji: "⚠️", title: "未見過翻身，都要由今日開始當佢「隨時識」", shortText: "翻身好多時係突然第一次做到；床、梳化、換片枱等高處由而家開始唔可以單獨留 BB。", whyNow: "三四個月開始軀幹力量同扭身動作會進步，第一次翻身未必有預告。", normalText: "BB 未正式翻到身，但已經會側身、扭腰、踢腳都可以係前奏。", actionText: "換片用品放手邊，任何高處都保持一隻手近住 BB；最好喺地面安全位置玩。", whenToAsk: "如果 BB 跌落高處、撞頭後異常嗜睡、持續嘔吐或你擔心受傷，要按急症指引求助。", category: "safety", priority: "important", kind: "preparation", editorialValue: "essential", triggerType: "exact_day", startDay: 105, guideTargetId: "safety", source: SOURCES.safety }),
  r({ id: "day112-vaccine", emoji: "💉", title: "16 星期 routine vaccines：6-in-1 + pneumococcal", shortText: "2026 England schedule 喺 16 星期會有第三劑 6-in-1，同 pneumococcal（PCV）疫苗。", whyNow: "6-in-1 需要分劑建立保護；PCV 針對可引起嚴重肺炎、腦膜炎等嘅 pneumococcal infection。", normalText: "接種後短暫煩躁、針口痛或輕微不適都可能出現。", actionText: "按 appointment 接種、帶 Red Book，照樣講返 BB 最近健康同之前疫苗反應。", whenToAsk: "嚴重過敏徵象、呼吸困難或明顯異常反應要即時求助。", category: "vaccination", priority: "important", kind: "milestone", editorialValue: "essential", triggerType: "exact_day", startDay: 112, guideTargetId: "vaccinations", source: SOURCES.vaccine }),
  r({ id: "day120-teething", emoji: "🦷", title: "四個月左右：口水多、成日咬嘢，可能踏入出牙前奏", shortText: "有啲 BB 呢段時間開始口水多、咬手咬玩具；但第一隻牙幾時真正出可以差好遠。", whyNow: "牙齦同口腔發展開始有變化，但「流口水」本身亦可能只係正常口腔探索。", normalText: "出牙可以令牙肉唔舒服，但唔應該將高燒、嚴重腹瀉等全部歸咎出牙。", actionText: "提供乾淨、合適年齡嘅 teething ring，保持面口乾爽，避免亂用未經建議嘅出牙產品。", whenToAsk: "如果 BB 發高燒、精神差、持續唔食奶或症狀明顯，當普通生病處理，唔好只當出牙。", category: "teeth", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 120, guideTargetId: "months-5-6", source: SOURCES.newborn }),
  r({ id: "day135-babyproof", emoji: "🏠", title: "四個半月左右：趁未識爬，先做一次「地面視角」baby-proofing", shortText: "而家開始收電線、細物件、容易翻倒家具，比等 BB 突然識移動先執輕鬆得多。", whyNow: "之後幾個月伸手、翻身、轉位同移動會愈來愈快，安全風險會突然增加。", normalText: "未識爬唔代表唔會滾到、扭到或者伸手拉到附近物件。", actionText: "蹲低用 BB 視線高度巡一次屋：電線、硬幣、藥物、膠袋、熱飲、家具穩定性逐樣睇。", whenToAsk: "如果屋企有樓梯、壁爐或特殊家具而唔肯定點樣固定，可以查 NHS child safety 指引。", category: "safety", priority: "action", kind: "preparation", editorialValue: "essential", triggerType: "exact_day", startDay: 135, guideTargetId: "safety", source: SOURCES.safety }),
  r({ id: "day150-solids-readiness", emoji: "🥣", title: "五個月：開始識分「準備好加固」同「只係想咬嘢」", shortText: "唔使因為食手、夜醒或者望住你食飯就提早開糊；大約 6 個月先睇真正 readiness signs。", whyNow: "五個月左右好多 BB 對食物開始好奇，但好奇唔等於吞嚥同坐姿能力已準備好。", normalText: "真正準備訊號包括坐得較穩兼頭頸控制好、手眼協調可以攞食物到口、能吞嚥而唔係用舌推出。", actionText: "而家可以先準備 high chair、學 choking first aid、諗第一批食物，唔需要急住餵。", whenToAsk: "早產 BB、吞嚥問題、發展或增重有疑慮，開始 solids 前先同 health visitor／醫療團隊傾。", category: "weaning", priority: "action", kind: "preparation", editorialValue: "essential", triggerType: "exact_day", startDay: 150, guideTargetId: "months-5-6", source: SOURCES.weaning }),
  r({ id: "day165-high-chair", emoji: "🪑", title: "加固前兩星期：high chair 唔係買咗就算，要先試坐姿", shortText: "開始 solids 前先試好 high chair：BB 要坐得直、穩定、有合適安全帶，食嘢時唔好半躺。", whyNow: "安全吞嚥需要穩定坐姿；臨第一餐先組裝最容易忽略角度同安全帶。", normalText: "初期坐姿可能仲要靠椅背支撐，但頭頸要可以保持穩定。", actionText: "預先調好安全帶、tray 同腳位，並確保餵食全程成人坐近看住。", whenToAsk: "如果 BB 仍然完全坐唔穩、頭頸控制不足，就唔好為趕「6 個月」硬開始。", category: "weaning", priority: "action", kind: "preparation", editorialValue: "high", triggerType: "exact_day", startDay: 165, guideTargetId: "months-5-6", source: SOURCES.weaning }),
  r({ id: "day180-solids", emoji: "🥦", title: "六個月左右：準備好先開始 solids，唔係生日一到就一定要食", shortText: "如果 BB 有 readiness signs，可以由少量開始探索食物；奶仍然係重要營養來源。", whyNow: "大約 6 個月時，多數 BB 嘅坐姿、手眼協調同吞嚥能力先逐步成熟到適合 solids。", normalText: "第一餐只食一兩啖、玩多過食都正常；唔需要即刻取代奶餐。", actionText: "由柔軟、安全、容易抓握或 mashed 食物開始，BB 坐直、全程有人看守。", whenToAsk: "如果有吞嚥問題、嚴重濕疹、已知過敏或發展疑慮，開始前先問 health visitor／GP。", category: "weaning", priority: "action", kind: "milestone", editorialValue: "essential", triggerType: "exact_day", startDay: 180, guideTargetId: "months-5-6", source: SOURCES.weaning }),
  r({ id: "day182-rolling-check", emoji: "🔄", title: "六個月左右仲未翻身？先睇『有冇進步』，唔好淨係睇日曆", shortText: "好多 BB 大約呢個階段開始學前後翻身，但唔係每個 BB 都同一星期做到；未翻身本身唔等於有問題。", whyNow: "大約 6 個月，頸、肩、核心同髖部控制通常已累積到可以開始協調翻身；有啲 BB 會早啲，有啲會遲啲。", normalText: "只識一個方向、側身多但未成功翻過去，或者今日識聽日又唔做，都可以係學習過程。", notYetText: "如果仲未識翻，可以每日俾多啲安全 floor time／tummy time，將玩具放喺身體側邊少少吸引佢伸手轉重心；避免長時間困喺 bouncer、car seat 或其他限制活動嘅座椅。", actionText: "重點唔係『操到佢翻』，而係俾佢自由郁、伸手、踢腳、側身同俯臥練力量；每次短啲但一日多次。", whenToAsk: "如果接近／到 6 個月仍然頭頸控制好弱、完全冇嘗試轉身／移動、明顯只用一邊，或者身體異常好軟／好僵，值得同 health visitor／GP 傾。", category: "physical", priority: "development", kind: "milestone_check", editorialValue: "essential", triggerType: "exact_day", startDay: 182, guideTargetId: "months-5-6", source: SOURCES.developmentGuide }),
  r({ id: "day210-mobility", emoji: "🚼", title: "七個月左右：移動方式可能突然百花齊放", shortText: "有啲 BB 會轉圈、向後移、肚貼地拖行或者開始爬；唔一定先學「標準四點爬」。", whyNow: "核心、肩膀同髖部控制進步後，BB 會自己試唔同方式去到想去嘅地方。", normalText: "唔係每個 BB 都會用同一方法、同一時間爬。", actionText: "重新做一次 floor-level safety check，細物件、電線、寵物用品同家具縫都要留意。", whenToAsk: "如果你對左右身活動、肌肉張力或發展進度有持續疑慮，問 health visitor／GP。", category: "physical", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 210, guideTargetId: "safety", source: SOURCES.development }),
  r({ id: "day240-pincer", emoji: "🤏", title: "八個月左右：手指愈靈活，窒息風險都同步升級", shortText: "當 BB 由成隻手抓變成用手指夾細物件，地上任何硬幣、膠粒、寵物糧都突然變得「執得到」。", whyNow: "精細手部動作發展會令 BB 可以處理更細嘅物件。", normalText: "一開始會夾唔準、跌好多次，之後速度會進步得好快。", actionText: "每日由地面高度掃一次細物件，食物亦按安全 finger food 形狀準備。", whenToAsk: "如果 BB 真係吞咗危險物件、電池、磁石或出現 choking，按急症指引即時處理。", category: "safety", priority: "important", kind: "milestone", editorialValue: "essential", triggerType: "exact_day", startDay: 240, guideTargetId: "safety", source: SOURCES.safety }),
  r({ id: "day270-object", emoji: "🧸", title: "九個月左右：睇唔到唔代表「消失咗」開始有概念", shortText: "躲貓貓、將玩具半遮住再搵返，可能突然變得好好玩，因為 BB 開始理解物件仲存在。", whyNow: "記憶同 object permanence 概念逐步成熟。", normalText: "亦可能因此開始更介意你行開，出現 separation anxiety。", actionText: "玩簡單 peekaboo、短時間離開再返嚟，幫 BB 慢慢建立「你會返嚟」嘅經驗。", whenToAsk: "如果分離焦慮嚴重到長期影響食睡或你完全應付唔到，可以同 health visitor 傾。", category: "play", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 270, guideTargetId: "months-2-3", source: SOURCES.development }),
  r({ id: "day273-sitting-mobility-check", emoji: "🪑", title: "九個月左右：未爬未必有問題，但『坐同自主移動』值得望一望", shortText: "好多 BB 呢時可以唔使扶住坐一陣；爬行就差異好大，有啲會爬、有啲會坐住移動，亦有啲遲啲先開始。", whyNow: "核心同軀幹控制進步後，BB 通常會由單純躺住變成坐、轉身、肚貼地移動或者嘗試爬。", normalText: "未識四點爬唔需要追，因為唔係每個 BB 都會用同一種移動方式。", notYetText: "如果仲坐得唔穩，可以多俾地面活動：由你喺旁邊保護住坐、將玩具放左右兩邊引佢伸手平衡；亦繼續 tummy time 同自由翻身。唔好靠 baby walker『教行』。", actionText: "每日俾一段安全地面探索時間，玩具放少少距離鼓勵佢自己諗方法轉位，而唔係次次直接搬佢過去。", whenToAsk: "如果到 9 個月仍完全坐唔穩、動作明顯只用一邊、失去本身已識嘅動作，或者到 12 個月仍完全冇任何自主移動跡象，問 health visitor／GP。", category: "physical", priority: "development", kind: "milestone_check", editorialValue: "essential", triggerType: "exact_day", startDay: 273, guideTargetId: "safety", source: SOURCES.developmentGuide }),
  r({ id: "day300-stand", emoji: "🧍", title: "十個月左右：家具開始變成「攀爬架」", shortText: "有啲 BB 會扶住家具拉自己起身；而家最怕嘅唔係跌低少少，而係家具本身翻落嚟。", whyNow: "腿力、平衡同拉起身能力增加後，BB 會用身邊任何可抓住嘅嘢練站。", normalText: "企得起未必識坐返低，卡住喊好常見。", actionText: "固定高身家具、電視同櫃，移走可拉扯電線同枱布，提供穩固安全支撐。", whenToAsk: "如果發生家具翻倒、撞頭或明顯受傷，按急症情況求助。", category: "safety", priority: "important", kind: "milestone", editorialValue: "essential", triggerType: "exact_day", startDay: 300, guideTargetId: "safety", source: SOURCES.safety }),
  r({ id: "day350-one-year-vaccine", emoji: "💉", title: "一歲前兩星期：下一輪疫苗可以先睇定內容", shortText: "2026 England schedule 一歲後會有 PCV、MenB 同 MMRV；預先知道內容，可以到 appointment 時問得更清楚。", whyNow: "一歲係另一個重要 routine immunisation 時間點，而且疫苗組合同頭幾個月唔同。", normalText: "appointment 唔一定啱啱生日當日，通常由 GP 安排。", actionText: "留意 GP 通知、帶 Red Book，整理之前疫苗反應同你想問嘅問題。", whenToAsk: "如果過咗一歲仍完全冇安排，主動聯絡 GP。", category: "vaccination", priority: "action", kind: "preparation", editorialValue: "essential", triggerType: "exact_day", startDay: 350, guideTargetId: "vaccinations", source: SOURCES.vaccine }),
  r({ id: "day365-first-birthday", emoji: "🎂", title: "一歲：做一次「照顧模式升級」檢查", shortText: "今日最有用唔係逐項比 milestone，而係回顧：食物質感、飲杯、牙齒、活動安全、睡眠同疫苗有冇需要升級。", whyNow: "一歲後飲食、活動能力同家居風險會進入另一個階段。", normalText: "發展速度人人唔同，唔需要因為某一項未做到就即刻當落後。", actionText: "揀 3–5 項最實際嘅改動：例如杯、餐具、牙齒、家具安全、下一輪疫苗安排。", whenToAsk: "如果你對語言、動作、聽力、視力或整體發展有持續擔心，帶住具體例子同 health visitor／GP 傾。", category: "newborn", priority: "development", kind: "milestone", editorialValue: "high", triggerType: "exact_day", startDay: 365, guideTargetId: "timeline", source: SOURCES.development }),
  r({ id: "day366-walking-check", emoji: "👣", title: "一歲仲未識自己行？好多 BB 都未需要獨立行", shortText: "一歲左右有啲 BB 已經行幾步，但好多仲係扶住家具行、拉住企或者用其他方式移動，唔需要同人哋 BB 比。", whyNow: "12 個月左右，多數 BB 嘅腿力、平衡同由坐轉企能力正快速發展，但獨立行路可以再遲幾個月先出現。", normalText: "扶住行、側住家具巡航、企幾秒又坐低，都係向獨立行路發展嘅步驟。", notYetText: "如果仲未行，俾多啲安全 floor time、穩固家具扶住企／側行，同埋赤腳或防滑襪喺安全室內練平衡；唔好用 baby walker 催行，因為反而可能阻礙正常動作練習。", actionText: "將玩具放喺矮枱兩端，鼓勵 BB 自己由坐起身、扶住轉位；你可以伸手俾支援，但唔需要拉住雙手硬教佢行。", whenToAsk: "如果到一歲仍完全冇自主移動跡象，或者唔承重、明顯只用一邊、失去已識動作，就同 health visitor／GP 傾；未獨立行本身就唔等於落後。", category: "physical", priority: "development", kind: "milestone_check", editorialValue: "essential", triggerType: "exact_day", startDay: 366, guideTargetId: "safety", source: SOURCES.developmentGuide }),
  r({ id: "day540-walking-check", emoji: "🚶", title: "18 個月仲未企穩／未嘗試自己行，就值得主動問一問", shortText: "去到 18 個月，多數幼兒已經會自己企起身同嘗試獨立行；如果完全未有呢啲跡象，唔需要自己估原因。", whyNow: "12–18 個月係步行能力快速成熟嘅階段；到 18 個月，『未行』嘅處理同 12 個月時已經唔同。", normalText: "啱啱識行時腳擘得闊、成日跌、撞到家具都可以好常見，平衡會慢慢進步。", notYetText: "如果仲未做到，唔好用學行車逼進度。繼續提供安全地面活動、穩固 push／pull 玩具同日常企立機會，同時記低 BB 而家可以做到乜（例如會唔會自行坐起、拉住企、扶行），方便同 health visitor 講。", actionText: "直接聯絡 health visitor／GP 做一次發展評估，比起再等幾個月更有價值；如果只係行得唔穩，但有持續進步，就繼續安全練習。", whenToAsk: "如果 18 個月仍未能獨立站立、完全冇嘗試無支援步行、只用單邊、突然退步，或者你任何時候直覺覺得動作唔對路，都應該主動求助。", category: "physical", priority: "important", kind: "milestone_check", editorialValue: "essential", triggerType: "exact_day", startDay: 540, guideTargetId: "safety", source: SOURCES.developmentGuide }),
  r({ id: "event-cord-detached", emoji: "🧡", title: "臍帶今日甩咗：之後其實唔使特別「消毒」", shortText: "自然甩落後保持肚臍清潔乾爽就得；少量血漬可以見到，但唔應該持續流血。", whyNow: "臍帶殘端甩落後，下面皮膚仍然需要少少時間完全癒合。", normalText: "少量乾血或輕微滲出可以短暫出現。", actionText: "沖涼／清潔後輕輕印乾，唔好摳結痂，尿片邊避免磨住。", whenToAsk: "如果持續出血、膿、臭味、紅腫擴散或 BB 發燒，要問醫護。", category: "umbilical", priority: "action", kind: "care_check", editorialValue: "essential", triggerType: "event_based", eventKey: "umbilicalCordDetachedAt", eventOffsetDays: 0, guideTargetId: "nappies-care", source: SOURCES.newborn }),
  r({ id: "event-first-tooth", emoji: "🪥", title: "第一隻牙今日出咗：刷牙由今日開始", shortText: "唔使等出齊牙先刷；第一隻牙一冒出，就可以開始每日兩次用含 fluoride 牙膏刷。", whyNow: "蛀牙風險由牙齒出現就開始，早啲建立習慣比之後先追更容易。", normalText: "一開始 BB 唔合作、淨係刷到幾秒好常見。", actionText: "用細頭軟毛牙刷同適合嬰幼兒嘅含 fluoride 牙膏，少量就夠。", whenToAsk: "如果牙肉持續出血、腫得異常或你唔肯定牙膏 fluoride 濃度，問 dentist／health visitor。", category: "teeth", priority: "action", kind: "milestone", editorialValue: "essential", triggerType: "event_based", eventKey: "firstToothDate", eventOffsetDays: 0, guideTargetId: "months-5-6", source: SOURCES.teeth }),
  r({ id: "event-solids-allergen", emoji: "🥚", title: "既然已經開始 solids，常見致敏食物唔需要無限期拖後", shortText: "雞蛋、花生等可以按安全指引由少量、逐一引入，方便睇清楚有冇反應。", whyNow: "開始 solids 後就進入建立食物多樣性嘅階段；無原因長期拖延某啲常見 allergen 未必有好處。", normalText: "第一次只需要少量，而且最好日頭試，方便觀察。", actionText: "一次引入一種、少量開始；成功食過後可按指引繼續定期出現喺飲食。", whenToAsk: "如果 BB 有嚴重濕疹、已知食物過敏，或者曾經有即時過敏反應，先問 GP／allergy team。", category: "allergens", priority: "action", kind: "care_check", editorialValue: "essential", triggerType: "event_based", eventKey: "startedSolidsAt", eventOffsetDays: 2, guideTargetId: "months-5-6", source: SOURCES.allergens }),
  r({ id: "event-solids-cup", emoji: "🥤", title: "開始 solids 呢個星期，可以順便開始學飲杯", shortText: "餐時俾少量水，用 open cup 或 free-flow cup 練習；一開始倒多過飲好正常。", whyNow: "加固開始後正好建立飲杯技能，唔需要等到戒奶樽先學。", normalText: "最初只係學動作，唔靠水提供主要營養。", actionText: "每餐提供幾啖練習，成人幫手托杯，唔需要追求飲幾多。", whenToAsk: "如果 BB 飲任何液體都持續咳、嗆或吞嚥困難，問 health visitor／GP。", category: "weaning", priority: "development", kind: "care_check", editorialValue: "high", triggerType: "event_based", eventKey: "startedSolidsAt", eventOffsetDays: 5, guideTargetId: "months-5-6", source: SOURCES.weaning }),
  r({ id: "event-first-roll", emoji: "🛏️", title: "第一次翻身出現：睡眠安全設定要即刻再檢查", shortText: "一旦開始有翻身能力，唔好再假設 BB 會一直留喺原位；睡床要保持完全清空。", whyNow: "翻身代表活動能力跨咗一級，夜晚同無人直接望住時嘅環境安全變得更重要。", normalText: "初期可能只會單方向翻，甚至識翻過去未識翻返嚟。", actionText: "繼續每次仰睡放低 BB，cot 內唔加枕頭、定位墊、床圍或玩具。", whenToAsk: "如果翻身時似乎卡住呼吸、動作明顯只用單邊或你擔心肌肉控制，問 health visitor／GP。", category: "sleep", priority: "important", kind: "milestone", editorialValue: "essential", triggerType: "event_based", eventKey: "firstRollAt", eventOffsetDays: 0, guideTargetId: "sleep", source: SOURCES.sleep }),


  r({
    id: 'maternal-postpartum-urination',
    emoji: '🚽',
    title: '產後 4–6 小時內：記住第一次小便',
    shortText: '一般應喺生產後，或拔除導尿管後 4–6 小時內排尿；唔好因為冇尿意就長時間等。',
    whyNow: '生產、會陰腫脹、疼痛、疲累，以及腰麻／硬膜外麻醉，都可能令膀胱感覺暫時唔明顯；膀胱過脹會影響排尿恢復。',
    normalText: '有尿意唔代表一定排清，冇尿意亦唔代表膀胱係空；醫護可能會量度第一次尿量，必要時用膀胱掃描評估。',
    actionText: '記低生產或拔導尿管時間；4 小時仍未排尿、只排到好少，或下腹脹痛，就即刻話俾 midwife 知，唔好自己硬等到 6 小時後。',
    whenToAsk: '6 小時仍然排唔到尿、反覆只係少量尿、下腹明顯脹痛，或出現失禁／排尿困難，都要即日由 midwife、GP 或 maternity team 評估。',
    category: 'maternal',
    priority: 'important',
    kind: 'care_check',
    editorialValue: 'essential',
    triggerType: 'exact_day',
    startDay: 0,
    guideTargetId: 'caregiver-wellbeing',
    source: SOURCES.postpartum,
  }),
  r({
    id: 'maternal-caesarean-first-mobilisation',
    emoji: '🛏️',
    title: '剖腹產後第一次落床：唔好自己起身',
    shortText: '要等雙腳感覺同力量恢復、血壓穩定，並由醫護陪同先落床；唔係人人同一個固定時間。',
    whyNow: '腰麻／硬膜外麻醉未完全退時，雙腳可能麻痺或無力；手術後亦可能頭暈、痛或有導尿管，自己落床有跌倒風險。',
    normalText: '好多醫院會喺手術後約 6–8 小時協助起身活動，但實際時間要按麻醉、血壓、出血、痛楚同你當時狀況決定。',
    actionText: '第一次要落床先按鐘叫人；等醫護確認雙腳有足夠力量，先由人陪同慢慢坐起、站立，再行到椅或廁所。',
    whenToAsk: '雙腳持續無力、暈眩、胸痛、氣促、出血增加或傷口痛楚突然加劇，唔好落床自行處理，立即通知醫護。',
    category: 'maternal',
    priority: 'important',
    kind: 'care_check',
    editorialValue: 'essential',
    triggerType: 'exact_day',
    startDay: 0,
    guideTargetId: 'caregiver-wellbeing',
    source: SOURCES.caesarean,
  }),
  r({
    id: 'maternal-lochia-change',
    emoji: '🩸',
    title: '產後第 1–2 週：觀察惡露變化',
    shortText: '頭幾日鮮紅或紅褐，之後通常逐漸變淡至粉紅／啡，再變黃或白，份量會慢慢減少；惡露可持續幾星期。',
    whyNow: '惡露係子宮恢復時排出嘅血液、黏液同組織；顏色同份量會隨時間改變，餵母乳或活動後短暫紅啲、多少少亦可能出現。',
    normalText: '初期較重、之後逐步減少係常見趨勢；細小血塊可以出現，但唔應該反覆出現大血塊、愈來愈重或有惡臭。',
    actionText: '用產婦衛生巾並勤換，換前後洗手；記低份量、顏色、氣味同有冇血塊。產後 6 週檢查前避免使用棉條或月經杯。',
    whenToAsk: '突然大量出血、頭暈／暈眩或心跳很快要 call 999；大血塊（約 50p 硬幣或更大）、惡臭、發燒、肚痛加劇或出血愈來愈多，要即日聯絡 maternity team、midwife、GP 或 NHS 111。',
    category: 'maternal',
    priority: 'important',
    kind: 'care_check',
    editorialValue: 'essential',
    triggerType: 'day_range',
    startDay: 1,
    endDay: 14,
    guideTargetId: 'caregiver-wellbeing',
    source: SOURCES.postpartumBody,
  }),
  r({
    id: 'maternal-afterpains-day2',
    emoji: '🌿',
    title: '第 2 日：似經痛嘅子宮收縮痛可以係正常',
    shortText: '生完第二日有啲似經痛，可能係子宮收縮、慢慢縮返細同排出惡露嘅過程；餵奶時或會更明顯。',
    whyNow: '子宮要由懷孕後嘅大小逐步縮返去；餵母乳會令身體釋放 oxytocin，收縮感可能短暫加強。',
    normalText: '輕至中度、間歇性、休息或按出院指示處理後有改善嘅下腹痛，常見於產後頭幾日。',
    actionText: '休息、補充水分，並只按出院單張或醫護指示使用止痛藥；如果餵奶時痛得明顯，可先同 midwife 講。',
    whenToAsk: '疼痛突然好強、持續加劇或止痛後仍冇改善，尤其同發燒、肚痛、惡臭惡露、大量出血或傷口異常一齊出現，要盡快求醫。',
    category: 'maternal',
    priority: 'important',
    kind: 'care_check',
    editorialValue: 'high',
    triggerType: 'exact_day',
    startDay: 2,
    guideTargetId: 'caregiver-wellbeing',
    source: SOURCES.postpartumBody,
  }),
  r({
    id: 'maternal-shower-and-hair',
    emoji: '🚿',
    title: '自然產／剖腹產後：可以洗澡同洗頭',
    shortText: '自然產或剖腹產後都可以按身體狀況淋浴洗澡洗頭；花灑較易保持傷口乾淨，唔好大力擦傷口。',
    whyNow: '保持身體、會陰或剖腹傷口清潔有助日常護理；淋浴比長時間浸浴更容易控制傷口接觸到嘅水分。',
    normalText: '剖腹產防水敷料通常可以按醫院指示淋浴；傷口用清水輕洗後印乾，唔好將香皂、沐浴露或香料產品直接搽落傷口。',
    actionText: '先準備毛巾同乾淨衣物，感到頭暈就叫人陪；淋浴後用乾淨毛巾輕輕印乾，浴缸浸浴、敷料或傷口護理按你醫院出院指示。',
    whenToAsk: '傷口愈來愈紅腫、滲液、流血、裂開、發臭，或你洗澡時感到暈眩、氣促，要停止並聯絡醫護。',
    category: 'maternal',
    priority: 'action',
    kind: 'care_check',
    editorialValue: 'high',
    triggerType: 'exact_day',
    startDay: 3,
    guideTargetId: 'caregiver-wellbeing',
    source: SOURCES.caesarean,
  }),
  r({
    id: 'maternal-first-week-diet',
    emoji: '🍲',
    title: '產後首星期：均衡飲食比「補品」重要',
    shortText: '唔使刻意捱餓或只食清淡；宜食蛋白質、鐵、纖維、蔬果同足夠水分。酒精應避免，麻油／人參等補品唔係必要催奶方法。',
    whyNow: '產後身體要修復、補回失血及應付餵奶／照顧 BB；均衡飲食亦有助減少便秘，唔需要靠單一食物或草藥「催奶」。',
    normalText: 'NHS 指餵母乳唔需要特別飲食；一般食物可按均衡原則選擇。麻油作普通調味唔等於必須全面禁止，但人參、草藥或補充劑成分及安全性不一，唔好自行服用。',
    actionText: '每餐加蛋白質（蛋、肉、魚、豆類或奶類）、全穀物、蔬果；口渴就飲水，若醫護開咗鐵劑就按指示服用。餵母乳期間最安全係唔飲酒，亦要先問 pharmacist／醫護有關草藥補品。',
    whenToAsk: '如果有大出血、貧血、糖尿病、腎病、剖腹產或其他飲食限制，按醫院／GP／dietitian 個別建議；服用任何補充劑前先核對。',
    category: 'maternal',
    priority: 'action',
    kind: 'care_check',
    editorialValue: 'essential',
    triggerType: 'exact_day',
    startDay: 4,
    guideTargetId: 'caregiver-wellbeing',
    source: SOURCES.breastfeedingDiet,
  }),
  r({
    id: 'maternal-breastfeeding-food-and-supply',
    emoji: '🍼',
    title: '第 7 日：母乳唔靠某一種食物催奶',
    shortText: '冇一種指定食物可以保證增奶；奶量主要靠 BB 按需要有效吸吮，或按需要擠奶，加上皮膚接觸。',
    whyNow: '頭幾星期奶量同餵奶節奏仍在建立，BB 密密食、cluster feeding 或第 2–4 日乳房變飽都可以係常見過程。',
    normalText: '餵母乳可以照食多元化食物，通常唔需要戒奶、蛋、花生等，除非媽媽自己過敏、BB 有明確反應或醫護要求；留意整體餵食、吞嚥、濕尿片同體重。',
    actionText: '跟 BB 飢餓訊號餵、確保含乳同吞嚥有效，盡量皮膚接觸；如無法親餵，按餵奶顧問／midwife 教法定時擠奶。咖啡因每日不多於約 200mg，餵母乳期間最安全係避免酒精。',
    whenToAsk: '如果持續含乳痛、乳頭損傷、BB 難以含乳／吞嚥、濕尿片少、體重有疑慮，或你覺得奶量不足，盡快請 midwife、health visitor 或 breastfeeding specialist 觀察一餐；唔好自行用草藥或藥物催奶。',
    category: 'maternal',
    priority: 'action',
    kind: 'care_check',
    editorialValue: 'essential',
    triggerType: 'exact_day',
    startDay: 7,
    feedingMethods: ['breast', 'mixed'],
    guideTargetId: 'feeding',
    source: SOURCES.breastfeedingSupply,
  }),
  r({
    id: 'maternal-health-visitor-prep',
    emoji: '📅',
    title: '第 9 日：預備 10–14 日健康訪視',
    shortText: 'Health visitor 通常會喺 BB 出生後約 10–14 日見你同 BB；未收到聯絡就主動問助產士、GP 或本區服務。',
    whyNow: '呢次唔只係睇 BB，亦可以講媽媽身體恢復、情緒、餵奶、睡眠、傷口、排尿同家庭支援。',
    normalText: '實際日期、地點可以因地區同家庭需要唔同，唔一定啱啱第 10 或第 14 日；以 health visiting team 通知為準。',
    actionText: '提前寫低惡露、疼痛、傷口、排尿、便秘、情緒、餵奶同想問嘅問題，並帶紅簿、出院文件及紀錄。',
    whenToAsk: '如果未收到任何聯絡、身體或情緒問題等唔到訪視先講；有疑慮可即日聯絡 midwife、GP、health visitor 或 NHS 111。',
    category: 'maternal',
    priority: 'action',
    kind: 'preparation',
    editorialValue: 'essential',
    triggerType: 'exact_day',
    startDay: 9,
    guideTargetId: 'caregiver-wellbeing',
    source: SOURCES.postpartum,
  }),
  r({
    id: 'maternal-six-to-eight-week-check-prep',
    emoji: '🩺',
    title: '第 5 週：預先確認媽媽 6–8 週產後檢查',
    shortText: 'GP 應提供媽媽 6–8 週產後檢查；而家可以先睇下有冇預約，冇就主動聯絡 GP surgery。',
    whyNow: '呢個檢查會回顧身體恢復、惡露、傷口／會陰、血壓（如適用）、情緒、膀胱、避孕同其他需要跟進嘅問題。',
    normalText: '媽媽檢查同 BB 6–8 週身體檢查係兩項不同評估，可以前後安排但唔應假設只做咗 BB 檢查就代表媽媽檢查完成。',
    actionText: '預先列低出血、疼痛、傷口、排尿／排便、性行為疼痛、情緒、餵奶、避孕同想問醫生嘅問題；實際預約日期按 GP 安排。',
    whenToAsk: '唔使等到 6–8 週先求助：大量出血、氣促胸痛、單邊小腿腫痛、發燒、傷口惡化或情緒／安全有即時危險，應按急症路線求助。',
    category: 'maternal',
    priority: 'action',
    kind: 'preparation',
    editorialValue: 'essential',
    triggerType: 'exact_day',
    startDay: 35,
    guideTargetId: 'caregiver-wellbeing',
    source: SOURCES.postnatalCheck,
  }),
];

export const BABY_REMINDER_COUNT = babyReminders.length;
