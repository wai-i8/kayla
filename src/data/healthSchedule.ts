export type HealthScheduleCategory =
  | "check"
  | "visit"
  | "vaccine"
  | "admin"
  | "treatment";

export type HealthScheduleAudience = "universal" | "conditional";

export interface HealthScheduleSource {
  label: string;
  url: string;
}

/**
 * A fixed England health-schedule definition.
 *
 * `startDay` and `endDay` are calendar days after birth (day 0 is the date of
 * birth). They are reference windows rather than confirmed appointments; the
 * family's actual appointment date should always take priority in the UI.
 */
export interface HealthScheduleDefinition {
  id: string;
  title: string;
  shortTitle: string;
  category: HealthScheduleCategory;
  audience: HealthScheduleAudience;
  startDay: number;
  endDay: number;
  timingMode?: "seasonal";
  autoApplicableGestationalWeeksBelow?: number;
  displayTiming: string;
  summary: string;
  why: string;
  whatToExpect: string[];
  prepare: string[];
  followUp?: string[];
  conditionalNote?: string;
  sources: HealthScheduleSource[];
}

export const HEALTH_SCHEDULE_REGION = "England" as const;
export const HEALTH_SCHEDULE_EFFECTIVE_FROM = "2026-07-01" as const;
export const HEALTH_SCHEDULE_REVIEWED_AT = "2026-08-29" as const;

const NHS_PHYSICAL_EXAM =
  "https://www.nhs.uk/baby/newborn-screening/physical-examination/";
const NHS_EARLY_DAYS =
  "https://www.nhs.uk/pregnancy/labour-and-birth/early-days/";
const NHS_NEWBORN =
  "https://www.nhs.uk/pregnancy/labour-and-birth/getting-to-know-your-newborn/";
const NHS_BABY_REVIEWS =
  "https://www.nhs.uk/baby/babys-development/height-weight-and-reviews/baby-reviews/";
const NHS_PARENT_SUPPORT =
  "https://www.nhs.uk/baby/support-and-services/services-and-support-for-parents/";
const NHS_GP_REGISTRATION =
  "https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/";
const NHS_BLOOD_SPOT =
  "https://www.nhs.uk/baby/newborn-screening/blood-spot-test/";
const NHS_HEARING =
  "https://www.nhs.uk/baby/newborn-screening/hearing-test/";
const NHS_CHILD_FLU = "https://www.nhs.uk/vaccinations/child-flu-vaccine/";
const NHS_ROTAVIRUS = "https://www.nhs.uk/vaccinations/rotavirus-vaccine/";
const GOV_BIRTH_REGISTRATION = "https://www.gov.uk/register-birth";
const GOV_NIPE =
  "https://www.gov.uk/government/publications/screening-tests-for-you-and-your-baby-stfyayb/eyes-heart-hips-and-testes-physical-examination";
const GOV_HIP_PATHWAY =
  "https://www.gov.uk/government/publications/newborn-and-infant-physical-examination-programme-handbook/nipe-newborn-hip-screening-screen-positive-pathway";
const GOV_HEALTHY_CHILD_PROGRAMME =
  "https://www.gov.uk/government/publications/delivery-of-the-healthy-child-programme/part-2-health-visiting-ages-0-to-5";
const GOV_NBS_REPEAT =
  "https://www.gov.uk/government/publications/health-professional-handbook-newborn-blood-spot-screening/4-repeat-blood-samples";
const GOV_HEPB_PREGNANCY_HANDBOOK =
  "https://www.gov.uk/government/publications/infectious-diseases-in-pregnancy-screening-programme-handbook/nhs-infectious-diseases-in-pregnancy-screening-programme-handbook";
const GOV_MENB_PARACETAMOL =
  "https://www.gov.uk/government/publications/menb-vaccine-and-paracetamol/using-paracetamol-to-prevent-and-treat-fever-after-menb-vaccination";
const GOV_IMMUNISATIONS_2026 =
  "https://www.gov.uk/government/publications/routine-childhood-immunisation-schedule/routine-childhood-immunisations-from-1-july-2026";

/**
 * England routine newborn schedule from birth to six months.
 *
 * Universal entries are routinely offered to every baby. Conditional entries
 * must not be presented as routine appointments: they only apply when the
 * maternity, screening, GP or vaccination team confirms eligibility/referral.
 */
const HEALTH_SCHEDULE_ITEMS: HealthScheduleDefinition[] = [
  {
    id: "newborn-physical-exam",
    title: "初生嬰兒身體檢查（NIPE）",
    shortTitle: "72 小時身體檢查",
    category: "check",
    audience: "universal",
    startDay: 0,
    endDay: 3,
    displayTiming: "出生後 72 小時內",
    summary:
      "醫護會為 BB 做一次由頭到腳嘅檢查，通常喺出院前完成；如果喺屋企或其他地方出生，亦可安排喺屋企、診所或 GP 做。",
    why:
      "除咗整體健康狀況，檢查會特別留意眼睛、心臟、髖關節，同男嬰嘅睪丸，及早發現可能需要跟進嘅問題。",
    whatToExpect: [
      "醫護會先問 BB 嘅餵奶、一般狀況同家族病史。",
      "BB 要除去部分衣物；醫護會照眼、聽心、活動髖關節，男嬰亦會檢查睪丸位置。",
      "檢查唔會令 BB 痛，結果通常即場講解，並記入紅簿。",
    ],
    prepare: [
      "帶紅簿；如果未收到紅簿，記低檢查日期同結果。",
      "準備講低 BB 餵奶、呼吸、膚色、黃疸或其他令你擔心嘅情況。",
    ],
    followUp: [
      "如檢查有疑點，醫護會安排相應專科或進一步檢查。",
      "同一套核心檢查會喺 6 至 8 週再做一次，因為有啲情況較遲先睇得出。",
    ],
    sources: [
      { label: "NHS：Newborn physical examination", url: NHS_PHYSICAL_EXAM },
      { label: "GOV.UK：Eyes, heart, hips and testes screening", url: GOV_NIPE },
    ],
  },
  {
    id: "midwife-early-follow-up",
    title: "社區助產士早期跟進",
    shortTitle: "助產士跟進",
    category: "visit",
    audience: "universal",
    startDay: 0,
    endDay: 10,
    displayTiming: "出生後至約第 10 日；實際次數按個別計劃",
    summary:
      "離院後，助產士會同家庭訂好家訪或中心覆診安排；呢段時間可能唔止一次見面，實際日期同次數按媽媽同 BB 需要而定。",
    why:
      "早期跟進用嚟確認媽媽恢復情況、BB 餵奶同體重趨勢，亦會留意黃疸、臍帶或眼睛感染、口腔鵝口瘡、體溫同反射。",
    whatToExpect: [
      "傾餵奶、尿片、睡眠、BB 精神同媽媽身心狀況。",
      "按需要量體溫、磅重、檢查黃疸、臍帶、皮膚、口腔或眼睛。",
      "約第 5 日通常會同時做腳跟採血；之後照顧會逐步交俾 health visitor。",
    ],
    prepare: [
      "將餵奶、尿片同體溫紀錄準備好，方便醫護睇趨勢。",
      "離院前記低社區助產士聯絡方法；如未收到預約，主動聯絡產科團隊。",
      "列低想問嘅問題，包括傷口、出血、情緒、餵奶或 BB 黃疸。",
    ],
    followUp: [
      "助產士通常照顧至 BB 約 10 日；如有額外需要，跟進時間可延長或轉介其他服務。",
      "BB 約 10 至 14 日會有 health visitor 新生嬰兒家訪／評估。",
    ],
    sources: [{ label: "NHS：Early days after birth", url: NHS_EARLY_DAYS }],
  },
  {
    id: "vitamin-k-after-birth",
    title: "維他命 K（出生後確認）",
    shortTitle: "維他命 K",
    category: "treatment",
    audience: "universal",
    startDay: 0,
    endDay: 1,
    displayTiming: "出生後首 24 小時獲提供",
    summary:
      "醫護會喺首 24 小時提出為 BB 注射維他命 K，預防一種罕見但可以好嚴重嘅出血問題。家長可同醫護討論注射或口服選擇。",
    why:
      "初生 BB 體內維他命 K 儲備較少，而維他命 K 對正常凝血好重要；補充可大幅降低維他命 K 缺乏性出血風險。",
    whatToExpect: [
      "首選通常係一次肌肉注射，醫護會解釋益處、選擇同取得同意。",
      "如果家長選擇口服液體，NHS 指保護效果可能不及注射，而且部分 BB 未必適合口服。",
      "口服方案可能要按本區／產品安排再補服，實際次數同日期必須由產科或兒科團隊確認。",
    ],
    prepare: [
      "離院前問清楚 BB 接受咗邊種方式，並確認已記入紅簿／出院紀錄。",
      "如果選擇口服，將所有後續劑量、地點及日期逐一加入實際預約，唔好只靠本頁出生提示。",
    ],
    followUp: [
      "如口服後續劑量未有清楚安排，離院前或盡快聯絡助產士確認。",
      "如 BB 有不尋常出血、瘀傷、面色差、異常嗜睡或其他急性問題，立即向醫護求助。",
    ],
    sources: [{ label: "NHS：Your newborn baby", url: NHS_NEWBORN }],
  },
  {
    id: "first-week-weight-feeding-review",
    title: "首星期體重及餵食跟進",
    shortTitle: "首星期磅重",
    category: "visit",
    audience: "universal",
    startDay: 1,
    endDay: 7,
    displayTiming: "出生後首星期；通常由助產士按計劃跟進",
    summary:
      "NHS 指 BB 會喺出生時磅重，並喺首星期再磅一次。今次要連同餵奶、尿片、黃疸同精神狀況一齊判斷，唔係只睇一個數字。",
    why:
      "出生後首幾日有少量體重下降可以係正常；跟進趨勢有助及早發現餵食、脫水、黃疸或其他需要額外支援嘅情況。",
    whatToExpect: [
      "助產士會磅重，將結果畫入紅簿生長圖，並同出生體重及餵食情況一齊解釋。",
      "會問每日餵奶次數、吞嚥／含乳、奶樽份量、濕片及便便情況。",
      "如體重下降較多、未按預期回升或餵奶困難，會安排較密磅重、餵奶評估或醫療檢查。",
    ],
    prepare: [
      "帶紅簿，同時準備餵奶、濕片、便便同任何嘔吐紀錄。",
      "如用奶樽，記低奶種、每次份量同實際飲到幾多；如埋身餵，記低邊邊乳房同大約時間。",
      "唔好因為想令體重數字好睇而臨時改變正常餵奶；照平日安排即可。",
    ],
    followUp: [
      "跟醫護講明下次需唔需要再磅；有疑慮時唔應等到例行檢查先求助。",
      "今次磅重可能同助產士家訪或第 5 日腳跟採血喺同一次見面完成，唔一定係三個獨立預約。",
      "如果 BB 健康、體重持續上升而 health visitor 冇擔心，NHS 建議 6 個月前最多每月磅一次；呢個係上限，唔代表必須每月預約。",
    ],
    sources: [
      { label: "NHS：Baby health and development reviews", url: NHS_BABY_REVIEWS },
      { label: "NHS：Early days after birth", url: NHS_EARLY_DAYS },
    ],
  },
  {
    id: "gp-registration",
    title: "替 BB 登記 GP",
    shortTitle: "登記 GP",
    category: "admin",
    audience: "universal",
    startDay: 0,
    endDay: 7,
    displayTiming: "出生後盡快（本日程以首 7 日作整理提示，並非官方期限）",
    summary:
      "NHS 建議盡早幫 BB 登記家庭醫生，等有需要時可以求診，亦方便診所安排 6 至 8 週檢查同疫苗邀請。",
    why:
      "及早完成登記可減少之後預約檢查或疫苗時嘅行政延誤；即使 BB 未登記，如有緊急需要仍可向任何 GP surgery 求助。",
    whatToExpect: [
      "通常要為 BB 獨立填一份登記表；大部分診所可網上申請。",
      "診所可能要求 BB 身分／地址資料、家長或監護人資料，以及紅簿。",
      "NHS 指一般會喺診所收到資料後約 5 日通知登記結果，但有時需時較長。",
    ],
    prepare: [
      "準備 BB 嘅 NHS number（如已有）、出生資料、住址同紅簿。",
      "先向同區 GP surgery 查詢接收範圍及網上登記方法。",
    ],
    followUp: [
      "收到確認後，核對診所資料，並問清楚 6 至 8 週檢查及疫苗邀請方式。",
    ],
    sources: [
      { label: "NHS：Services and support for parents", url: NHS_PARENT_SUPPORT },
      { label: "NHS：Register with a GP surgery", url: NHS_GP_REGISTRATION },
    ],
  },
  {
    id: "hepatitis-b-birth-dose",
    title: "乙型肝炎疫苗：出生劑",
    shortTitle: "乙肝出生劑",
    category: "vaccine",
    audience: "conditional",
    startDay: 0,
    endDay: 0,
    displayTiming: "出生後 24 小時內；只限醫療團隊確認需要嘅 BB",
    summary:
      "如果媽媽驗出乙型肝炎，BB 會獲安排額外嘅單價乙型肝炎疫苗，第一劑應喺出生後 24 小時內接種；較高傳染風險或出生體重 1,500 g 或以下嘅 BB，仲可能要同時注射 HBIG。",
    why:
      "呢個選擇性計劃用嚟降低乙型肝炎由媽媽傳俾 BB、以及日後形成慢性感染嘅風險。",
    whatToExpect: [
      "醫院／產科團隊通常會預先識別適用 BB，並安排出生劑。",
      "如果媽媽屬較高傳染風險，或 BB 出生體重 1,500 g 或以下，醫療團隊會判斷係咪要喺 24 小時內加用乙型肝炎免疫球蛋白（HBIG）。",
      "呢劑係額外疫苗，唔會取代 8、12、16 週例行 6-in-1 內含嘅乙型肝炎成分。",
    ],
    prepare: [
      "如果產前驗血顯示媽媽有乙型肝炎，離院前確認 BB 已於 24 小時內接種、係咪同時需要／已接受 HBIG，以及下一次日期。",
      "請醫護將疫苗名稱、批次同日期記入紅簿。",
    ],
    followUp: [
      "下一劑單價乙型肝炎疫苗係 4 週大。",
      "之後仍要按時接種 8、12、16 週 6-in-1；現行計劃另包括 18 個月 6-in-1，並於 12 至 18 個月驗 HBsAg，詳情跟足專科／疫苗團隊安排。",
    ],
    conditionalNote:
      "只適用於媽媽有乙型肝炎嘅 BB；如果醫護冇通知需要，唔應自行當作例行疫苗預約。",
    sources: [
      { label: "UKHSA：Routine childhood immunisations from 1 July 2026", url: GOV_IMMUNISATIONS_2026 },
      { label: "GOV.UK：Infectious diseases in pregnancy handbook", url: GOV_HEPB_PREGNANCY_HANDBOOK },
    ],
  },
  {
    id: "bcg-selective",
    title: "BCG 結核病疫苗",
    shortTitle: "BCG（條件性）",
    category: "vaccine",
    audience: "conditional",
    startDay: 0,
    endDay: 28,
    displayTiming: "出生後 28 日內；只限符合風險條件嘅 BB",
    summary:
      "英格蘭唔係每個 BB 都例行接種 BCG。符合地區或家族出生地風險條件嘅 BB，會獲安排喺出生後 28 日內接種。",
    why:
      "BCG 主要保護 BB 對抗嚴重結核病；計劃集中為較可能接觸結核菌嘅嬰兒提供保護。",
    whatToExpect: [
      "適用情況包括居住地結核病年發病率達指定水平，或父母／祖父母喺高發病率國家出生。",
      "接種前醫護要先查看 SCID（嚴重複合免疫缺陷）篩查結果。",
      "疫苗通常注射於上臂，醫護會講解之後局部反應同護理方法。",
    ],
    prepare: [
      "如醫護問及風險，準備父母同祖父母出生國家／地區資料。",
      "帶紅簿及任何 BCG 邀請信；確認 SCID 篩查結果已可供接種團隊查看。",
    ],
    followUp: [
      "按接種團隊指示觀察針口；如反應令人擔心，聯絡 GP、health visitor 或接種診所。",
    ],
    conditionalNote:
      "只限 NHS／疫苗團隊確認符合資格嘅 BB；如唔肯定，問助產士、health visitor 或 GP，唔好自行預設一定需要。",
    sources: [
      { label: "UKHSA：Routine childhood immunisations from 1 July 2026", url: GOV_IMMUNISATIONS_2026 },
    ],
  },
  {
    id: "birth-registration",
    title: "登記出生",
    shortTitle: "出生登記",
    category: "admin",
    audience: "universal",
    startDay: 0,
    endDay: 42,
    displayTiming: "出生後 42 日內（英格蘭法定期限）",
    summary:
      "英格蘭嘅出生必須喺 BB 出生後 42 日內登記；一般去 BB 出生地區嘅 register office，部分醫院亦可辦理。",
    why:
      "出生登記會建立正式出生紀錄，之後可購買出生證明，亦方便處理 Child Benefit 等家庭行政。",
    whatToExpect: [
      "通常要預約 register office；如去另一區辦理，資料會轉交 BB 出生地區。",
      "登記時會問 BB 出生日期、地點、姓名、性別，以及父母資料。",
      "邊位家長可以單獨登記，會視乎婚姻／civil partnership 及親權情況而定。",
    ],
    prepare: [
      "先查 BB 出生地區 register office 嘅預約方法。",
      "帶至少一份認可身分證明；準備父母出生、職業、住址及婚姻／civil partnership 資料。",
      "帶紅簿；部分 registrar 會要求查看。",
    ],
    followUp: [
      "登記後可按需要購買短版或完整版出生證明。",
      "保存多一份出生證明副本，方便 GP、護照、福利或其他申請。",
    ],
    sources: [{ label: "GOV.UK：Register a birth", url: GOV_BIRTH_REGISTRATION }],
  },
  {
    id: "newborn-blood-spot",
    title: "初生嬰兒腳跟採血（blood spot）",
    shortTitle: "第 5 日腳跟採血",
    category: "check",
    audience: "universal",
    startDay: 5,
    endDay: 8,
    displayTiming: "通常出生第 5 日；如有需要可於第 5 至 8 日完成",
    summary:
      "醫護會喺 BB 腳跟取幾滴血，篩查一組罕見但嚴重、愈早發現愈有利治療嘅疾病。通常由社區助產士喺屋企做，亦可能喺醫院或其他預約完成。",
    why:
      "BB 外表健康都可能有相關疾病；篩查可以喺症狀出現前發現，盡早安排檢查、治療或飲食管理。",
    whatToExpect: [
      "醫護用細小採血工具刺腳跟，將幾滴血印喺專用卡，再送化驗。",
      "過程好快，但 BB 可能短暫喊或唔舒服。",
      "結果通常會記入紅簿；如結果需要迅速跟進，醫療團隊會較早聯絡。",
    ],
    prepare: [
      "唔需要特別醫療準備；採血時可餵奶或抱住 BB，令佢保持溫暖同安定。",
      "帶紅簿，並記低採血日期同採血地點。",
      "呢次可能同助產士家訪及磅重一齊完成；只要逐項確認有做同有紀錄，唔需要另外追求三個預約。",
    ],
    followUp: [
      "應該喺 BB 6 週大前收到結果；如到時仍未收到，聯絡助產士、health visitor 或 GP。",
      "如 BB 未做過，盡快通知助產士、health visitor 或 GP，查詢仲可唔可以補做。",
    ],
    sources: [
      { label: "NHS：Newborn blood spot test", url: NHS_BLOOD_SPOT },
      { label: "NHS：Early days after birth", url: NHS_EARLY_DAYS },
    ],
  },
  {
    id: "health-visitor-new-baby-review",
    title: "Health visitor 新生嬰兒評估",
    shortTitle: "Health visitor 家訪",
    category: "visit",
    audience: "universal",
    startDay: 10,
    endDay: 14,
    displayTiming: "約出生第 10 至 14 日",
    summary:
      "health visitor 通常會喺屋企、GP、診所或兒童中心見你同 BB，接手較長期嘅成長、餵奶、睡眠同家庭支援。",
    why:
      "呢次唔只係睇 BB，亦係了解全家適應情況、照顧者情緒同實際支援需要，及早連結本區服務。",
    whatToExpect: [
      "傾 BB 餵奶、尿片、睡眠、哭鬧、成長同發展；按需要磅重或量頭圍。",
      "講解紅簿、疫苗、safe sleep、意外預防，以及遇到問題可以搵邊個。",
      "health visitor 亦會關心媽媽／伴侶嘅情緒、恢復、壓力同家庭支援。",
    ],
    prepare: [
      "帶紅簿、餵奶／尿片／體溫紀錄，同埋出院或篩查文件。",
      "列低餵奶、瞓覺、黃疸、臍帶、皮膚、情緒或家居支援問題。",
      "如果未收到聯絡，向助產士、GP 或本區 health visiting service 查詢。",
    ],
    followUp: [
      "確認日後點樣聯絡 health visiting team，以及本區 baby clinic／餵奶支援安排。",
      "如發現需要額外支援，團隊可提早覆診、家訪或轉介。",
    ],
    sources: [
      { label: "NHS：Early days after birth", url: NHS_EARLY_DAYS },
      { label: "NHS：Services and support for parents", url: NHS_PARENT_SUPPORT },
    ],
  },
  {
    id: "newborn-hearing-screening",
    title: "初生嬰兒聽力篩查",
    shortTitle: "聽力篩查",
    category: "check",
    audience: "universal",
    startDay: 0,
    endDay: 28,
    displayTiming: "通常 4 週大前；最遲可於 3 個月內完成",
    summary:
      "所有 BB 都會獲提供聽力篩查，可能喺離院前、屋企或診所做；測試只需幾分鐘，通常即場有結果。",
    why:
      "初生聽力問題唔常見，但愈早發現，就愈早得到語言、溝通同家庭支援。",
    whatToExpect: [
      "BB 安睡或安靜時，醫護會放一個柔軟小耳塞入耳，播放輕微 clicking 聲並量度反應。",
      "測試唔痛，亦冇已知風險；如第一次結果唔清晰，會重做或用另一種測試。",
      "通過兩邊耳仔篩查代表聽力受損機會較低，但唔代表日後完全唔會出現聽力問題。",
    ],
    prepare: [
      "盡量喺預約前餵好奶、換好片，等 BB 容易安睡；唔需要用藥或其他特別準備。",
      "帶紅簿；如 4 週前仍未獲安排，聯絡 health visitor、GP 或本區 hearing screening service。",
    ],
    followUp: [
      "如一邊或兩邊結果唔清晰，應安排 audiology 專科第二次測試，通常喺篩查後 4 週內。",
      "日後如對 BB 對聲音反應有疑問，即使初生篩查清晰，都要同 health visitor 或 GP 講。",
    ],
    sources: [{ label: "NHS：Newborn hearing screening", url: NHS_HEARING }],
  },
  {
    id: "hepatitis-b-four-week-dose",
    title: "乙型肝炎疫苗：4 週劑",
    shortTitle: "乙肝 4 週劑",
    category: "vaccine",
    audience: "conditional",
    startDay: 28,
    endDay: 28,
    displayTiming: "4 週大；只限出生時已進入乙型肝炎計劃嘅 BB",
    summary:
      "媽媽有乙型肝炎嘅 BB，會喺 4 週大接種第二劑單價乙型肝炎疫苗。",
    why:
      "按時完成選擇性乙型肝炎計劃，有助降低 BB 感染及形成慢性乙型肝炎嘅風險。",
    whatToExpect: [
      "呢劑由醫療／疫苗團隊安排，記錄應同出生劑及之後例行疫苗連貫。",
      "4 週劑唔會取代 8、12、16 週嘅 6-in-1。",
    ],
    prepare: [
      "帶紅簿同出生劑紀錄，確認預約地點及時間。",
      "如未收到 4 週預約，盡快聯絡負責乙型肝炎跟進嘅醫院、GP 或疫苗團隊。",
    ],
    followUp: [
      "繼續依時出席 8、12、16 週例行疫苗；現行計劃另包括 18 個月 6-in-1，同 12 至 18 個月 HBsAg 化驗，其後按專科計劃跟進。",
    ],
    conditionalNote:
      "只適用於媽媽有乙型肝炎、並已由醫護安排選擇性疫苗計劃嘅 BB。",
    sources: [
      { label: "UKHSA：Routine childhood immunisations from 1 July 2026", url: GOV_IMMUNISATIONS_2026 },
      { label: "GOV.UK：Infectious diseases in pregnancy handbook", url: GOV_HEPB_PREGNANCY_HANDBOOK },
    ],
  },
  {
    id: "preterm-repeat-blood-spot",
    title: "早產 BB 重複腳跟採血（CHT）",
    shortTitle: "早產 BB 第 28 日採血",
    category: "check",
    audience: "conditional",
    startDay: 28,
    endDay: 28,
    autoApplicableGestationalWeeksBelow: 32,
    displayTiming: "不足 32 週出生：第 28 日，或較早出院當日",
    summary:
      "不足 32 週（31+6 或以下）出生嘅 BB，除第 5 日 blood spot 外，仲要為先天性甲狀腺功能低下（CHT）再採兩個血點；時間係出生第 28 日，或者較早出院當日，以較早者為準。",
    why:
      "早產可能令甲狀腺刺激素較遲先升高，單靠第 5 日樣本有機會未能發現 CHT；重複樣本可以補足呢個篩查風險。",
    whatToExpect: [
      "醫護會再次由腳跟取少量血，填兩個血點，並標明『CHT preterm』同孕週。",
      "如果 BB 第 28 日前出院，樣本應喺出院當日完成；如仍住院，就通常由醫院團隊安排。",
      "呢次係額外樣本，唔代表第 5 日結果有問題。",
    ],
    prepare: [
      "離院前問清楚樣本已經做咗、由邊個負責，以及紀錄有冇寫入紅簿／出院文件。",
      "採血時可以餵奶、抱住同保持溫暖，幫 BB 安定。",
    ],
    followUp: [
      "如果 BB 已出院但未完成，立即聯絡 neonatal team、助產士、health visitor 或 GP，唔好自行等到下一次例行覆診。",
      "如化驗室因其他原因要求再取樣，按通知日期完成；重複採血本身唔代表已確診。",
    ],
    conditionalNote:
      "只適用於出生孕週不足 32 週嘅 BB。本頁會按設定內嘅孕週自動顯示為待安排；實際日期以出院／neonatal team 計劃為準。",
    sources: [
      { label: "GOV.UK：Repeat newborn blood spot samples", url: GOV_NBS_REPEAT },
    ],
  },
  {
    id: "hip-ultrasound-if-referred",
    title: "髖關節超聲波（如獲轉介）",
    shortTitle: "髖關節超聲波",
    category: "check",
    audience: "conditional",
    startDay: 28,
    endDay: 42,
    displayTiming: "一般 4 至 6 週大；早產 BB 以校正孕週安排",
    summary:
      "髖關節超聲波唔係人人例行要做；只有初生身體檢查結果或風險因素符合轉介條件，先會由 NIPE 團隊安排。",
    why:
      "超聲波可以進一步判斷髖關節有冇發育性問題，及早處理可減低日後步姿、活動或關節問題。",
    whatToExpect: [
      "醫護會用超聲波探頭檢查髖關節；唔使用 X 光，亦唔會痛。",
      "如果 BB 出生孕週達 34 週或以上，英格蘭 NIPE 路徑一般安排喺 4 至 6 週大做。",
      "結果正常通常可按本區流程離開髖關節篩查路徑；異常則由骨科／專科繼續跟進。",
    ],
    prepare: [
      "帶紅簿、NIPE 結果同轉介信；預留餵奶、換片及安撫時間。",
      "如接近指定時間仍未收到預約，聯絡轉介單位或 GP，唔好等到 6 至 8 週檢查先再問。",
    ],
    followUp: [
      "按超聲波／骨科結果出席後續預約；即使結果正常，仍要做 6 至 8 週 NIPE 身體檢查。",
    ],
    conditionalNote:
      "只適用於 NIPE 篩查陽性或醫護認為有風險而轉介嘅 BB。未滿 34 週出生嘅 BB，一般按 38 至 40 週校正孕週安排，唔應直接用出生後 4 至 6 週計。",
    sources: [
      { label: "GOV.UK：NIPE hip screen-positive pathway", url: GOV_HIP_PATHWAY },
      { label: "GOV.UK：Eyes, heart, hips and testes screening", url: GOV_NIPE },
    ],
  },
  {
    id: "health-visitor-six-to-eight-week-review",
    title: "6 至 8 週健康及成長評估（health visitor）",
    shortTitle: "6–8 週 health visitor 評估",
    category: "visit",
    audience: "universal",
    startDay: 42,
    endDay: 56,
    displayTiming: "6 至 8 週大；通常由 health visitor 安排",
    summary:
      "呢次係英格蘭 Healthy Child Programme 普遍提供嘅家庭評估，重點係 BB 早期發展、成長、餵食、瞓覺、親子互動，同照顧者身心狀況；唔等同 GP 嘅身體檢查。",
    why:
      "BB 出生後頭幾星期變化快，今次可以及早發現餵食、成長、調節或發展需要，同時確認家長有足夠情緒、實際及社區支援。",
    whatToExpect: [
      "health visitor 會了解 BB 餵奶、睡眠、哭鬧、尿片、皮膚、成長、活動同對人聲／面孔嘅反應。",
      "可能量度體重同頭圍，觀察親子互動，並傾 safe sleep、疫苗、家居安全同日常照顧。",
      "亦會主動關心媽媽／主要照顧者嘅身體恢復、情緒、壓力、伴侶及家庭支援。",
    ],
    prepare: [
      "帶紅簿、餵奶／尿片／睡眠／體溫紀錄，同任何出院、篩查或轉介文件。",
      "列低 BB 餵食、反流、哭鬧、瞓覺、成長、視聽反應，同照顧者情緒或支援問題。",
      "確認 GP 嘅 6 至 8 週 BB 身體檢查係另一項安排；官方最佳做法係兩次評估唔好排同一日，除非有臨床需要。",
    ],
    followUp: [
      "如發現需要額外支援，可安排較早家訪、餵奶支援、成長覆檢或轉介其他服務。",
      "如果 8 週前仍未收到 health visitor 評估安排，聯絡本區 health visiting team 或 GP 查詢。",
    ],
    sources: [
      { label: "GOV.UK：Healthy Child Programme（0 至 5 歲）", url: GOV_HEALTHY_CHILD_PROGRAMME },
      { label: "NHS：Baby health and development reviews", url: NHS_BABY_REVIEWS },
    ],
  },
  {
    id: "gp-six-to-eight-week-exam",
    title: "6 至 8 週嬰兒身體檢查",
    shortTitle: "6–8 週檢查",
    category: "check",
    audience: "universal",
    startDay: 42,
    endDay: 56,
    displayTiming: "6 至 8 週大，通常由 GP／診所安排",
    summary:
      "BB 會再做一次完整身體檢查，包括初生 NIPE 嘅眼、心、髖關節及男嬰睪丸檢查，因為有啲情況出生初期未必睇得到。",
    why:
      "今次可再次確認身體發育，同時檢視餵奶、體重、身長、頭圍、視聽反應及家庭關注。",
    whatToExpect: [
      "醫護會問 BB 一般健康、餵奶、尿片、瞓覺同家族病史。",
      "BB 要除去部分衣物，檢查眼睛、心臟、髖關節，男嬰亦會再檢查睪丸。",
      "診所可能一併量度體重、身長及頭圍；實際安排視乎本區服務。",
    ],
    prepare: [
      "帶紅簿、出院／篩查文件、藥物資料，同餵奶及成長紀錄。",
      "預先列低關於反流、皮膚、頭形、視聽反應、髖關節活動或任何發展疑問。",
      "向 GP 確認呢次檢查同 8 週疫苗係同日定分開預約。",
    ],
    followUp: [
      "將結果同任何轉介記入紅簿／日程；如果醫護要求覆診，另設實際預約。",
      "如 8 週前仍未收到安排，主動聯絡 GP。",
    ],
    sources: [
      { label: "NHS：Newborn physical examination", url: NHS_PHYSICAL_EXAM },
      { label: "GOV.UK：Eyes, heart, hips and testes screening", url: GOV_NIPE },
    ],
  },
  {
    id: "vaccines-eight-weeks",
    title: "8 週例行疫苗",
    shortTitle: "8 週疫苗",
    category: "vaccine",
    audience: "universal",
    startDay: 56,
    endDay: 56,
    displayTiming: "8 週大",
    summary:
      "按 2026 年 7 月起英國例行時間表：6-in-1 第 1 劑、MenB 第 1 劑，以及口服輪狀病毒第 1 劑。",
    why:
      "開始建立對白喉、破傷風、百日咳、小兒麻痺、Hib、乙型肝炎、B 型腦膜炎雙球菌及輪狀病毒嘅保護。",
    whatToExpect: [
      "6-in-1 同 MenB 通常打大髀；輪狀病毒疫苗由口服。",
      "接種團隊會先核對健康狀況、疫苗紀錄，同輪狀病毒疫苗所需嘅 SCID 篩查結果。",
      "如果錯過輪狀病毒第 1 劑，要盡快聯絡 GP；第 1 劑只可喺未滿 15 週開始，第 2 劑須喺未滿 24 週完成。",
      "打針後可能短暫不適、針口痛或發燒；診所會講解觀察方法及幾時需要求助。",
    ],
    prepare: [
      "帶紅簿、疫苗邀請信，同任何過敏／藥物資料。",
      "俾 BB 著容易露出大髀嘅衫，帶奶、尿片同安撫用品。",
      "接種前如 BB 發燒或明顯不適，先致電診所問應否照常出席；唔好自行取消。",
      "預先準備嬰兒液體 paracetamol；MenB 後應按接種團隊同官方指示使用。非常早產（不足 32 週）BB 要由醫生按體重處方。",
    ],
    followUp: [
      "將三款疫苗、日期同批次記入紅簿；確認 12 週下一次預約。",
      "按接種團隊指示處理發燒或不適；如 BB 狀況令你擔心，聯絡 NHS 111／GP，危急情況 call 999。",
      "2026 官方一般指引係 MenB 後使用 120 mg / 5 mL 嬰兒 paracetamol，共 3 次、每次 2.5 mL、相隔 4 至 6 小時；必須先核對產品濃度並跟診所個別指示。",
    ],
    sources: [
      { label: "UKHSA：Routine childhood immunisations from 1 July 2026", url: GOV_IMMUNISATIONS_2026 },
      { label: "NHS：Rotavirus vaccine", url: NHS_ROTAVIRUS },
      { label: "GOV.UK：MenB vaccine and paracetamol", url: GOV_MENB_PARACETAMOL },
    ],
  },
  {
    id: "vaccines-twelve-weeks",
    title: "12 週例行疫苗",
    shortTitle: "12 週疫苗",
    category: "vaccine",
    audience: "universal",
    startDay: 84,
    endDay: 84,
    displayTiming: "12 週大",
    summary:
      "按 2026 年 7 月起英國例行時間表：6-in-1 第 2 劑、MenB 第 2 劑，以及口服輪狀病毒第 2 劑。",
    why:
      "第二輪疫苗延續並加強 8 週開始建立嘅免疫保護；要完成完整系列先可得到預期保護。",
    whatToExpect: [
      "6-in-1 同 MenB 通常打大髀；輪狀病毒疫苗由口服。",
      "接種團隊會核對上一劑紀錄及 BB 當日健康狀況。",
      "輪狀病毒第 2 劑要喺未滿 24 週完成；如錯過預約，要盡快聯絡 GP，唔好等到下一次例行疫苗先問。",
      "接種後可能短暫不適、針口痛或發燒，處理方法以接種團隊指示為準。",
    ],
    prepare: [
      "帶紅簿並確認 8 週各劑已正確記錄；如曾有接種反應，預先話俾醫護知。",
      "帶奶、尿片同安撫用品，俾 BB 著容易露出大髀嘅衫。",
      "預先準備嬰兒液體 paracetamol；MenB 後應按接種團隊同官方指示使用。非常早產（不足 32 週）BB 要由醫生按體重處方。",
    ],
    followUp: [
      "記錄今次疫苗，並確認 16 週下一次預約。",
      "如因病或其他原因延遲，直接同 GP／疫苗診所安排補打，唔好自行重開療程。",
      "2026 官方一般指引係 MenB 後使用 120 mg / 5 mL 嬰兒 paracetamol，共 3 次、每次 2.5 mL、相隔 4 至 6 小時；必須先核對產品濃度並跟診所個別指示。",
    ],
    sources: [
      { label: "UKHSA：Routine childhood immunisations from 1 July 2026", url: GOV_IMMUNISATIONS_2026 },
      { label: "NHS：Rotavirus vaccine", url: NHS_ROTAVIRUS },
      { label: "GOV.UK：MenB vaccine and paracetamol", url: GOV_MENB_PARACETAMOL },
    ],
  },
  {
    id: "targeted-health-review-around-three-months",
    title: "約 3 個月額外健康評估（如有需要）",
    shortTitle: "3 個月額外評估",
    category: "visit",
    audience: "conditional",
    startDay: 84,
    endDay: 105,
    displayTiming: "約 3 個月；只在 health visitor 評估有需要時安排",
    summary:
      "呢次唔係每個 BB 都固定要做；如果早期評估發現哭鬧、餵食、瞓覺、照顧壓力或發展方面需要支援，health visiting team 可以約 3 個月再跟進。",
    why:
      "3 個月左右係 BB 調節、互動同家庭日常逐步轉變嘅階段，較早覆查可以處理持續哭鬧、餵食困難、照顧者疲勞或其他新需要。",
    whatToExpect: [
      "重點會按家庭需要而定，例如餵食、反流、瞓覺、哭鬧、早期互動、成長及照顧者應對。",
      "health visitor 會檢視之前定下嘅支援計劃，睇下係咪需要繼續、加強或轉介。",
      "亦可能開始講解大約 6 個月先引入固體食物，避免過早加固。",
    ],
    prepare: [
      "帶紅簿同近幾星期餵食、睡眠、尿片、成長或症狀紀錄。",
      "列低最困擾家庭嘅一至三項問題，同埋之前建議試過後嘅效果。",
    ],
    followUp: [
      "按需要安排餵奶支援、GP／兒科評估、情緒支援或下一次 health visitor 聯絡。",
    ],
    conditionalNote:
      "屬 targeted review，唔係人人固定獲邀。只有 health visitor／醫護確認有需要先標記『已預約』；如冇需要可標記『不適用』。",
    sources: [
      { label: "GOV.UK：Healthy Child Programme（0 至 5 歲）", url: GOV_HEALTHY_CHILD_PROGRAMME },
    ],
  },
  {
    id: "vaccines-sixteen-weeks",
    title: "16 週例行疫苗",
    shortTitle: "16 週疫苗",
    category: "vaccine",
    audience: "universal",
    startDay: 112,
    endDay: 112,
    displayTiming: "16 週大",
    summary:
      "按 2026 年 7 月起英國例行時間表：6-in-1 第 3 劑及肺炎球菌（PCV）第 1 劑。",
    why:
      "完成嬰兒期 6-in-1 首三劑系列，並開始預防由常見肺炎球菌血清型引起嘅嚴重感染。",
    whatToExpect: [
      "6-in-1 同 PCV 通常打大髀；接種團隊會先核對之前疫苗紀錄。",
      "接種後可能短暫不適、針口痛或發燒，診所會講解正常反應同求助警號。",
      "16 週後，下一輪人人適用嘅例行兒童疫苗通常係 1 歲；實際邀請以 GP／NHS 通知為準。",
    ],
    prepare: [
      "帶紅簿，核對 8 週及 12 週疫苗已完整記錄。",
      "如 BB 曾對疫苗有明顯反應、正在服藥或當日不適，接種前話俾醫護知。",
    ],
    followUp: [
      "檢查紅簿已記齊 6-in-1 第 3 劑及 PCV，並保存 GP 日後疫苗邀請。",
      "如 BB 有額外醫療風險，可能另有疫苗安排；以兒科、GP 或疫苗團隊個別計劃為準。",
    ],
    sources: [
      { label: "UKHSA：Routine childhood immunisations from 1 July 2026", url: GOV_IMMUNISATIONS_2026 },
    ],
  },
  {
    id: "targeted-health-review-around-six-months",
    title: "約 6 個月額外健康評估（如有需要）",
    shortTitle: "6 個月額外評估",
    category: "visit",
    audience: "conditional",
    startDay: 168,
    endDay: 196,
    displayTiming: "約 6 個月；只在 health visitor 評估有需要時安排",
    summary:
      "如果 BB 或家庭之前有成長、餵食、發展、瞓覺、口腔健康、家居安全或照顧壓力需要，health visiting team 可以約 6 個月提供額外評估。",
    why:
      "接近加固、活動增加同口腔護理開始嘅階段，額外跟進可以確保方法安全合適，亦可及早處理發展或家庭支援需要。",
    whatToExpect: [
      "傾 BB 發展、成長、餵食、瞓覺、活動、口腔健康，同係咪準備好約 6 個月開始固體食物。",
      "檢視家居安全，例如跌落、燙傷、窒息、藥物及細小物件風險。",
      "按之前需要重新評估照顧者情緒、疲勞、支援網絡同任何轉介進度。",
    ],
    prepare: [
      "帶紅簿、現時奶量／餵食安排、成長紀錄，同所有正在用嘅藥物或補充品資料。",
      "記低 BB 目前做到嘅活動、你對加固或發展嘅疑問，以及家中最需要改善嘅安全位置。",
    ],
    followUp: [
      "如冇額外問題，下一個人人獲提供嘅發展評估通常係 9 至 12 個月；有需要則可提早再聯絡。",
    ],
    conditionalNote:
      "屬 targeted review，唔係人人固定獲邀。只有 health visitor／醫護確認有需要先標記『已預約』；如冇需要可標記『不適用』。",
    sources: [
      { label: "GOV.UK：Healthy Child Programme（0 至 5 歲）", url: GOV_HEALTHY_CHILD_PROGRAMME },
    ],
  },
  {
    id: "clinical-risk-flu-from-six-months",
    title: "流感疫苗（有長期健康風險嘅 BB）",
    shortTitle: "6 個月起流感針",
    category: "vaccine",
    audience: "conditional",
    startDay: 183,
    endDay: 183,
    timingMode: "seasonal",
    displayTiming: "足 6 個月起、秋冬疫苗季；只限符合臨床風險條件",
    summary:
      "一般健康嘅 6 個月大 BB 並唔會因年齡而自動獲邀；但有指定長期健康狀況嘅小朋友由 6 個月起可獲 NHS 每年流感疫苗。",
    why:
      "呼吸、心臟、腎／肝、神經、糖尿病、免疫系統、脾臟等指定長期狀況，可能令流感併發症風險較高。",
    whatToExpect: [
      "2 歲以下適用 BB 會用注射式流感疫苗，唔係鼻噴劑。",
      "6 個月至未滿 2 歲、屬臨床風險組別而首次接種流感疫苗嘅小朋友，需要相隔最少 4 週再打第 2 劑。",
      "實際資格、疫苗季開始日期同劑數由 GP／專科按當年 NHS 計劃確認。",
    ],
    prepare: [
      "BB 接近 6 個月而又有長期健康狀況時，向 GP 或專科確認係咪符合資格，唔需要等邀請先問。",
      "帶紅簿、專科病歷摘要、藥物同過敏資料。",
    ],
    followUp: [
      "如醫護話係首次兩劑療程，即場確認第 2 劑約 4 週後日期。",
      "流感疫苗每年更新；之後每個秋冬再按 NHS／GP 邀請接種。",
    ],
    conditionalNote:
      "只適用於 6 個月至 17 歲、有 NHS 指定長期健康狀況嘅小朋友。本項用出生後第 183 日只作『約 6 個月』介面提示，實際資格由足 6 個月及當年疫苗季開始計。",
    sources: [
      { label: "NHS：Children's flu vaccine", url: NHS_CHILD_FLU },
      { label: "UKHSA：Routine childhood immunisations from 1 July 2026", url: GOV_IMMUNISATIONS_2026 },
    ],
  },
];

export const HEALTH_SCHEDULE: HealthScheduleDefinition[] = HEALTH_SCHEDULE_ITEMS.sort(
  (left, right) => left.startDay - right.startDay || left.endDay - right.endDay,
);
