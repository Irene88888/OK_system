import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  Tooltip,
  BarChart,
  Bar,
  Rectangle,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Legend,
} from "recharts";
import {
  Ship,
  Anchor,
  TrendingUp,
  TrendingDown,
  Fuel,
  Package,
  Users,
  Wallet,
  AlertTriangle,
  FileWarning,
  Waves,
  Home,
  Landmark,
  Warehouse,
  PieChart as PieIcon,
  ChevronRight,
  Sparkles,
  Building2,
  CircleDollarSign,
  LogOut,
} from "lucide-react";

// ---------------------------------------------------------------------------
// 真實資料來源：202606FS.xlsx／船務部 2026/06 損益表
// （檔案內部標題誤植為「2026/05損益表」，但檔名、庫存日期 0630、
// 　及「▲2026/6月損益」等列均指向 2026年6月，故以 2026/06 認列；
// 　如實際期別不同，請留意並回報更正。）
// ---------------------------------------------------------------------------
const vessels = [
  {
    name: "MFu-666",
    revenue: 42183133,
    cost: 23590250,
    opex: 12634765,
    grossProfit: 18592883,
    opProfit: 5958118,
    pretax: 5955641,
    stockKg: 110993.82,
    estStock: 10021247,
    estTransit: 15684236,
    estProfitIncl: 31661124,
    currentPeriodProfit: 16023979,
  },
  {
    name: "MFa-1",
    revenue: 31993883,
    cost: 17013860,
    opex: 10166399,
    grossProfit: 14980023,
    opProfit: 4813624,
    pretax: 4811401,
    stockKg: 0,
    estStock: 0,
    estTransit: 9326488,
    estProfitIncl: 14137889,
    currentPeriodProfit: 364118,
  },
  {
    name: "MFa-168",
    revenue: 49216292,
    cost: 22788088,
    opex: 13494055,
    grossProfit: 26428204,
    opProfit: 12934149,
    pretax: 12930695,
    stockKg: 136033.8,
    estStock: 11934493,
    estTransit: 13246675,
    estProfitIncl: 38111863,
    currentPeriodProfit: 13537836,
  },
  {
    name: "MFu-188",
    revenue: 42263281,
    cost: 25372077,
    opex: 11955985,
    grossProfit: 16891204,
    opProfit: 4935219,
    pretax: 4931763,
    stockKg: 133547.54,
    estStock: 11869793,
    estTransit: 11430096,
    estProfitIncl: 28231652,
    currentPeriodProfit: 11646042,
  },
  {
    name: "宏洋輪",
    revenue: 27723599,
    cost: 22104705,
    opex: 5204954,
    grossProfit: 5618894,
    opProfit: 413940,
    pretax: 434496,
    stockKg: 98051.94,
    estStock: 9795461,
    estTransit: 1590646,
    estProfitIncl: 11820603,
    currentPeriodProfit: 3286028,
  },
  {
    name: "宏洋輪1號",
    revenue: 30395099,
    cost: 22199827,
    opex: 4959043,
    grossProfit: 8195272,
    opProfit: 3236229,
    pretax: 3277894,
    stockKg: 65816.8,
    estStock: 6930913,
    estTransit: 8831957,
    estProfitIncl: 19040764,
    currentPeriodProfit: 6525842,
  },
  {
    name: "OFFICE1",
    revenue: 8250,
    cost: 2652963,
    opex: 919027,
    grossProfit: -2644713,
    opProfit: -3563740,
    pretax: -21092136,
    stockKg: 0,
    estStock: 0,
    estTransit: 1087250,
    estProfitIncl: -20235881,
    currentPeriodProfit: -21331381,
  },
];

const fleetTotal = {
  revenue: 223783537,
  cost: 135721770,
  grossProfit: 88061767,
  opex: 59334228,
  opProfit: 28727539,
  nonOp: -17477785,
  pretax: 11249754,
  estUnbilled: 111749255,
  estProfitIncl: 122768014,
  // 最終損益：一律以「2026年當期損益(含預估收入,不含折舊)」為準（累積數，非單月數字）
  currentPeriodProfit: 30052464,
  currentPeriodStart: "2026/01",
  currentPeriodEnd: "2026/06",
};

// ---------------------------------------------------------------------------
// 真實資料來源：船隻動態1~6.xlsx（累積作業天數，2026年1–6月累計）
// ---------------------------------------------------------------------------
const vesselUtilization = {
  totalDaysInPeriod: 181, // 2026/01/01–2026/06/30 共 181 天
  vessels: [
    { name: "MFu-666", days: 128 },
    { name: "MFa-1", days: 79 },
    { name: "MFa-168", days: 134 },
    { name: "MFu-188", days: 137 },
    { name: "宏洋輪", days: 123 },
    { name: "宏洋輪1號", days: 103 },
  ],
};
const fleetOperatingDays = vesselUtilization.vessels.reduce((s, v) => s + v.days, 0);
const fleetAvailableDays = vesselUtilization.totalDaysInPeriod * vesselUtilization.vessels.length;

const costBreakdown = [
  { name: "燃料油", value: 41855721, color: "#2E86FF" },
  { name: "船員薪資", value: 28829792, color: "#14B8A6" },
  { name: "補給品", value: 17884568, color: "#F2A93B" },
  { name: "魚餌", value: 13932332, color: "#8B6BF2" },
  { name: "折舊", value: 8489664, color: "#EF6461" },
  { name: "漁船保險費", value: 5925951, color: "#5DA9E9" },
  { name: "其他", value: 18803742, color: "#94A3B8" },
];

const opexBreakdown = [
  {
    name: "推銷費用",
    value: 37860110,
    color: "#2E86FF",
    topItems: [{ name: "出口費用", value: 37860110 }],
  },
  {
    name: "管理費用",
    value: 20555091,
    color: "#F2A93B",
    topItems: [
      { name: "辦公經費", value: 20031192 },
      { name: "交際費", value: 523899 },
    ],
  },
];

// ---------------------------------------------------------------------------
// 真實資料來源：202606_貿易.xlsx（2026/06）
// 依使用者指定分組：貿易損益＝海之寶＋廣宏＋O.K.；大漁損益＝大漁＋海和＋正洋
// ---------------------------------------------------------------------------
const tradeCompanies = [
  {
    name: "海之寶",
    revenue: 0,
    cost: 0,
    grossProfit: 0,
    opex: 2287931,
    opProfit: -2287931,
    nonOp: 5669,
    pretax: -2282262,
  },
  {
    name: "廣宏(貿易)",
    revenue: 8557594,
    cost: 7100058,
    grossProfit: 1457536,
    opex: 1226229,
    opProfit: 231307,
    nonOp: -384215,
    pretax: -152908,
  },
  {
    name: "O.K.",
    revenue: 215085924,
    cost: 205067942,
    grossProfit: 10017982,
    opex: 440805,
    opProfit: 9577177,
    nonOp: -4186369,
    pretax: 5390808,
  },
];

const tradeTotal = tradeCompanies.reduce(
  (acc, c) => ({
    revenue: acc.revenue + c.revenue,
    cost: acc.cost + c.cost,
    grossProfit: acc.grossProfit + c.grossProfit,
    opex: acc.opex + c.opex,
    opProfit: acc.opProfit + c.opProfit,
    nonOp: acc.nonOp + c.nonOp,
    pretax: acc.pretax + c.pretax,
  }),
  { revenue: 0, cost: 0, grossProfit: 0, opex: 0, opProfit: 0, nonOp: 0, pretax: 0 }
);

const dayuCompanies = [
  {
    name: "大漁",
    revenue: 19821568,
    cost: 17293456,
    grossProfit: 2528112,
    opex: 2589348,
    opProfit: -61236,
    nonOp: -352087,
    pretax: -413323,
  },
  {
    name: "海和",
    revenue: 38525,
    cost: 95295,
    grossProfit: -56770,
    opex: 43838,
    opProfit: -100608,
    nonOp: -60933,
    pretax: -161541,
  },
  {
    name: "正洋",
    revenue: 578226,
    cost: 326326,
    grossProfit: 251900,
    opex: 73819,
    opProfit: 178081,
    nonOp: -9621,
    pretax: 168460,
  },
];

const dayuTotal = dayuCompanies.reduce(
  (acc, c) => ({
    revenue: acc.revenue + c.revenue,
    cost: acc.cost + c.cost,
    grossProfit: acc.grossProfit + c.grossProfit,
    opex: acc.opex + c.opex,
    opProfit: acc.opProfit + c.opProfit,
    nonOp: acc.nonOp + c.nonOp,
    pretax: acc.pretax + c.pretax,
  }),
  { revenue: 0, cost: 0, grossProfit: 0, opex: 0, opProfit: 0, nonOp: 0, pretax: 0 }
);

// ---------------------------------------------------------------------------
// 真實資料來源：202601~202606_貿易.xlsx（各月）／202506_貿易.xlsx（2025年6月）／
// 202501-202506_貿易.xlsx（2025年1-6月累計）
// 用於：累計數、月增(MoM)、年增(YoY) 比較
// ---------------------------------------------------------------------------
const tradeMonthly2026 = [
  { month: "1月", revenue: 99795669, pretax: -46024 },
  { month: "2月", revenue: 53820631, pretax: -7919455 },
  { month: "3月", revenue: 70543254, pretax: -2412140 },
  { month: "4月", revenue: 106822061, pretax: 6313967 },
  { month: "5月", revenue: 155849581, pretax: 27824988 },
  { month: "6月", revenue: 223643518, pretax: 2955638 },
];

const dayuMonthly2026 = [
  { month: "1月", revenue: 19238075, pretax: -451262 },
  { month: "2月", revenue: 6849837, pretax: -4763501 },
  { month: "3月", revenue: 13869927, pretax: -1177455 },
  { month: "4月", revenue: 9148827, pretax: -92408 },
  { month: "5月", revenue: 16472904, pretax: -3782015 },
  { month: "6月", revenue: 20438319, pretax: -406404 },
];

const tradeCumulative = {
  revenue: 710474714,
  cost: 640488316,
  grossProfit: 69986398,
  opex: 33007207,
  opProfit: 36979191,
  nonOp: -10262217,
  pretax: 26716974,
};

const dayuCumulative = {
  revenue: 86017889,
  cost: 73505134,
  grossProfit: 12512755,
  opex: 20788915,
  opProfit: -8276160,
  nonOp: -2396885,
  pretax: -10673045,
};

const tradeCompare = {
  mom: { label: "月增（5月→6月）", prevLabel: "2026/05", currLabel: "2026/06", prevRevenue: 155849581, currRevenue: 223643518, prevPretax: 27824988, currPretax: 2955638 },
  yoy: { label: "年增（單月，去年同月）", prevLabel: "2025/06", currLabel: "2026/06", prevRevenue: 49983008, currRevenue: 223643518, prevPretax: -2506959, currPretax: 2955638 },
  yoyCum: { label: "年增（累計）", prevLabel: "2025年1–6月累計", currLabel: "2026年1–6月累計", prevRevenue: 406854068, currRevenue: 710474714, prevPretax: 911578, currPretax: 26716974 },
};

const dayuCompare = {
  mom: { label: "月增（5月→6月）", prevLabel: "2026/05", currLabel: "2026/06", prevRevenue: 16472904, currRevenue: 20438319, prevPretax: -3782015, currPretax: -406404 },
  yoy: { label: "年增（單月，去年同月）", prevLabel: "2025/06", currLabel: "2026/06", prevRevenue: 19208836, currRevenue: 20438319, prevPretax: -1064005, currPretax: -406404 },
  yoyCum: { label: "年增（累計）", prevLabel: "2025年1–6月累計", currLabel: "2026年1–6月累計", prevRevenue: 132727315, currRevenue: 86017889, prevPretax: -6707217, currPretax: -10673045 },
};

const COMPANY_COLORS = ["#2E86FF", "#F2A93B", "#8B6BF2", "#14B8A6", "#EF6461", "#5DA9E9"];

// ---------------------------------------------------------------------------
// 真實資料來源：OT庫存狀況表0731-大漁.xlsx（大漁倉庫，資料日期 2026/07/31）
// ---------------------------------------------------------------------------
const dayuInvSummary = {
  reportDate: "2026/07/31",
  totalQty: 738690.7,
  totalCost: 84628376,
  totalItems: 759,
  normalCost: 71514970,
  longStorageCost: 11461920,
  expiredCost: 438972,
  expiredItems: 18,
  nearExpiryCost: 1212517,
  nearExpiryItems: 34,
};

const dayuInvByCategory = [
  { name: "魚貨", qty: 409748.4, cost: 42471361, color: "#2E86FF" },
  { name: "冷凍水產品", qty: 173023.9, cost: 22739582, color: "#5DA9E9" },
  { name: "加工製品", qty: 81125.1, cost: 13103912, color: "#F2A93B" },
  { name: "其他", qty: 50483.8, cost: 3186619, color: "#94A3B8" },
  { name: "貿易部", qty: 11760.0, cost: 2517404, color: "#8B6BF2" },
  { name: "調味食品", qty: 12219.0, cost: 213407, color: "#14B8A6" },
  { name: "冷凍肉品", qty: 315.6, cost: 393690, color: "#EF6461" },
];

const dayuInvByWarehouse = [
  { name: "-35度冷凍庫", cost: 22059387 },
  { name: "-50度冷凍庫", cost: 15936017 },
  { name: "三角貿易", cost: 14459090 },
  { name: "加工倉", cost: 10905162 },
  { name: "隆發", cost: 6550979 },
  { name: "在途倉", cost: 6142043 },
  { name: "海和", cost: 4260277 },
  { name: "大順冷凍", cost: 2549718 },
  { name: "順昌冷凍", cost: 1253258 },
  { name: "正洋", cost: 512444 },
];

// 庫存金額依產品名稱（前10大，依存貨成本加總排序，全部庫存共234項產品）
const dayuInvByProduct = [
  { name: "鬼頭刀5上", cost: 6657301 },
  { name: "韓國活鮑魚", cost: 5170982 },
  { name: "南方黑鮪40上", cost: 5085460 },
  { name: "挪威鯖魚400/600", cost: 4068523 },
  { name: "長鰭鮪10上", cost: 3953688 },
  { name: "劍旗25上", cost: 3597787 },
  { name: "黃肌LOIN", cost: 3523393 },
  { name: "魷魚串150-180g/尾", cost: 3126816 },
  { name: "水鯊去肚10上", cost: 2668221 },
  { name: "三摺白帶魚", cost: 2637548 },
];

// 過期品明細（逾期天數以報表日 2026/07/31 換算）
const dayuExpiredItems = [
  { name: "豬肉香腸", qty: 372, unit: "包", warehouse: "加工倉", expiry: "2024-02-15", overdueDays: 897, cost: 37434 },
  { name: "牡蠣肉 2L", qty: 18, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2024-03-17", overdueDays: 866, cost: 8640 },
  { name: "魷魚圈", qty: 9, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2025-02-15", overdueDays: 531, cost: 720 },
  { name: "爆卵柳葉魚", qty: 295, unit: "盒", warehouse: "-35度冷凍庫", expiry: "2025-02-18", overdueDays: 528, cost: 21092 },
  { name: "冰烤地瓜(500g)", qty: 130, unit: "盒", warehouse: "加工倉", expiry: "2025-03-29", overdueDays: 489, cost: 8450 },
  { name: "魷魚刻花", qty: 9, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2025-06-03", overdueDays: 423, cost: 720 },
  { name: "熟白蝦40/50", qty: 24, unit: "盒", warehouse: "-35度冷凍庫", expiry: "2025-06-15", overdueDays: 411, cost: 9600 },
  { name: "日本A5和牛沙朗牛排(200g)", qty: 1, unit: "包", warehouse: "正洋", expiry: "2025-06-16", overdueDays: 410, cost: 485 },
  { name: "熟白蝦20/30", qty: 53, unit: "盒", warehouse: "-35度冷凍庫", expiry: "2025-07-01", overdueDays: 395, cost: 27560 },
  { name: "明太子醬", qty: 234, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-02-01", overdueDays: 180, cost: 93541 },
  { name: "熟凍干貝", qty: 6, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-03-13", overdueDays: 140, cost: 3960 },
  { name: "甜蝦90/120", qty: 431, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-03-19", overdueDays: 134, cost: 118525 },
  { name: "鮪魚碎肉", qty: 494.96, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-04-19", overdueDays: 103, cost: 44662 },
  { name: "半殼扇貝", qty: 440, unit: "包", warehouse: "-35度冷凍庫", expiry: "2026-04-27", overdueDays: 95, cost: 33000 },
  { name: "半殼扇貝", qty: 67.58, unit: "包", warehouse: "-35度冷凍庫", expiry: "2026-04-27", overdueDays: 95, cost: 11147 },
  { name: "和牛肋眼A5", qty: 3, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-05-27", overdueDays: 65, cost: 8400 },
  { name: "熟章魚腳 7P", qty: 5, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-05-31", overdueDays: 61, cost: 3000 },
  { name: "和牛肋眼A5", qty: 2.87, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-06-02", overdueDays: 59, cost: 8036 },
];

// 即將到期明細（依剩餘天數排序，含四級警示）
const dayuNearExpiryItems = [
  { name: "干貝2S", qty: 0.75, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-08-21", daysLeft: 21, level: "緊急", cost: 1275 },
  { name: "海菜吻仔魚湯料盒", qty: 22, unit: "盒", warehouse: "正洋", expiry: "2026-09-09", daysLeft: 40, level: "警示", cost: 1430 },
  { name: "黑鮪大腹肉", qty: 0.29, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-09-30", daysLeft: 61, level: "警示", cost: 303 },
  { name: "黃肌STEAK", qty: 980, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-10-10", daysLeft: 71, level: "警示", cost: 119149 },
  { name: "鮪魚黑肉", qty: 1390, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-10-10", daysLeft: 71, level: "警示", cost: 44473 },
  { name: "冷凍去殼帶尾甜蝦150g", qty: 17, unit: "包", warehouse: "正洋", expiry: "2026-10-17", daysLeft: 78, level: "警示", cost: 3060 },
  { name: "鮭魚6/7", qty: 19.4, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-10-18", daysLeft: 79, level: "警示", cost: 5807 },
  { name: "黃肌LOIN", qty: 737, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-10-19", daysLeft: 80, level: "警示", cost: 89605 },
  { name: "劍旗碎肉", qty: 120, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-10-19", daysLeft: 80, level: "警示", cost: 9982 },
  { name: "旗魚碎肉", qty: 575, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-10-19", daysLeft: 80, level: "警示", cost: 19412 },
  { name: "臭肉魚絲(沙丁魚干)", qty: 2, unit: "包", warehouse: "正洋", expiry: "2026-10-22", daysLeft: 83, level: "警示", cost: 104 },
  { name: "黑鮪大腹肉", qty: 121.04, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-10-31", daysLeft: 92, level: "注意", cost: 118172 },
  { name: "黑輪片", qty: 65, unit: "包", warehouse: "正洋", expiry: "2026-10-31", daysLeft: 92, level: "注意", cost: 4307 },
  { name: "魚鬆捲心酥", qty: 7565, unit: "隻", warehouse: "正洋", expiry: "2026-11-12", daysLeft: 104, level: "注意", cost: 53564 },
  { name: "白鯧900/1000", qty: 47.29, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-11-13", daysLeft: 105, level: "注意", cost: 46344 },
  { name: "生凍櫻花蝦", qty: 905, unit: "公斤", warehouse: "海和", expiry: "2026-11-13", daysLeft: 105, level: "注意", cost: 357209 },
  { name: "生凍櫻花蝦", qty: 124.5, unit: "公斤", warehouse: "海和", expiry: "2026-11-17", daysLeft: 109, level: "注意", cost: 50315 },
  { name: "大比目魚切片35P", qty: 1.6, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-11-30", daysLeft: 122, level: "注意", cost: 706 },
  { name: "圓鱈10/15", qty: 25.9, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-12-10", daysLeft: 132, level: "注意", cost: 37555 },
  { name: "圓鱈10/15", qty: 40.85, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-12-10", daysLeft: 132, level: "注意", cost: 59232 },
  { name: "圓鱈", qty: 29.07, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-12-11", daysLeft: 133, level: "注意", cost: 40696 },
  { name: "圓鱈", qty: 24.05, unit: "公斤", warehouse: "-35度冷凍庫", expiry: "2026-12-12", daysLeft: 134, level: "注意", cost: 33670 },
];

const EXPIRY_LEVEL_COLOR = {
  緊急: "#EF6461",
  警示: "#F2A93B",
  注意: "#EAC54F",
  追蹤: "#5DA9E9",
};

// ---------------------------------------------------------------------------
// 真實資料來源：豐展漁業＿2026/7/20-7/26 大西洋漁撈預估收入（週報，船務庫存）
// ---------------------------------------------------------------------------
const shippingInvWeek = {
  period: "2026/07/20 – 2026/07/26",
  vessels: [
    { name: "滿帆-1", days: 6, catchKg: 12232, cryoJPY: 645507, swordUSD: 1786.34, acrUSD: 36862.65 },
    { name: "滿帆-168", days: 6, catchKg: 16743, cryoJPY: 547040, swordUSD: 650.57, acrUSD: 52389.44 },
    { name: "滿福-188", days: 3, catchKg: 6493, cryoJPY: 447455, swordUSD: 0, acrUSD: 19820.74 },
    { name: "滿福-666", days: 1, catchKg: 1638, cryoJPY: 209350, swordUSD: 791.95, acrUSD: 4218.85 },
    { name: "宏洋輪", days: 0, catchKg: 0, cryoJPY: 0, swordUSD: 0, acrUSD: 0 },
    { name: "宏洋輪1號", days: 2, catchKg: 4699, cryoJPY: 196106, swordUSD: 99.88, acrUSD: 14684.32 },
  ],
  total: { catchKg: 37308, cryoJPY: 2045459, swordUSD: 3328.75, acrUSD: 127975.99 },
};

// ---------------------------------------------------------------------------
// 真實資料來源：0805-貿易資金.xlsx／0805-船務資金.xlsx（資金狀況表，2026/08/05）
// 115_8_3借款表.xlsx（集團借款總表）
// ---------------------------------------------------------------------------
function addCash(a, b) {
  return {
    prev: a.prev + b.prev,
    inflow: a.inflow + b.inflow,
    outflow: a.outflow + b.outflow,
    restricted: a.restricted + b.restricted,
    balance: a.balance + b.balance,
  };
}

const cashByDept = {
  trade: {
    TWD: { prev: 37758648, inflow: 1807065, outflow: 6751923, restricted: 19011150, balance: 13802640 },
    USD: { prev: 1588720.46, inflow: 0, outflow: 319131.31, restricted: 1050353.49, balance: 219235.66 },
    JPY: { prev: 148837800, inflow: 0, outflow: 2576630, restricted: 71007646, balance: 75253524 },
  },
  shipping: {
    TWD: { prev: 10769316, inflow: 4272743, outflow: 4980874, restricted: 6258508, balance: 3802677 },
    USD: { prev: 366949.79, inflow: 0, outflow: 7283.63, restricted: 171377.98, balance: 188288.18 },
    JPY: { prev: 351501140, inflow: 0, outflow: 0, restricted: 349920071, balance: 1581069 },
  },
};

const cashGroup = {
  TWD: addCash(cashByDept.trade.TWD, cashByDept.shipping.TWD),
  USD: addCash(cashByDept.trade.USD, cashByDept.shipping.USD),
  JPY: addCash(cashByDept.trade.JPY, cashByDept.shipping.JPY),
};

const loanTotals = {
  shipping: { TWD: 140063945, USD: 9638252.71, JPY: 0, EUR: 30000 },
  trade: { TWD: 589320584, USD: 7495492.6, JPY: 30652760, EUR: 0 },
  group: { TWD: 729384529, USD: 17133745.31, JPY: 30652760, EUR: 30000 },
};

const loanByYear = [
  { year: "2026", TWD: 323546660, USD: 15857180.31 },
  { year: "2027", TWD: 62577927, USD: 1276565.0 },
  { year: "2028", TWD: 8802480, USD: 0 },
  { year: "2029", TWD: 15798765, USD: 0 },
  { year: "2031", TWD: 231480611, USD: 0 },
  { year: "2033", TWD: 33333334, USD: 0 },
  { year: "2040", TWD: 53844752, USD: 0 },
];

const loanByBank = [
  { name: "中國信託", TWD: 190000000, USD: 1493923.17 },
  { name: "華南銀行/博愛", TWD: 123844752, USD: 2808537.5 },
  { name: "元大銀行", TWD: 88730611, USD: 3757863.75 },
  { name: "第一銀行", TWD: 68380407, USD: 900000 },
  { name: "台中商銀", TWD: 54000000, USD: 0 },
  { name: "合作金庫(票券)", TWD: 50000000, USD: 0 },
  { name: "東港漁會", TWD: 36333334, USD: 0 },
  { name: "台灣中小企銀", TWD: 32000000, USD: 0 },
  { name: "合作金庫(十全)", TWD: 26000000, USD: 0 },
  { name: "台新銀行", TWD: 25000000, USD: 0 },
  { name: "合作金庫(港都)", TWD: 12545462, USD: 895000 },
  { name: "兆豐商銀", TWD: 9996660, USD: 1398031.93 },
  { name: "三信商業銀行", TWD: 9300000, USD: 0 },
  { name: "新光銀行", TWD: 3253303, USD: 1938168.07 },
  { name: "台北富邦", TWD: 0, USD: 2468528.04 },
  { name: "王道銀行", TWD: 0, USD: 1473692.85 },
];

const creditLine = {
  TWD: { total: 625000000, used: 414574587, available: 210425413 },
  USD: { total: 19300000, used: 17364313.02, available: 1935686.98 },
};

// ---------------------------------------------------------------------------
// 小工具
// ---------------------------------------------------------------------------
const fmt = (n) => {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(Math.round(n));
  return sign + abs.toLocaleString("zh-TW");
};

// 金額顯示規則（不分幣別）：
// 1萬元以下（不含1萬）→ 全額顯示
// 1萬元以上至1億以下（不含1億）→ 以萬元為單位
// 1億元以上 → 以億元為單位
const fmtWan = (n) => {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 100000000) {
    return sign + (abs / 100000000).toFixed(2) + "億";
  }
  if (abs >= 10000) {
    return sign + (abs / 10000).toLocaleString("zh-TW", { maximumFractionDigits: 0 }) + "萬";
  }
  return sign + abs.toLocaleString("zh-TW", { maximumFractionDigits: 2 });
};

const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) : "0.0");

// 強制以「億」為單位顯示（不論金額大小），用於需要跟同一組卡片維持相同單位的情境
const fmtYi = (n) => {
  const sign = n < 0 ? "-" : "";
  return sign + (Math.abs(n) / 100000000).toFixed(2) + "億";
};

// 圓餅圖點選/滑過時的「動態放大」效果，取代瀏覽器預設的黑色 focus 外框
function renderActiveDonutShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 9}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0 3px 8px rgba(11,42,74,0.28))", transition: "all 0.2s ease" }}
      />
    </g>
  );
}

// 柱狀圖點選/滑過時的「動態放大」效果：只放大厚度＋加光暈，不改變代表數值的長度，避免誤導
// 注意：transition 只套用在 filter（光暈）上，不能套在 x/y/width/height，
// 否則會跟 recharts 本身逐幀計算的進場動畫互相打架，導致柱狀圖看起來像「沒有動態展開」。
function renderActiveBarHorizontal(props, activeIndex) {
  const { x, y, width, height, fill, radius, index } = props;
  const active = index === activeIndex;
  const grow = active ? 6 : 0;
  return (
    <Rectangle
      x={x}
      y={y - grow / 2}
      width={width}
      height={height + grow}
      radius={radius}
      fill={fill}
      style={
        active
          ? { filter: "brightness(1.12) drop-shadow(0 3px 8px rgba(11,42,74,0.35))", transition: "filter 0.18s ease" }
          : { transition: "filter 0.18s ease" }
      }
    />
  );
}

function renderActiveBarVertical(props, activeIndex) {
  const { x, y, width, height, fill, radius, index } = props;
  const active = index === activeIndex;
  const grow = active ? 6 : 0;
  return (
    <Rectangle
      x={x - grow / 2}
      y={y}
      width={width + grow}
      height={height}
      radius={radius}
      fill={fill}
      style={
        active
          ? { filter: "brightness(1.12) drop-shadow(0 3px 8px rgba(11,42,74,0.35))", transition: "filter 0.18s ease" }
          : { transition: "filter 0.18s ease" }
      }
    />
  );
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function KpiCard({ icon, iconBg, label, value, unit, sub, subValue, subColor, linkTo, currency }) {
  const clickable = Boolean(linkTo);
  return (
    <div
      className={"kpi-card" + (clickable ? " kpi-clickable" : "")}
      style={{ borderLeft: `3px solid ${iconBg}` }}
      onClick={clickable ? () => scrollToSection(linkTo) : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") scrollToSection(linkTo);
            }
          : undefined
      }
    >
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background: `linear-gradient(135deg, ${iconBg}, ${iconBg}CC)`, boxShadow: `0 4px 12px -2px ${iconBg}66` }}>
          {icon}
        </div>
        <span className="kpi-label">{label}</span>
        {clickable && <ChevronRight size={14} className="kpi-link-arrow" />}
      </div>
      <div className="kpi-value">
        {currency && <span className="kpi-currency">{currency}</span>}
        {value}
        <span className="kpi-unit">{unit}</span>
      </div>
      {sub && (
        <div className="kpi-sub">
          <span className="kpi-sub-label">{sub}</span>
          <span
            className="kpi-sub-value"
            style={{ color: subColor || "var(--muted)" }}
          >
            {subValue}
          </span>
        </div>
      )}
    </div>
  );
}

function SegmentPlaceholder({ title, tags }) {
  return (
    <div className="placeholder-panel">
      <FileWarning size={30} color="#F2A93B" />
      <div className="placeholder-title">{title}尚未匯入資料</div>
      <div className="placeholder-desc">
        上傳 {title} 的月損益 Excel 後，這裡會自動顯示營收、成本、毛利與各單位排行，並併入「集團損益合併總覽」。
      </div>
      <div className="placeholder-tags">
        {tags.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 船務損益頁
// ---------------------------------------------------------------------------
function ShippingPnl() {
  const rankedByProfit = useMemo(
    () => [...vessels].sort((a, b) => b.currentPeriodProfit - a.currentPeriodProfit),
    []
  );
  const [costActiveIndex, setCostActiveIndex] = useState(-1);
  const [rankBarActive, setRankBarActive] = useState(-1);

  const idleVessels = vessels.filter((v) => v.revenue === 0 && v.stockKg > 0);

  return (
    <div className="page-body">
      <div className="period-bar">
        <Ship size={16} />
        <span>船務部・2026年1月–6月損益表（累積）　（資料來源：202606FS.xlsx，6艘作業船 + OFFICE1）</span>
        <span className="unit-badge">TWD</span>
      </div>

      {/* KPI row 1 */}
      <div className="kpi-grid">
        <KpiCard
          icon={<Wallet size={20} color="#fff" />}
          iconBg="#2E86FF"
          label="營業收入合計"
          value={fmtWan(fleetTotal.revenue)}
          unit=""
        />
        <KpiCard
          icon={<Package size={20} color="#fff" />}
          iconBg="#F2A93B"
          label="營業成本合計"
          value={fmtWan(fleetTotal.cost)}
          unit=""
          sub="成本率"
          subValue={pct(fleetTotal.cost, fleetTotal.revenue) + "%"}
          subColor="#EF6461"
        />
        <KpiCard
          icon={<TrendingUp size={20} color="#fff" />}
          iconBg="#14B8A6"
          label="營業毛利"
          value={fmtWan(fleetTotal.grossProfit)}
          unit=""
          sub="毛利率"
          subValue={pct(fleetTotal.grossProfit, fleetTotal.revenue) + "%"}
          subColor="#14B8A6"
        />
        <KpiCard
          icon={<Users size={20} color="#fff" />}
          iconBg="#8B6BF2"
          label="營業費用合計"
          value={fmtWan(fleetTotal.opex)}
          unit=""
          sub="費用率"
          subValue={pct(fleetTotal.opex, fleetTotal.revenue) + "%"}
        />
      </div>

      {/* KPI row 2 */}
      <div className="kpi-grid">
        <KpiCard
          icon={
            fleetTotal.opProfit < 0 ? (
              <TrendingDown size={20} color="#fff" />
            ) : (
              <TrendingUp size={20} color="#fff" />
            )
          }
          iconBg={fleetTotal.opProfit < 0 ? "#EF6461" : "#14B8A6"}
          label="營業淨利（損）"
          value={fmtWan(fleetTotal.opProfit)}
          unit=""
          sub="營益率"
          subValue={pct(fleetTotal.opProfit, fleetTotal.revenue) + "%"}
          subColor={fleetTotal.opProfit < 0 ? "#EF6461" : "#14B8A6"}
        />
        <KpiCard
          icon={fleetTotal.currentPeriodProfit < 0 ? <TrendingDown size={20} color="#fff" /> : <Anchor size={20} color="#fff" />}
          iconBg={fleetTotal.currentPeriodProfit < 0 ? "#EF6461" : "#0B2A4A"}
          label="最終損益（2026年累積）"
          value={fmtWan(fleetTotal.currentPeriodProfit)}
          unit=""
          sub={fleetTotal.currentPeriodStart + "–" + fleetTotal.currentPeriodEnd + " 累計"}
          subValue="含預估收入，不含折舊"
          subColor="#0B2A4A"
        />
      </div>

      {/* 洞察卡 */}
      <div className="insight-banner">
        <AlertTriangle size={18} color="#F2A93B" style={{ flexShrink: 0 }} />
        <div>
          <b>累計期間六艘船全數完成銷貨認列，營運面表現強勁</b>
          （毛利 {fmtWan(fleetTotal.grossProfit)}、營業淨利 {fmtWan(fleetTotal.opProfit)}），
          但受營業外收支影響 <b>{fmtWan(fleetTotal.nonOp)}</b>（{fmt(fleetTotal.nonOp)} 元，
          主要反映在 OFFICE1），使稅前損益降至 <b>{fmtWan(fleetTotal.pretax)}</b>。
          建議確認該筆營業外支出的具體項目（如匯兌損失、利息費用等）以利後續追蹤。
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          船隊利用率明細（{fleetTotal.currentPeriodStart}–{fleetTotal.currentPeriodEnd} 累計，可用天數 {vesselUtilization.totalDaysInPeriod} 天／船）
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={[...vesselUtilization.vessels].sort((a, b) => b.days - a.days)}
            layout="vertical"
            margin={{ left: 8, right: 46, top: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEF1F5" />
            <XAxis type="number" domain={[0, vesselUtilization.totalDaysInPeriod]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 12, fill: "#425466" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v) => [fmt(v) + " / " + vesselUtilization.totalDaysInPeriod + " 天（" + pct(v, vesselUtilization.totalDaysInPeriod) + "%）", "作業天數"]}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="days" radius={[0, 6, 6, 0]} barSize={14} fill="#5DA9E9" isAnimationActive animationDuration={800} animationEasing="ease-out">
              <LabelList
                dataKey="days"
                position="right"
                formatter={(v) => pct(v, vesselUtilization.totalDaysInPeriod) + "%"}
                style={{ fontSize: 11, fill: "#425466", fontFamily: "var(--mono)" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="left">船舶</th>
                <th>作業天數</th>
                <th>可用天數</th>
                <th>利用率</th>
              </tr>
            </thead>
            <tbody>
              {vesselUtilization.vessels.map((v) => (
                <tr key={v.name}>
                  <td className="left name-cell">
                    <Ship size={14} color="#5DA9E9" /> {v.name}
                  </td>
                  <td>{fmt(v.days)}</td>
                  <td>{fmt(vesselUtilization.totalDaysInPeriod)}</td>
                  <td style={{ fontWeight: 700 }}>{pct(v.days, vesselUtilization.totalDaysInPeriod)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="left">船隊合計</td>
                <td>{fmt(fleetOperatingDays)}</td>
                <td>{fmt(fleetAvailableDays)}</td>
                <td>{pct(fleetOperatingDays, fleetAvailableDays)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 圖表區 */}
      <div className="chart-row">
        <div className="panel">
          <div className="panel-title">銷貨成本結構</div>
          <div className="donut-wrap">
            <div className="donut-chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={95}
                  paddingAngle={2}
                  stroke="none"
                  activeIndex={costActiveIndex}
                  activeShape={renderActiveDonutShape}
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-out"
                  onMouseEnter={(_, i) => setCostActiveIndex(i)}
                  onMouseLeave={() => setCostActiveIndex(-1)}
                  onClick={(_, i) => setCostActiveIndex(i === costActiveIndex ? -1 : i)}
                >
                  {costBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => fmtWan(v) + " 元"}
                  contentStyle={{ fontFamily: "inherit", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
              <div className="donut-center-label">
                <div className="donut-center-title">總成本</div>
                <div className="donut-center-value">{fmtWan(fleetTotal.cost)}</div>
                <div className="donut-center-unit">元</div>
              </div>
            </div>
            <div className="donut-legend">
              {costBreakdown.map((c) => (
                <div className="legend-row" key={c.name}>
                  <span className="legend-dot" style={{ background: c.color }} />
                  <span className="legend-name">{c.name}</span>
                  <span className="legend-pct">
                    {pct(c.value, fleetTotal.cost)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            各船最終損益排行（{fleetTotal.currentPeriodStart}–{fleetTotal.currentPeriodEnd} 累計，不含折舊）
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={rankedByProfit}
              layout="vertical"
              margin={{ left: 8, right: 40, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEF1F5" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 12, fill: "#425466" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [fmtWan(v) + " 元", "最終損益（累計）"]}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar
                dataKey="currentPeriodProfit"
                radius={[0, 6, 6, 0]}
                barSize={12}
                shape={(props) => renderActiveBarHorizontal(props, rankBarActive)}
                isAnimationActive={true}
                animationDuration={900}
                animationEasing="ease-out"
                onMouseEnter={(_, i) => setRankBarActive(i)}
                onMouseLeave={() => setRankBarActive(-1)}
                onClick={(_, i) => setRankBarActive(i === rankBarActive ? -1 : i)}
              >
                {rankedByProfit.map((v, i) => (
                  <Cell key={i} fill={v.currentPeriodProfit < 0 ? "#EF6461" : "#14B8A6"} />
                ))}
                <LabelList
                  dataKey="currentPeriodProfit"
                  content={(props) => {
                    const { x, y, width, height, value } = props;
                    // 不論正負，一律固定貼在長條的右側末端（x+width），
                    // 避免 recharts 對負值長條預設把標籤丟到最外側（左側）跟座標軸文字疊在一起。
                    return (
                      <text
                        x={x + width + 6}
                        y={y + height / 2}
                        dy={4}
                        textAnchor="start"
                        fontSize={11}
                        fill="#425466"
                        fontFamily="var(--mono)"
                      >
                        {fmtWan(value)}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 明細表 */}
      <div className="panel">
        <div className="panel-title">
          各船損益明細（單位：元・{fleetTotal.currentPeriodStart}–{fleetTotal.currentPeriodEnd} 累計）
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="left">船舶／單位</th>
                <th>營業收入</th>
                <th>營業成本</th>
                <th>營業毛利</th>
                <th>營業費用</th>
                <th>營業淨利</th>
                <th>稅前損益</th>
                <th>船存/在途預估收入</th>
                <th>
                  最終損益
                  <br />
                  <span style={{ fontWeight: 400, fontSize: 10 }}>
                    （{fleetTotal.currentPeriodStart}–{fleetTotal.currentPeriodEnd} 累計，不含折舊）
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {vessels.map((v) => (
                <tr key={v.name}>
                  <td className="left name-cell">
                    <Ship size={14} color="#5DA9E9" /> {v.name}
                  </td>
                  <td>{fmtWan(v.revenue)}</td>
                  <td>{fmtWan(v.cost)}</td>
                  <td className={v.grossProfit < 0 ? "neg" : "pos"}>
                    {fmtWan(v.grossProfit)}
                  </td>
                  <td>{fmtWan(v.opex)}</td>
                  <td className={v.opProfit < 0 ? "neg" : "pos"}>
                    {fmtWan(v.opProfit)}
                  </td>
                  <td className={v.pretax < 0 ? "neg" : "pos"}>
                    {fmtWan(v.pretax)}
                  </td>
                  <td>{v.estStock + v.estTransit > 0 ? fmtWan(v.estStock + v.estTransit) : "—"}</td>
                  <td className={v.currentPeriodProfit < 0 ? "neg" : "pos"} style={{ fontWeight: 700 }}>
                    {fmtWan(v.currentPeriodProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="left">船團合計</td>
                <td>{fmtWan(fleetTotal.revenue)}</td>
                <td>{fmtWan(fleetTotal.cost)}</td>
                <td className={fleetTotal.grossProfit < 0 ? "neg" : "pos"}>
                  {fmtWan(fleetTotal.grossProfit)}
                </td>
                <td>{fmtWan(fleetTotal.opex)}</td>
                <td className={fleetTotal.opProfit < 0 ? "neg" : "pos"}>
                  {fmtWan(fleetTotal.opProfit)}
                </td>
                <td className={fleetTotal.pretax < 0 ? "neg" : "pos"}>
                  {fmtWan(fleetTotal.pretax)}
                </td>
                <td>{fmtWan(fleetTotal.estUnbilled)}</td>
                <td className={fleetTotal.currentPeriodProfit < 0 ? "neg" : "pos"}>
                  {fmtWan(fleetTotal.currentPeriodProfit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">營業費用結構</div>
        <div className="opex-bars">
          {opexBreakdown.map((o) => (
            <div className="opex-group" key={o.name}>
              <div className="opex-row">
                <span className="opex-name">{o.name}</span>
                <div className="opex-track">
                  <div
                    className="opex-fill"
                    style={{
                      width: pct(o.value, fleetTotal.opex) + "%",
                      background: o.color,
                    }}
                  />
                </div>
                <span className="opex-value">{fmtWan(o.value)}</span>
                <span className="opex-pct">{pct(o.value, fleetTotal.opex)}%</span>
              </div>
              <div className="opex-subitems">
                {o.topItems.map((it) => (
                  <span className="opex-subitem" key={it.name}>
                    {it.name} {fmtWan(it.value)}（{pct(it.value, o.value)}%）
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 月度趨勢圖（營收長條 + 稅前損益折線）
// ---------------------------------------------------------------------------
function MonthlyTrendChart({ data, title }) {
  return (
    <div className="panel">
      <div className="panel-title">{title}</div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ left: 4, right: 8, top: 10, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F5" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#425466" }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="rev" hide />
          <YAxis yAxisId="pretax" orientation="right" hide />
          <Tooltip
            formatter={(v, name) => [fmtWan(v) + " 元", name === "revenue" ? "營業收入" : "稅前損益"]}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend
            formatter={(v) => (v === "revenue" ? "營業收入" : "稅前損益（虛線為 0，紅點＝虧損）")}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar yAxisId="rev" dataKey="revenue" fill="#BFD9FF" radius={[5, 5, 0, 0]} barSize={30} isAnimationActive animationDuration={800}>
            <LabelList
              dataKey="revenue"
              position="top"
              formatter={(v) => fmtWan(v)}
              style={{ fontSize: 10, fill: "#5B7BA8", fontFamily: "var(--mono)" }}
            />
          </Bar>
          {/* 0 元基準線：讓稅前損益的正負一眼可辨，折線在這條線以下就代表虧損 */}
          <ReferenceLine yAxisId="pretax" y={0} stroke="#94A3B8" strokeDasharray="4 4" />
          <Line
            yAxisId="pretax"
            type="monotone"
            dataKey="pretax"
            stroke="#425466"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload, index } = props;
              const isNeg = payload.pretax < 0;
              return (
                <circle
                  key={`dot-${index}`}
                  cx={cx}
                  cy={cy}
                  r={4.5}
                  fill={isNeg ? "#EF6461" : "#14B8A6"}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
              );
            }}
            isAnimationActive
            animationDuration={900}
          >
            <LabelList
              dataKey="pretax"
              content={(props) => {
                const { x, y, index } = props;
                const val = data[index].pretax;
                const isNeg = val < 0;
                return (
                  <text
                    x={x}
                    y={isNeg ? y + 16 : y - 8}
                    textAnchor="middle"
                    fontSize={10.5}
                    fontWeight={700}
                    fill={isNeg ? "#EF6461" : "#14B8A6"}
                    fontFamily="var(--mono)"
                  >
                    {isNeg ? "" : "+"}
                    {fmtWan(val)}
                  </text>
                );
              }}
            />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}


function CompareBarChart({ compare, metric, title, unit }) {
  const data = [
    { name: "前期比較", prev: compare.mom[`prev${metric}`], curr: compare.mom[`curr${metric}`] },
    { name: "去年同期", prev: compare.yoy[`prev${metric}`], curr: compare.yoy[`curr${metric}`] },
    { name: "累計數", prev: compare.yoyCum[`prev${metric}`], curr: compare.yoyCum[`curr${metric}`] },
  ];
  const [active, setActive] = useState(-1);

  return (
    <div className="panel">
      <div className="panel-title">{title}比較（前期 vs 本期）</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ left: 4, right: 8, top: 20, bottom: 4 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F5" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#425466" }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip formatter={(v) => fmtWan(v) + unit} contentStyle={{ fontSize: 12 }} />
          <Legend formatter={(v) => (v === "prev" ? "前期" : "本期")} wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="prev"
            fill="#B8C2CE"
            radius={[5, 5, 0, 0]}
            barSize={28}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          >
            <LabelList dataKey="prev" position="top" formatter={(v) => fmtWan(v)} style={{ fontSize: 10, fill: "#8B95A5", fontFamily: "var(--mono)" }} />
          </Bar>
          <Bar
            dataKey="curr"
            radius={[5, 5, 0, 0]}
            barSize={28}
            shape={(props) => renderActiveBarVertical(props, active)}
            onMouseEnter={(_, i) => setActive(i)}
            onMouseLeave={() => setActive(-1)}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.curr >= d.prev ? "#14B8A6" : "#EF6461"} />
            ))}
            <LabelList dataKey="curr" position="top" formatter={(v) => fmtWan(v)} style={{ fontSize: 10.5, fontWeight: 700, fill: "#425466", fontFamily: "var(--mono)" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CompareSection({ compare }) {
  return (
    <div className="chart-row">
      <CompareBarChart compare={compare} metric="Revenue" title="營業收入" unit=" 元" />
      <CompareBarChart compare={compare} metric="Pretax" title="稅前損益" unit=" 元" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 通用「事業群損益」頁（貿易 / 大漁 共用）
// ---------------------------------------------------------------------------
function CompanySegmentPnl({ periodLabel, sourceLabel, companies, total, icon: Icon, accent, insight, cumulative, monthly, compare }) {

  return (
    <div className="page-body">
      <div className="period-bar">
        <Icon size={16} />
        <span>{periodLabel}　（資料來源：{sourceLabel}）</span>
        <span className="unit-badge">TWD</span>
      </div>

      <div className="kpi-grid">
        <KpiCard
          icon={<Wallet size={20} color="#fff" />}
          iconBg="#2E86FF"
          label="營業收入合計"
          value={fmtWan(total.revenue)}
          unit=""
        />
        <KpiCard
          icon={<Package size={20} color="#fff" />}
          iconBg="#F2A93B"
          label="營業成本合計"
          value={fmtWan(total.cost)}
          unit=""
          sub="成本率"
          subValue={pct(total.cost, total.revenue) + "%"}
          subColor="#EF6461"
        />
        <KpiCard
          icon={<TrendingUp size={20} color="#fff" />}
          iconBg="#14B8A6"
          label="營業毛利"
          value={fmtWan(total.grossProfit)}
          unit=""
          sub="毛利率"
          subValue={pct(total.grossProfit, total.revenue) + "%"}
          subColor="#14B8A6"
        />
        <KpiCard
          icon={
            total.pretax < 0 ? (
              <TrendingDown size={20} color="#fff" />
            ) : (
              <TrendingUp size={20} color="#fff" />
            )
          }
          iconBg={total.pretax < 0 ? "#EF6461" : "#14B8A6"}
          label="稅前損益"
          value={fmtWan(total.pretax)}
          unit=""
          sub="稅前淨利率"
          subValue={pct(total.pretax, total.revenue) + "%"}
          subColor={total.pretax < 0 ? "#EF6461" : "#14B8A6"}
        />
      </div>

      {cumulative && (
        <>
          <div className="period-bar" style={{ marginTop: 6 }}>
            <TrendingUp size={16} />
            <span>累計數（2026年1–6月）</span>
          </div>
          <div className="kpi-grid">
            <KpiCard
              icon={<Wallet size={20} color="#fff" />}
              iconBg="#2E86FF"
              label="累計營業收入"
              value={fmtWan(cumulative.revenue)}
              unit=""
            />
            <KpiCard
              icon={<TrendingUp size={20} color="#fff" />}
              iconBg="#14B8A6"
              label="累計營業毛利"
              value={fmtWan(cumulative.grossProfit)}
              unit=""
              sub="毛利率"
              subValue={pct(cumulative.grossProfit, cumulative.revenue) + "%"}
              subColor="#14B8A6"
            />
            <KpiCard
              icon={<Landmark size={20} color="#fff" />}
              iconBg={cumulative.opProfit < 0 ? "#EF6461" : "#14B8A6"}
              label="累計營業淨利"
              value={fmtWan(cumulative.opProfit)}
              unit=""
              sub="營益率"
              subValue={pct(cumulative.opProfit, cumulative.revenue) + "%"}
              subColor={cumulative.opProfit < 0 ? "#EF6461" : "#14B8A6"}
            />
            <KpiCard
              icon={cumulative.pretax < 0 ? <TrendingDown size={20} color="#fff" /> : <Anchor size={20} color="#fff" />}
              iconBg={cumulative.pretax < 0 ? "#EF6461" : "#0B2A4A"}
              label="累計稅前損益"
              value={fmtWan(cumulative.pretax)}
              unit=""
              sub="稅前淨利率"
              subValue={pct(cumulative.pretax, cumulative.revenue) + "%"}
              subColor={cumulative.pretax < 0 ? "#EF6461" : "#0B2A4A"}
            />
          </div>
        </>
      )}

      {monthly && <MonthlyTrendChart data={monthly} title="月度趨勢（2026年1–6月，營業收入＋稅前損益）" />}

      {compare && <CompareSection compare={compare} />}

      {insight && (
        <div className="insight-banner">
          <AlertTriangle size={18} color="#F2A93B" style={{ flexShrink: 0 }} />
          <div>{insight}</div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 合併總覽（待資料補齊）
// ---------------------------------------------------------------------------
function ConsolidatedOverview() {
  const [segBarActive, setSegBarActive] = useState(-1);
  const segments = [
    {
      key: "trade",
      label: "貿易損益",
      period: "2026/01–06",
      icon: Package,
      color: "#8B6BF2",
      total: tradeCumulative,
      note: "海之寶＋廣宏＋O.K.＋廣宏(東港)",
      finalLabel: "稅前損益（累計）",
      finalValue: tradeCumulative.pretax,
    },
    {
      key: "dayu",
      label: "大漁損益",
      period: "2026/01–06",
      icon: Waves,
      color: "#F2A93B",
      total: dayuCumulative,
      note: "大漁＋海和＋正洋",
      finalLabel: "稅前損益（累計）",
      finalValue: dayuCumulative.pretax,
    },
    {
      key: "shipping",
      label: "船務損益",
      period: "2026/01–06",
      icon: Ship,
      color: "#2E86FF",
      total: fleetTotal,
      note: "6艘作業船＋OFFICE1",
      finalLabel: "最終損益（累計）",
      finalValue: fleetTotal.currentPeriodProfit,
    },
  ];

  const grandTotal = segments.reduce(
    (acc, s) => ({
      revenue: acc.revenue + s.total.revenue,
      cost: acc.cost + s.total.cost,
      grossProfit: acc.grossProfit + s.total.grossProfit,
      opex: acc.opex + s.total.opex,
      opProfit: acc.opProfit + (s.total.opProfit ?? s.total.grossProfit - s.total.opex),
      nonOp: acc.nonOp + (s.total.nonOp ?? 0),
      pretax: acc.pretax + s.finalValue,
    }),
    { revenue: 0, cost: 0, grossProfit: 0, opex: 0, opProfit: 0, nonOp: 0, pretax: 0 }
  );

  return (
    <div className="page-body">
      <div className="period-bar">
        <PieIcon size={16} />
        <span>集團損益合併總覽・2026年1–6月累計　（貿易／大漁／船務三事業群同期累計加總）</span>
        <span className="unit-badge">TWD</span>
      </div>

      <div className="kpi-grid">
        <KpiCard
          icon={<Wallet size={20} color="#fff" />}
          iconBg="#2E86FF"
          label="集團合併累計營業收入"
          value={fmtWan(grandTotal.revenue)}
          unit=""
          sub="金額（元）"
          subValue={fmtWan(grandTotal.revenue)}
        />
        <KpiCard
          icon={<TrendingUp size={20} color="#fff" />}
          iconBg="#14B8A6"
          label="集團合併累計毛利"
          value={fmtWan(grandTotal.grossProfit)}
          unit=""
          sub="毛利率"
          subValue={pct(grandTotal.grossProfit, grandTotal.revenue) + "%"}
          subColor="#14B8A6"
        />
        <KpiCard
          icon={<Landmark size={20} color="#fff" />}
          iconBg={grandTotal.pretax < 0 ? "#EF6461" : "#14B8A6"}
          label="集團合併累計損益"
          value={fmtWan(grandTotal.pretax)}
          unit=""
          sub="合併淨利率"
          subValue={pct(grandTotal.pretax, grandTotal.revenue) + "%"}
          subColor={grandTotal.pretax < 0 ? "#EF6461" : "#14B8A6"}
        />
      </div>

      <div className="insight-banner soft">
        <FileWarning size={18} color="#5DA9E9" style={{ flexShrink: 0 }} />
        <div>
          三個事業群本頁數字皆為 <b>2026年1–6月累計數</b>（船務另含預估收入、不含折舊），
          以下為單純加總三張損益表得出的集團數字，尚未處理集團內交易
          （例如船務銷貨予貿易部門）的抵銷分錄，正式合併報表請留意內部交易沖銷。
        </div>
      </div>

      <div className="segment-compare">
        {segments.map((s) => {
          const Icon = s.icon;
          return (
            <div className="segment-card active" key={s.key}>
              <div className="segment-head">
                <Icon size={16} color={s.color} />
                <span>{s.label}</span>
                <span className="badge-live">{s.period}</span>
              </div>
              <div className="segment-row">
                <span>事業體</span>
                <b>{s.note}</b>
              </div>
              <div className="segment-row">
                <span>營業收入</span>
                <b>{fmtWan(s.total.revenue)}</b>
              </div>
              <div className="segment-row">
                <span>營業毛利</span>
                <b className={s.total.grossProfit < 0 ? "neg" : "pos"}>
                  {fmtWan(s.total.grossProfit)}
                </b>
              </div>
              <div className="segment-row">
                <span>{s.finalLabel}</span>
                <b className={s.finalValue < 0 ? "neg" : "pos"}>{fmtWan(s.finalValue)}</b>
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel">
        <div className="panel-title">各事業群損益比較（2026年1–6月累計）</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={segments.map((s) => ({ name: s.label, pretax: s.finalValue }))}
            margin={{ left: 8, right: 24, top: 10, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F5" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#425466" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(v) => fmtWan(v) + " 元"} contentStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="pretax"
              radius={[6, 6, 0, 0]}
              barSize={64}
              shape={(props) => renderActiveBarVertical(props, segBarActive)}
              isAnimationActive={true}
              animationDuration={900}
              animationEasing="ease-out"
              onMouseEnter={(_, i) => setSegBarActive(i)}
              onMouseLeave={() => setSegBarActive(-1)}
              onClick={(_, i) => setSegBarActive(i === segBarActive ? -1 : i)}
            >
              {segments.map((s, i) => (
                <Cell key={i} fill={s.finalValue < 0 ? "#EF6461" : "#14B8A6"} />
              ))}
              <LabelList dataKey="pretax" position="top" formatter={(v) => fmtWan(v)} style={{ fontSize: 12, fontFamily: "var(--mono)", fontWeight: 700 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 大漁庫存頁（每週四）
// ---------------------------------------------------------------------------
function DayuInventory() {
  const warehouseMax = Math.max(...dayuInvByWarehouse.map((w) => w.cost));
  const productMax = Math.max(...dayuInvByProduct.map((p) => p.cost));
  const levelCounts = dayuNearExpiryItems.reduce((acc, i) => {
    acc[i.level] = (acc[i.level] || 0) + 1;
    return acc;
  }, {});
  const [categoryActiveIndex, setCategoryActiveIndex] = useState(-1);

  return (
    <div className="page-body">
      <div className="period-bar">
        <Warehouse size={16} />
        <span>
          大漁庫存・資料日期 {dayuInvSummary.reportDate}　（資料來源：OT庫存狀況表0731-大漁.xlsx，每週四更新）
        </span>
      </div>

      <div className="kpi-grid">
        <KpiCard
          icon={<Package size={20} color="#fff" />}
          iconBg="#2E86FF"
          label="庫存總數量"
          value={fmt(dayuInvSummary.totalQty)}
          unit="（公斤／件，混合單位）"
          sub="品項筆數"
          subValue={dayuInvSummary.totalItems + " 筆"}
          linkTo="dayu-category-chart"
        />
        <KpiCard
          icon={<Wallet size={20} color="#fff" />}
          iconBg="#14B8A6"
          label="庫存總金額"
          value={fmtWan(dayuInvSummary.totalCost)}
          unit=""
          sub="金額（元）"
          subValue={fmtWan(dayuInvSummary.totalCost)}
          linkTo="dayu-warehouse-chart"
        />
        <KpiCard
          icon={<AlertTriangle size={20} color="#fff" />}
          iconBg="#EF6461"
          label="過期品金額"
          value={fmtWan(dayuInvSummary.expiredCost)}
          unit=""
          sub="品項數"
          subValue={dayuInvSummary.expiredItems + " 筆"}
          subColor="#EF6461"
          linkTo="dayu-expired-table"
        />
        <KpiCard
          icon={<AlertTriangle size={20} color="#fff" />}
          iconBg="#F2A93B"
          label="即將到期金額"
          value={fmtWan(dayuInvSummary.nearExpiryCost)}
          unit=""
          sub="品項數"
          subValue={dayuInvSummary.nearExpiryItems + " 筆"}
          subColor="#F2A93B"
          linkTo="dayu-nearexpiry-table"
        />
      </div>

      <div className="insight-banner">
        <AlertTriangle size={18} color="#EF6461" style={{ flexShrink: 0 }} />
        <div>
          <b>過期品共 {dayuInvSummary.expiredItems} 筆、金額 {fmtWan(dayuInvSummary.expiredCost)} 元</b>
          ，尚未處理報廢或折讓，建議優先清查；其中「豬肉香腸」「牡蠣肉2L」逾期已超過
          <b> 800 天</b>，長期占用冷凍庫容量。另有 <b>{dayuInvSummary.nearExpiryItems} 筆、
          {fmtWan(dayuInvSummary.nearExpiryCost)} 元</b>商品將於未來 6 個月內到期，其中「干貝2S」
          僅剩 21 天為緊急等級，需優先促銷或調撥。
        </div>
      </div>

      <div className="panel" id="dayu-category-chart">
        <div className="panel-title">庫存金額依產品類別</div>
        <div className="donut-wrap">
            <div className="donut-chart-box">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dayuInvByCategory}
                  dataKey="cost"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={92}
                  paddingAngle={2}
                  stroke="none"
                  activeIndex={categoryActiveIndex}
                  activeShape={renderActiveDonutShape}
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-out"
                  onMouseEnter={(_, i) => setCategoryActiveIndex(i)}
                  onMouseLeave={() => setCategoryActiveIndex(-1)}
                  onClick={(_, i) => setCategoryActiveIndex(i === categoryActiveIndex ? -1 : i)}
                >
                  {dayuInvByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmtWan(v) + " 元"} contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
              <div className="donut-center-label">
                <div className="donut-center-title">總金額</div>
                <div className="donut-center-value">{fmtWan(dayuInvSummary.totalCost)}</div>
              </div>
            </div>
            <div className="donut-legend">
              {dayuInvByCategory.map((c) => (
                <div className="legend-row" key={c.name}>
                  <span className="legend-dot" style={{ background: c.color }} />
                  <span className="legend-name">{c.name}</span>
                  <span className="legend-pct">{pct(c.cost, dayuInvSummary.totalCost)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      <div className="panel">
        <div className="panel-title">
          庫存金額依產品名稱（前10大項，總額 {fmtWan(dayuInvByProduct.reduce((s, p) => s + p.cost, 0))}，
          佔總庫存 {pct(dayuInvByProduct.reduce((s, p) => s + p.cost, 0), dayuInvSummary.totalCost)}%）
        </div>
        <div className="opex-bars">
          {dayuInvByProduct.map((p) => (
            <div className="opex-row" key={p.name}>
              <span className="opex-name">{p.name}</span>
              <div className="opex-track">
                <div
                  className="opex-fill"
                  style={{ width: pct(p.cost, productMax) + "%", background: "#2E86FF" }}
                />
              </div>
              <span className="opex-value">{fmtWan(p.cost)}</span>
              <span className="opex-pct">{pct(p.cost, dayuInvSummary.totalCost)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" id="dayu-expired-table">
        <div className="panel-title">
          過期商品列示（{dayuExpiredItems.length} 筆・依逾期天數排序）
        </div>
        <div className="table-wrap freeze-col1">
          <table className="fixed-cols">
            <colgroup>
              <col style={{ width: "130px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "90px" }} />
            </colgroup>
            <thead>
              <tr>
                <th className="left">品名</th>
                <th>數量</th>
                <th className="left">倉庫</th>
                <th className="left">有效期至</th>
                <th>逾期天數</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody>
              {[...dayuExpiredItems]
                .sort((a, b) => b.overdueDays - a.overdueDays)
                .map((it, i) => (
                  <tr key={i}>
                    <td className="left">{it.name}</td>
                    <td>
                      {it.qty.toLocaleString("zh-TW")} {it.unit}
                    </td>
                    <td className="left">{it.warehouse}</td>
                    <td className="left">{it.expiry}</td>
                    <td className="neg" style={{ fontWeight: 700 }}>
                      {it.overdueDays} 天
                    </td>
                    <td>{fmtWan(it.cost)}</td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="left">合計</td>
                <td colSpan={3}></td>
                <td></td>
                <td>{fmtWan(dayuInvSummary.expiredCost)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="panel" id="dayu-nearexpiry-table">
        <div className="panel-title">
          即將到期警示（{dayuNearExpiryItems.length} 筆・
          {Object.entries(levelCounts)
            .map(([lvl, n]) => `${lvl} ${n} 筆`)
            .join("／")}
          ）
        </div>
        <div className="table-wrap freeze-col1">
          <table className="fixed-cols">
            <colgroup>
              <col style={{ width: "130px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "70px" }} />
              <col style={{ width: "90px" }} />
            </colgroup>
            <thead>
              <tr>
                <th className="left">品名</th>
                <th>數量</th>
                <th className="left">倉庫</th>
                <th className="left">有效期至</th>
                <th>剩餘天數</th>
                <th className="left">等級</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody>
              {[...dayuNearExpiryItems]
                .sort((a, b) => a.daysLeft - b.daysLeft)
                .map((it, i) => (
                  <tr key={i}>
                    <td className="left">{it.name}</td>
                    <td>
                      {it.qty.toLocaleString("zh-TW")} {it.unit}
                    </td>
                    <td className="left">{it.warehouse}</td>
                    <td className="left">{it.expiry}</td>
                    <td style={{ fontWeight: 700 }}>{it.daysLeft} 天</td>
                    <td className="left">
                      <span
                        className="tag"
                        style={{
                          background: EXPIRY_LEVEL_COLOR[it.level] + "22",
                          color: EXPIRY_LEVEL_COLOR[it.level],
                          fontWeight: 700,
                        }}
                      >
                        {it.level}
                      </span>
                    </td>
                    <td>{fmtWan(it.cost)}</td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="left">合計</td>
                <td colSpan={4}></td>
                <td></td>
                <td>{fmtWan(dayuInvSummary.nearExpiryCost)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 船務庫存頁（每週二・各船漁獲量與預估價值）
// ---------------------------------------------------------------------------
function ShippingInventory() {
  const catchRanked = [...shippingInvWeek.vessels].sort((a, b) => b.catchKg - a.catchKg);
  const [catchBarActive, setCatchBarActive] = useState(-1);

  return (
    <div className="page-body">
      <div className="period-bar">
        <Ship size={16} />
        <span>
          船務庫存（在船漁獲）・{shippingInvWeek.period}　（資料來源：豐展漁業週報 email，每週二更新）
        </span>
      </div>

      <div className="kpi-grid">
        <KpiCard
          icon={<Package size={20} color="#fff" />}
          iconBg="#2E86FF"
          label="本週總漁獲量"
          value={fmt(shippingInvWeek.total.catchKg)}
          unit="公斤"
          sub="作業船數"
          subValue={shippingInvWeek.vessels.filter((v) => v.days > 0).length + " / " + shippingInvWeek.vessels.length + " 艘"}
          linkTo="shipping-catch-chart"
        />
        <KpiCard
          icon={<Wallet size={20} color="#fff" />}
          iconBg="#14B8A6"
          label="ACR 預估收入"
          value={fmtWan(shippingInvWeek.total.acrUSD)}
          unit="USD"
          sub="扣2%含冰重後"
          subValue="美金計價"
          linkTo="shipping-detail-table"
        />
        <KpiCard
          icon={<Wallet size={20} color="#fff" />}
          iconBg="#5DA9E9"
          label="超低溫預估收入"
          value={fmtWan(shippingInvWeek.total.cryoJPY)}
          unit="JPY"
          sub="扣2%含冰重後"
          subValue="日圓計價"
          linkTo="shipping-detail-table"
        />
        <KpiCard
          icon={<Wallet size={20} color="#fff" />}
          iconBg="#8B6BF2"
          label="劍旗預估收入"
          value={fmtWan(shippingInvWeek.total.swordUSD)}
          unit="USD"
          sub="扣2%含冰重後"
          subValue="美金計價"
          linkTo="shipping-detail-table"
        />
      </div>

      <div className="insight-banner soft">
        <FileWarning size={18} color="#5DA9E9" style={{ flexShrink: 0 }} />
        <div>
          本頁呈現「在船未入港」漁獲的預估數量與預估收入（即船務端的週間庫存），與「集團損益」
          船務損益頁的已認列收入是不同概念。三種計價幣別（超低溫／JPY、劍旗與ACR／USD）故意不加總換算，
          避免匯率假設造成誤導；宏洋輪本週無作業天數，故無漁獲。
        </div>
      </div>

      <div className="panel" id="shipping-catch-chart">
        <div className="panel-title">各船漁獲量排行（公斤）</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={catchRanked}
            layout="vertical"
            margin={{ left: 8, right: 40, top: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEF1F5" />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 12, fill: "#425466" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(v) => fmt(v) + " 公斤"} contentStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="catchKg"
              radius={[0, 6, 6, 0]}
              barSize={16}
              fill="#2E86FF"
              shape={(props) => renderActiveBarHorizontal(props, catchBarActive)}
              isAnimationActive={true}
              animationDuration={900}
              animationEasing="ease-out"
              onMouseEnter={(_, i) => setCatchBarActive(i)}
              onMouseLeave={() => setCatchBarActive(-1)}
              onClick={(_, i) => setCatchBarActive(i === catchBarActive ? -1 : i)}
            >
              <LabelList
                dataKey="catchKg"
                position="right"
                formatter={(v) => fmt(v)}
                style={{ fontSize: 11, fill: "#425466", fontFamily: "var(--mono)" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="panel" id="shipping-detail-table">
        <div className="panel-title">各船漁獲與預估收入明細</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="left">船舶</th>
                <th>作業天數</th>
                <th>漁獲量（KG）</th>
                <th>超低溫（JPY）</th>
                <th>劍旗（USD）</th>
                <th>ACR（USD）</th>
              </tr>
            </thead>
            <tbody>
              {shippingInvWeek.vessels.map((v) => (
                <tr key={v.name}>
                  <td className="left name-cell">
                    <Ship size={14} color="#5DA9E9" /> {v.name}
                  </td>
                  <td>{v.days}</td>
                  <td>{fmt(v.catchKg)}</td>
                  <td>{fmtWan(v.cryoJPY)}</td>
                  <td>{fmtWan(v.swordUSD)}</td>
                  <td>{fmtWan(v.acrUSD)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="left">合計</td>
                <td>—</td>
                <td>{fmt(shippingInvWeek.total.catchKg)}</td>
                <td>{fmtWan(shippingInvWeek.total.cryoJPY)}</td>
                <td>{fmtWan(shippingInvWeek.total.swordUSD)}</td>
                <td>{fmtWan(shippingInvWeek.total.acrUSD)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 集團財務頁：資金狀況 ＋ 借款總表 ＋ AI 提醒
// ---------------------------------------------------------------------------
function CashAvailableCard({ title = "可動用餘額" }) {
  const rows = [
    { cur: "TWD", iconBg: "#2E86FF", balance: cashGroup.TWD.balance, restricted: cashGroup.TWD.restricted },
    { cur: "USD", iconBg: "#14B8A6", balance: cashGroup.USD.balance, restricted: cashGroup.USD.restricted },
    { cur: "JPY", iconBg: "#5DA9E9", balance: cashGroup.JPY.balance, restricted: cashGroup.JPY.restricted },
  ];
  return (
    <div className="kpi-card" style={{ borderLeft: "3px solid #2E86FF" }}>
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background: "linear-gradient(135deg, #2E86FF, #2E86FFCC)" }}>
          <Wallet size={20} color="#fff" />
        </div>
        <span className="kpi-label">{title}</span>
      </div>
      {rows.map((r) => (
        <div className="cash-avail-block" key={r.cur}>
          <div className="kpi-value">
            <span className="kpi-currency">{r.cur}</span>
            {fmtWan(r.balance)}
          </div>
          <div className="kpi-sub">
            <span className="kpi-sub-label">不可動用</span>
            <span className="kpi-sub-value" style={{ color: "#EF6461" }}>
              {r.cur} {fmtWan(r.restricted)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function NetCashFlowCard() {
  const rows = [
    { cur: "TWD", iconBg: "#2E86FF", inflow: cashGroup.TWD.inflow, outflow: cashGroup.TWD.outflow },
    { cur: "USD", iconBg: "#14B8A6", inflow: cashGroup.USD.inflow, outflow: cashGroup.USD.outflow },
  ];
  return (
    <div className="kpi-card" style={{ borderLeft: "3px solid #14B8A6" }}>
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background: "linear-gradient(135deg, #14B8A6, #14B8A6CC)" }}>
          <TrendingUp size={20} color="#fff" />
        </div>
        <span className="kpi-label">當日淨現金流</span>
      </div>
      {rows.map((r) => {
        const net = r.inflow - r.outflow;
        return (
          <div className="cash-avail-block" key={r.cur}>
            <div className="kpi-value" style={{ color: net < 0 ? "#EF6461" : "var(--text)" }}>
              <span className="kpi-currency">{r.cur}</span>
              {fmtWan(net)}
            </div>
            <div className="kpi-sub">
              <span className="kpi-sub-label">收入 / 支出</span>
              <span className="kpi-sub-value">
                {r.cur} {fmtWan(r.inflow)} / {fmtWan(r.outflow)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniRatioDonut({ label, used, total, color }) {
  const data = [
    { name: "已使用", value: used, color },
    { name: "剩餘", value: Math.max(total - used, 0), color: "#E7ECF2" },
  ];
  return (
    <div className="mini-donut">
      <ResponsiveContainer width={92} height={92}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={30} outerRadius={44} startAngle={90} endAngle={-270} stroke="none">
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="mini-donut-label">
        <div className="mini-donut-pct">{pct(used, total)}%</div>
      </div>
      <div className="mini-donut-name">{label}</div>
    </div>
  );
}

function CashCurrencyTable() {
  const rows = [
    { currency: "TWD", dept: "貿易部", ...cashByDept.trade.TWD },
    { currency: "TWD", dept: "船務部", ...cashByDept.shipping.TWD },
    { currency: "TWD", dept: "集團合計", ...cashGroup.TWD, isTotal: true },
    { currency: "USD", dept: "貿易部", ...cashByDept.trade.USD },
    { currency: "USD", dept: "船務部", ...cashByDept.shipping.USD },
    { currency: "USD", dept: "集團合計", ...cashGroup.USD, isTotal: true },
    { currency: "JPY", dept: "貿易部", ...cashByDept.trade.JPY },
    { currency: "JPY", dept: "船務部", ...cashByDept.shipping.JPY },
    { currency: "JPY", dept: "集團合計", ...cashGroup.JPY, isTotal: true },
  ];
  const fmt2 = (v) => fmtWan(v);
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th className="left">幣別</th>
            <th className="left">單位</th>
            <th>前日餘額</th>
            <th>收入</th>
            <th>支出</th>
            <th>不可動用</th>
            <th>餘額（可動用）</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={r.isTotal ? { background: "#F7FAFD" } : undefined}>
              <td className="left" style={r.isTotal ? { fontWeight: 700 } : undefined}>
                {r.dept === "貿易部" ? r.currency : ""}
              </td>
              <td className="left" style={r.isTotal ? { fontWeight: 700 } : undefined}>{r.dept}</td>
              <td>{fmt2(r.prev)}</td>
              <td>{fmt2(r.inflow)}</td>
              <td>{fmt2(r.outflow)}</td>
              <td className="neg">{fmt2(r.restricted)}</td>
              <td className={r.isTotal ? "pos" : undefined} style={r.isTotal ? { fontWeight: 700 } : undefined}>
                {fmt2(r.balance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoanDeptTable() {
  const fmt2 = (v) => (v ? fmtWan(v) : "—");
  const rows = [
    { dept: "船務部", ...loanTotals.shipping },
    { dept: "貿易部", ...loanTotals.trade },
    { dept: "集團合計", ...loanTotals.group, isTotal: true },
  ];
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th className="left">部門</th>
            <th>TWD</th>
            <th>USD</th>
            <th>JPY</th>
            <th>EUR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={r.isTotal ? { background: "#F7FAFD" } : undefined}>
              <td className="left" style={r.isTotal ? { fontWeight: 700 } : undefined}>{r.dept}</td>
              <td style={r.isTotal ? { fontWeight: 700 } : undefined}>{fmt2(r.TWD)}</td>
              <td>{fmt2(r.USD)}</td>
              <td>{fmt2(r.JPY)}</td>
              <td>{fmt2(r.EUR)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoanTotalCard() {
  const rows = [
    { cur: "TWD", iconBg: "#EF6461", value: loanTotals.group.TWD, pctUsed: pct(creditLine.TWD.used, creditLine.TWD.total) },
    { cur: "USD", iconBg: "#F2A93B", value: loanTotals.group.USD, pctUsed: pct(creditLine.USD.used, creditLine.USD.total) },
  ];
  return (
    <div className="kpi-card" style={{ borderLeft: "3px solid #EF6461" }}>
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background: "linear-gradient(135deg, #EF6461, #EF6461CC)" }}>
          <Building2 size={20} color="#fff" />
        </div>
        <span className="kpi-label">借款總額</span>
      </div>
      {rows.map((r) => (
        <div className="cash-avail-block" key={r.cur}>
          <div className="kpi-value">
            <span className="kpi-currency">{r.cur}</span>
            {fmtWan(r.value)}
          </div>
          <div className="kpi-sub">
            <span className="kpi-sub-label">授信使用率</span>
            <span className="kpi-sub-value" style={{ color: "#EF6461" }}>
              {r.pctUsed}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoanAvailableCard() {
  const rows = [
    { cur: "TWD", iconBg: "#14B8A6", available: creditLine.TWD.available, total: creditLine.TWD.total },
    { cur: "USD", iconBg: "#8B6BF2", available: creditLine.USD.available, total: creditLine.USD.total },
  ];
  return (
    <div className="kpi-card" style={{ borderLeft: "3px solid #14B8A6" }}>
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background: "linear-gradient(135deg, #14B8A6, #14B8A6CC)" }}>
          <Wallet size={20} color="#fff" />
        </div>
        <span className="kpi-label">剩餘可用額度</span>
      </div>
      {rows.map((r) => (
        <div className="cash-avail-block" key={r.cur}>
          <div className="kpi-value">
            <span className="kpi-currency">{r.cur}</span>
            {fmtWan(r.available)}
          </div>
          <div className="kpi-sub">
            <span className="kpi-sub-label">總額度</span>
            <span className="kpi-sub-value">
              {r.cur} {fmtYi(r.total)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FinancePage() {
  const [cashDetailOpen, setCashDetailOpen] = useState(false);
  const twdRestrictedPct = pct(cashGroup.TWD.restricted, cashGroup.TWD.prev + cashGroup.TWD.inflow - cashGroup.TWD.outflow);
  const usdRestrictedPct = pct(cashGroup.USD.restricted, cashGroup.USD.prev + cashGroup.USD.inflow - cashGroup.USD.outflow);
  const jpyRestrictedPct = pct(cashGroup.JPY.restricted, cashGroup.JPY.prev + cashGroup.JPY.inflow - cashGroup.JPY.outflow);
  const twdCreditUsedPct = pct(creditLine.TWD.used, creditLine.TWD.total);
  const usdCreditUsedPct = pct(creditLine.USD.used, creditLine.USD.total);
  const bankRanked = [...loanByBank].sort((a, b) => b.TWD - a.TWD);
  const [loanYearTwdActive, setLoanYearTwdActive] = useState(-1);
  const [loanYearUsdActive, setLoanYearUsdActive] = useState(-1);
  const [bankBarActive, setBankBarActive] = useState(-1);

  return (
    <div className="page-body">
      {/* ---------- 區塊一：資金狀況 ---------- */}
      <div className="period-bar">
        <CircleDollarSign size={16} />
        <span>資金狀況・2026/08/05　（資料來源：0805-貿易資金.xlsx ＋ 0805-船務資金.xlsx，貿易＋船務合計）</span>
      </div>

      <div className="chart-row">
        <CashAvailableCard />
        <NetCashFlowCard />
      </div>

      <div className="panel">
        <div className="panel-title">各幣別資金可動用比例</div>
        <div className="mini-donut-row">
          <MiniRatioDonut label="TWD 不可動用" used={cashGroup.TWD.restricted} total={cashGroup.TWD.prev + cashGroup.TWD.inflow - cashGroup.TWD.outflow} color="#2E86FF" />
          <MiniRatioDonut label="USD 不可動用" used={cashGroup.USD.restricted} total={cashGroup.USD.prev + cashGroup.USD.inflow - cashGroup.USD.outflow} color="#14B8A6" />
          <MiniRatioDonut label="JPY 不可動用" used={cashGroup.JPY.restricted} total={cashGroup.JPY.prev + cashGroup.JPY.inflow - cashGroup.JPY.outflow} color="#5DA9E9" />
          <div className="mini-donut-note">
            不可動用資金多為授信擔保用途之備償帳戶，三幣別故意不加總換算為單一金額，避免匯率假設造成誤導。
          </div>
        </div>
      </div>

      <div className="panel" id="cash-detail-table">
        <div
          className="panel-title collapsible-title"
          onClick={() => setCashDetailOpen((v) => !v)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setCashDetailOpen((v) => !v);
          }}
        >
          資金狀況明細（貿易部 / 船務部 / 集團合計）
          <ChevronRight size={15} className={"collapsible-chevron" + (cashDetailOpen ? " open" : "")} />
        </div>
        {cashDetailOpen && <CashCurrencyTable />}
      </div>

      {/* ---------- 區塊二：借款總表 ---------- */}
      <div className="period-bar" style={{ marginTop: 6 }}>
        <Landmark size={16} />
        <span>借款總表・截至 2026/08/03　（資料來源：115_8_3借款表.xlsx）</span>
      </div>


      <div className="chart-row">
        <LoanTotalCard />
        <LoanAvailableCard />
      </div>

      <div className="chart-row">
        <div className="panel">
          <div className="panel-title">借款到期年度分布（TWD）</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={loanByYear} margin={{ left: 8, right: 16, top: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F5" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#425466" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => fmtWan(v) + " 元"} contentStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="TWD"
                radius={[6, 6, 0, 0]}
                barSize={32}
                fill="#EF6461"
                shape={(props) => renderActiveBarVertical(props, loanYearTwdActive)}
                isAnimationActive={true}
                animationDuration={900}
                animationEasing="ease-out"
                onMouseEnter={(_, i) => setLoanYearTwdActive(i)}
                onMouseLeave={() => setLoanYearTwdActive(-1)}
                onClick={(_, i) => setLoanYearTwdActive(i === loanYearTwdActive ? -1 : i)}
              >
                <LabelList dataKey="TWD" position="top" formatter={(v) => fmtWan(v)} style={{ fontSize: 10.5, fontFamily: "var(--mono)", fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="panel">
          <div className="panel-title">借款到期年度分布（USD）</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={loanByYear} margin={{ left: 8, right: 16, top: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F5" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#425466" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => fmtWan(v) + " USD"} contentStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="USD"
                radius={[6, 6, 0, 0]}
                barSize={32}
                fill="#F2A93B"
                shape={(props) => renderActiveBarVertical(props, loanYearUsdActive)}
                isAnimationActive={true}
                animationDuration={900}
                animationEasing="ease-out"
                onMouseEnter={(_, i) => setLoanYearUsdActive(i)}
                onMouseLeave={() => setLoanYearUsdActive(-1)}
                onClick={(_, i) => setLoanYearUsdActive(i === loanYearUsdActive ? -1 : i)}
              >
                <LabelList dataKey="USD" position="top" formatter={(v) => (v ? fmtWan(v) : "")} style={{ fontSize: 10.5, fontFamily: "var(--mono)", fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel" id="loan-bank-chart">
        <div className="panel-title">借款依銀行分布（TWD，由高至低）</div>
        <ResponsiveContainer width="100%" height={480}>
          <BarChart
            data={bankRanked}
            layout="vertical"
            margin={{ left: 8, right: 50, top: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEF1F5" />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              interval={0}
              tick={{ fontSize: 11.5, fill: "#425466" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(v, key) => [fmtWan(v) + (key === "USD" ? " USD" : " 元"), key]} contentStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="TWD"
              radius={[0, 6, 6, 0]}
              barSize={12}
              fill="#2E86FF"
              shape={(props) => renderActiveBarHorizontal(props, bankBarActive)}
              isAnimationActive={true}
              animationDuration={900}
              animationEasing="ease-out"
              onMouseEnter={(_, i) => setBankBarActive(i)}
              onMouseLeave={() => setBankBarActive(-1)}
              onClick={(_, i) => setBankBarActive(i === bankBarActive ? -1 : i)}
            >
              <LabelList dataKey="TWD" position="right" formatter={(v) => (v ? fmtWan(v) : "")} style={{ fontSize: 10.5, fill: "#425466", fontFamily: "var(--mono)" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="placeholder-desc" style={{ textAlign: "left", marginTop: 4 }}>
          註：台北富邦、王道銀行僅有 USD 額度（分別為 2,468,528 / 1,473,693 USD），未計入本圖 TWD 排行。
        </div>
      </div>

      <div className="panel" id="loan-dept-table">
        <div className="panel-title">借款依部門分布</div>
        <LoanDeptTable />
      </div>

      {/* ---------- AI 提醒 ---------- */}
      <div className="ai-reminder">
        <div className="ai-reminder-head">
          <Sparkles size={18} />
          <span>AI 提醒</span>
        </div>
        <ul className="ai-reminder-list">
          <li>
            <b>USD 授信額度已使用 {usdCreditUsedPct}%</b>，剩餘可用額度僅 {fmtWan(creditLine.USD.available)} USD，
            加上集團美金可動用餘額僅 {fmtWan(cashGroup.USD.balance)} USD，兩者相加的美金調度空間相對有限，
            若近期有美金付款需求建議提前規劃。
          </li>
          <li>
            <b>JPY 現金有 {jpyRestrictedPct}% 屬不可動用</b>（多為授信擔保用途之備償帳戶），
            實際可自由運用的日圓僅 {fmtWan(cashGroup.JPY.balance)} 元，遠低於帳面總額。
          </li>
          <li>
            <b>2026 年內到期借款達 {fmtWan(loanByYear[0].TWD)}（TWD）＋ {fmt(loanByYear[0].USD)}（USD）</b>，
            是未來還款壓力最集中的一年，建議與資金狀況表對照，確認屆時可動用餘額是否足夠支應。
          </li>
          <li>
            TWD 資金相對寬鬆：不可動用比例 {twdRestrictedPct}%、授信使用率 {twdCreditUsedPct}%，仍有
            {fmtWan(creditLine.TWD.available)} 額度可運用。
          </li>
        </ul>
        <div className="ai-reminder-disclaimer">
          以上為依現有資料自動彙整之提醒，僅供參考，正式資金調度決策請以財務部覆核數字為準。
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 首頁：現金水位總覽 ＋ 庫存總覽（可點選跳轉）＋ AI 建議
// ---------------------------------------------------------------------------
function ClickableInventoryDonut({ title, data, totalLabel, totalValue, footer, onClick }) {
  const [hoverIndex, setHoverIndex] = useState(-1);
  return (
    <div className="panel inv-clickable-panel" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
    >
      <div className="panel-title">
        {title}
        <ChevronRight size={15} className="kpi-link-arrow" />
      </div>
      <div className="donut-wrap">
        <div className="donut-chart-box">
        <ResponsiveContainer width="100%" height={230}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={90}
              paddingAngle={2}
              stroke="none"
              activeIndex={hoverIndex}
              activeShape={renderActiveDonutShape}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
              onMouseEnter={(_, i) => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(-1)}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
          <div className="donut-center-label">
            <div className="donut-center-title">{totalLabel}</div>
            <div className="donut-center-value">{totalValue}</div>
          </div>
        </div>
        <div className="donut-legend">
          {data.map((d) => (
            <div className="legend-row" key={d.name}>
              <span className="legend-dot" style={{ background: d.color }} />
              <span className="legend-name">{d.name}</span>
              <span className="legend-pct">{pct(d.value, data.reduce((s, x) => s + x.value, 0))}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="inv-clickable-footer">
        {footer} <ChevronRight size={13} />
      </div>
    </div>
  );
}

function HomePage({ onNavigate }) {
  const dayuQtyData = dayuInvByCategory.map((c) => ({ name: c.name, value: c.qty, color: c.color }));
  const dayuQtyTotal = dayuInvByCategory.reduce((s, c) => s + c.qty, 0);

  const shipQtyData = shippingInvWeek.vessels
    .filter((v) => v.catchKg > 0)
    .map((v, i) => ({ name: v.name, value: v.catchKg, color: COMPANY_COLORS[i % COMPANY_COLORS.length] }));
  const shipQtyTotal = shippingInvWeek.total.catchKg;

  return (
    <div className="page-body">
      {/* ---------- 區塊一：現金水位 ---------- */}
      <div className="period-bar">
        <CircleDollarSign size={16} />
        <span>現金水位・2026/08/05　（資料來源：貿易＋船務資金狀況表）</span>
      </div>
      <div className="flex-card-row">
        <CashAvailableCard title="集團資金水位" />
      </div>

      {/* ---------- AI 提醒（現金水位） ---------- */}
      <div className="ai-reminder">
        <div className="ai-reminder-head">
          <Sparkles size={18} />
          <span>AI 提醒及建議</span>
        </div>
        <ul className="ai-reminder-list">
          <li>
            <b>美金資金水位相對吃緊</b>：可動用餘額僅 USD {fmtWan(cashGroup.USD.balance)}，
            且授信可用額度也只剩 USD {fmtWan(creditLine.USD.available)}，建議近期美金付款前先確認調度來源。
          </li>
          <li>
            台幣資金相對寬鬆，可動用餘額 TWD {fmtWan(cashGroup.TWD.balance)}，授信仍有 TWD {fmtWan(creditLine.TWD.available)} 額度可運用。
          </li>
        </ul>
        <div className="ai-reminder-disclaimer">
          以上為依現有資料自動彙整之提醒，僅供參考，正式資金調度決策請以財務部覆核數字為準。
        </div>
      </div>

      {/* ---------- 區塊二：庫存總覽（可點選跳轉） ---------- */}
      <div className="period-bar" style={{ marginTop: 6 }}>
        <Warehouse size={16} />
        <span>庫存總覽　（點選圖表可查看明細）</span>
      </div>

      {/* ---------- AI 提醒（庫存） ---------- */}
      <div className="ai-reminder">
        <div className="ai-reminder-head">
          <Sparkles size={18} />
          <span>AI 提醒及建議</span>
        </div>
        <ul className="ai-reminder-list">
          <li>
            <b>大漁庫存有 {dayuInvSummary.expiredItems} 筆商品已過期</b>（金額 {fmtWan(dayuInvSummary.expiredCost)} 元），
            另有 {dayuInvSummary.nearExpiryItems} 筆將於 6 個月內到期，建議優先處理「干貝2S」等緊急等級品項。
          </li>
          <li>
            <b>船務本週（{shippingInvWeek.period}）總漁獲量 {fmt(shipQtyTotal)} 公斤</b>，
            宏洋輪本週無作業天數，其餘五艘船皆有進帳，可留意單船產能是否需要調度支援。
          </li>
        </ul>
        <div className="ai-reminder-disclaimer">
          以上為依現有資料自動彙整之建議，僅供參考，正式決策請以各部門覆核數字為準。
        </div>
      </div>

      <div className="chart-row">
        <ClickableInventoryDonut
          title="大漁庫存量（依產品類別）"
          data={dayuQtyData}
          totalLabel="總數量"
          totalValue={fmt(dayuQtyTotal)}
          footer="查看大漁庫存明細"
          onClick={() => onNavigate("inventory", "dayu")}
        />
        <ClickableInventoryDonut
          title="船存庫存量（各船漁獲量・本週）"
          data={shipQtyData}
          totalLabel="總漁獲量(KG)"
          totalValue={fmt(shipQtyTotal)}
          footer="查看船務庫存明細"
          onClick={() => onNavigate("inventory", "shipping")}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 主框架
// ---------------------------------------------------------------------------
const NAV = [
  { key: "home", label: "首頁", icon: Home },
  { key: "finance", label: "集團財務", icon: Landmark },
  { key: "inventory", label: "集團庫存", icon: Warehouse },
  { key: "pnl", label: "集團損益", icon: PieIcon },
];

const PNL_TABS = [
  { key: "consolidated", label: "合併總覽" },
  { key: "trade", label: "貿易損益" },
  { key: "dayu", label: "大漁損益" },
  { key: "shipping", label: "船務損益" },
];

const INVENTORY_TABS = [
  { key: "dayu", label: "大漁庫存" },
  { key: "shipping", label: "船務庫存" },
];

function Dashboard() {
  const [nav, setNav] = useState("home");
  const [pnlTab, setPnlTab] = useState("consolidated");
  const [invTab, setInvTab] = useState("dayu");

  const handleNavigate = (navKey, tabKey) => {
    setNav(navKey);
    if (navKey === "inventory" && tabKey) setInvTab(tabKey);
    if (navKey === "pnl" && tabKey) setPnlTab(tabKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app">
      <style>{CSS}</style>

      <header className="topbar">
        <div className="brand">
          <div>
            <div className="brand-title">Ocean King Group</div>
            <div className="brand-title-sub">智慧經營管理平台</div>
            <div className="brand-sub">Data Driven, Future Ready</div>
          </div>
        </div>
        <nav className="topnav">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <button
                key={n.key}
                className={"topnav-item" + (nav === n.key ? " active" : "")}
                onClick={() => {
                  setNav(n.key);
                  if (n.key === "pnl") setPnlTab("consolidated");
                }}
              >
                <Icon size={15} />
                {n.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="main">
        {nav === "home" ? (
          <HomePage onNavigate={handleNavigate} />
        ) : nav === "finance" ? (
          <FinancePage />
        ) : nav === "inventory" ? (
          <>
            <div className="subnav">
              {INVENTORY_TABS.map((t) => (
                <button
                  key={t.key}
                  className={"subnav-item" + (invTab === t.key ? " active" : "")}
                  onClick={() => setInvTab(t.key)}
                >
                  {t.label}
                  <ChevronRight size={13} className="subnav-chevron" />
                </button>
              ))}
            </div>
            {invTab === "dayu" && <DayuInventory />}
            {invTab === "shipping" && <ShippingInventory />}
          </>
        ) : (
          <>
            <div className="subnav">
              {PNL_TABS.map((t) => (
                <button
                  key={t.key}
                  className={"subnav-item" + (pnlTab === t.key ? " active" : "")}
                  onClick={() => setPnlTab(t.key)}
                >
                  {t.label}
                  <ChevronRight size={13} className="subnav-chevron" />
                </button>
              ))}
            </div>
            {pnlTab === "consolidated" && <ConsolidatedOverview />}
            {pnlTab === "shipping" && <ShippingPnl />}
            {pnlTab === "trade" && (
              <CompanySegmentPnl
                periodLabel="貿易損益・2026年6月"
                sourceLabel="202606_貿易.xlsx（海之寶＋廣宏＋O.K.＋廣宏(東港)）"
                companies={tradeCompanies}
                total={tradeTotal}
                cumulative={tradeCumulative}
                monthly={tradeMonthly2026}
                compare={tradeCompare}
                icon={Package}
                accent="貿易"
                insight={
                  <>
                    <b>貿易事業群本月毛利率 {pct(tradeTotal.grossProfit, tradeTotal.revenue)}%</b>
                    ，營業費用控管良好（費用率僅 {pct(tradeTotal.opex, tradeTotal.revenue)}%）；
                    但營業外收支虧損 {fmtWan(Math.abs(tradeTotal.nonOp))} 元，
                    是稅前淨利率由 {pct(tradeTotal.opProfit, tradeTotal.revenue)}% 降至
                    {pct(tradeTotal.pretax, tradeTotal.revenue)}% 的主因，
                    建議追蹤該筆營業外損失的具體來源（如匯兌、利息等）。
                    累計來看，1–6月營收 {fmtWan(tradeCumulative.revenue)}、稅前損益
                    {fmtWan(tradeCumulative.pretax)}，較去年同期（稅前 {fmtWan(tradeCompare.yoyCum.prevPretax)}）明顯成長。
                  </>
                }
              />
            )}
            {pnlTab === "dayu" && (
              <CompanySegmentPnl
                periodLabel="大漁損益・2026年6月"
                sourceLabel="202606_貿易.xlsx（大漁＋海和＋正洋）"
                companies={dayuCompanies}
                total={dayuTotal}
                cumulative={dayuCumulative}
                monthly={dayuMonthly2026}
                compare={dayuCompare}
                icon={Waves}
                accent="大漁"
                insight={
                  <>
                    <b>大漁事業群毛利率 {pct(dayuTotal.grossProfit, dayuTotal.revenue)}% 尚可</b>
                    ，但營業費用幾乎吃掉全部毛利（營業淨利率僅
                    {pct(dayuTotal.opProfit, dayuTotal.revenue)}%），
                    加上營業外收支虧損 {fmtWan(Math.abs(dayuTotal.nonOp))} 元，
                    最終稅前為虧損 {fmtWan(Math.abs(dayuTotal.pretax))} 元，
                    建議檢視營業費用結構是否有精簡空間。
                    累計來看，1–6月營收 {fmtWan(dayuCumulative.revenue)}、稅前為虧損
                    {fmtWan(Math.abs(dayuCumulative.pretax))} 元，較去年同期（稅前虧損
                    {fmtWan(Math.abs(dayuCompare.yoyCum.prevPretax))} 元）虧損幅度擴大，建議留意全年度獲利狀況。
                  </>
                }
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 登入保護（前端簡易密碼驗證）
// 三組密碼各自獨立、看到的內容完全相同，方便個別管理／停用單一組密碼。
// 密碼不是明文存在程式碼裡，而是存 SHA-256 雜湊值；要換密碼／停用某一組，
// 只要把對應的雜湊值換掉或刪掉即可，換法請見下方 sha256Hex 的說明。
// 注意：這只是前端層級的簡易防護（防君子不防小人），不是真正安全的後端驗證。
// ---------------------------------------------------------------------------
const PASSWORD_HASHES = [
  "62863359a900064334f68ca1762ff40f82921c2b149559a0c1faeab30cb9d8a0", // 通行碼一
  "5e4e3541df7fb794338c6f6c404c5301d9b28157c888bd585a68bbc2357cf0d7", // 通行碼二
  "a2b4973a3c8c8033ab1a3ab439fa565ffc01147d151b00e5125ebb13abdc99cf", // 通行碼三
];

const AUTH_STORAGE_KEY = "ok_group_dashboard_auth_v1";

// 把輸入的密碼算成 SHA-256 雜湊值（十六進位字串），拿去跟 PASSWORD_HASHES 比對。
// 如果要換新密碼：打開瀏覽器 Console，貼上以下程式碼算出新雜湊值，
// 再把 PASSWORD_HASHES 陣列裡對應那一組換掉：
//   crypto.subtle.digest("SHA-256", new TextEncoder().encode("你的新密碼"))
//     .then(buf => console.log(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("")))
async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function LoginGate() {
  const [authed, setAuthed] = useState(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleLogin = async () => {
    if (!password || checking) return;
    setChecking(true);
    setError("");
    try {
      const hash = await sha256Hex(password);
      if (PASSWORD_HASHES.includes(hash)) {
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, "1");
        } catch (e) {
          /* localStorage 不可用時仍允許本次瀏覽通過 */
        }
        setAuthed(true);
      } else {
        setError("密碼不正確，請再確認一次。");
      }
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    setAuthed(false);
    setPassword("");
  };

  if (authed) {
    return (
      <div style={{ position: "relative" }}>
        <Dashboard />
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={13} />
          登出
        </button>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <style>{CSS}</style>
      <div className="login-card">
        <div className="login-brand">
          <div className="login-title">Ocean King Group</div>
          <div className="login-title-sub">智慧經營管理平台</div>
          <div className="login-tagline">Data Driven, Future Ready</div>
        </div>
        <div className="login-form">
          <label className="login-label">請輸入通行密碼</label>
          <input
            type="password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
            placeholder="輸入密碼"
            autoFocus
            disabled={checking}
          />
          {error && <div className="login-error">{error}</div>}
          <button className="login-btn" onClick={handleLogin} disabled={checking || !password}>
            {checking ? "驗證中…" : "登入"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GroupPnlDashboard() {
  return <LoginGate />;
}

// ---------------------------------------------------------------------------
// 樣式
// ---------------------------------------------------------------------------
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Space+Grotesk:wght@500;600;700&display=swap');
:root{
  --navy:#081226;
  --navy-2:#0F2547;
  --navy-3:#15335E;
  --teal:#14B8A6;
  --coral:#EF6461;
  --gold:#F2A93B;
  --blue:#2E86FF;
  --cyan:#22D3EE;
  --purple:#8B6BF2;
  --bg:#EEF2F8;
  --card:#FFFFFF;
  --text:#1B2733;
  --muted:#64748B;
  --border:#E6EAF0;
  --mono:'IBM Plex Mono','Roboto Mono',monospace;
  --display:'Space Grotesk','Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif;
}
*{box-sizing:border-box;}
.app{
  font-family:'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif;
  background:
    radial-gradient(circle at 1px 1px, rgba(11,42,74,0.055) 1px, transparent 0) 0 0/24px 24px,
    linear-gradient(180deg,#F3F6FB 0%,#ECF1F9 100%);
  color:var(--text);
  min-height:100vh;
  width:100%;
}
.recharts-wrapper svg,
.recharts-wrapper svg *,
.recharts-pie-sector,
.recharts-sector,
.recharts-surface{
  outline:none !important;
}
.recharts-pie-sector, .recharts-sector{cursor:pointer;}
.topbar{
  background:linear-gradient(120deg,var(--navy) 0%, var(--navy-2) 55%, var(--navy-3) 100%);
  color:#fff;
  padding:16px 24px;
  display:flex;
  align-items:center;
  gap:24px;
  flex-wrap:wrap;
  position:relative;
  overflow:hidden;
  box-shadow:0 4px 24px -8px rgba(8,18,38,0.55);
}
.topbar::before{
  content:'';position:absolute;top:-70%;right:-6%;width:420px;height:420px;
  background:radial-gradient(circle,rgba(46,134,255,0.30) 0%,rgba(46,134,255,0) 68%);
  pointer-events:none;
}
.topbar::after{
  content:'';position:absolute;left:0;right:0;bottom:0;height:2px;
  background:linear-gradient(90deg,var(--blue) 0%,var(--cyan) 35%,var(--teal) 65%,var(--purple) 100%);
  opacity:0.85;
}
.topbar > *{position:relative;z-index:1;}
.brand{display:flex;align-items:center;gap:10px;}
.brand-icon{
  width:38px;height:38px;border-radius:10px;
  background:rgba(255,255,255,0.12);
  display:flex;align-items:center;justify-content:center;
}
.brand-title{
  font-family:var(--display);font-weight:700;font-size:18px;letter-spacing:0.5px;
  background:linear-gradient(90deg,#FFFFFF 0%,#BFE0FF 60%,#8FD8FF 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
}
.brand-title-sub{font-weight:500;font-size:12px;color:#B9CBE2;letter-spacing:0.5px;margin-top:2px;}
.brand-sub{
  font-family:'Dancing Script',cursive;font-weight:600;font-size:16px;
  color:#7FD1FF;letter-spacing:0.5px;margin-top:3px;
}
.topnav{display:flex;gap:4px;flex:1;flex-wrap:wrap;}
.topnav-item{
  background:transparent;border:1px solid transparent;color:#C7D6E8;
  padding:8px 15px;border-radius:9px;font-size:13px;cursor:pointer;
  display:flex;align-items:center;gap:6px;font-family:inherit;
  transition:background 0.18s,border-color 0.18s,box-shadow 0.18s,color 0.18s;
}
.topnav-item:hover{background:rgba(255,255,255,0.08);color:#fff;border-color:rgba(255,255,255,0.12);}
.topnav-item.active{
  background:linear-gradient(135deg,rgba(46,134,255,0.38),rgba(34,211,238,0.22));
  color:#fff;font-weight:600;border-color:rgba(126,201,255,0.35);
  box-shadow:0 0 0 1px rgba(255,255,255,0.08) inset,0 4px 16px -4px rgba(46,134,255,0.55);
}
.main{padding:18px 22px 40px;}
.subnav{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;}
.subnav-item{
  background:var(--card);border:1px solid var(--border);
  padding:9px 16px;border-radius:9px;font-size:13px;cursor:pointer;
  display:flex;align-items:center;gap:2px;color:var(--muted);font-family:inherit;font-weight:500;
  transition:box-shadow 0.15s,border-color 0.15s,transform 0.15s;
}
.subnav-item:hover{border-color:#BFD6EE;transform:translateY(-1px);}
.subnav-item .subnav-chevron{display:none;}
.subnav-item.active{
  background:linear-gradient(135deg,var(--navy) 0%,var(--navy-3) 100%);
  color:#fff;border-color:var(--navy);font-weight:700;
  box-shadow:0 4px 14px -4px rgba(11,42,74,0.45);
}
.subnav-item.active .subnav-chevron{display:inline;}
.period-bar{
  display:flex;align-items:center;gap:10px;
  font-size:13.5px;font-weight:700;color:var(--navy);margin-bottom:16px;
  background:linear-gradient(90deg,#EAF1FA 0%,#F6FAFF 100%);
  border:1px solid #CFE0F5;border-left:4px solid var(--blue);
  padding:11px 16px;border-radius:10px;
  box-shadow:0 6px 18px -12px rgba(46,134,255,0.35);
}
.period-bar svg{color:var(--blue);flex-shrink:0;}
.unit-badge{
  margin-left:auto;flex-shrink:0;background:#fff;border:1px solid #BFD6EE;color:var(--blue);
  font-family:var(--display);font-size:11px;font-weight:700;letter-spacing:0.4px;
  padding:3px 9px;border-radius:20px;
}
.kpi-grid{
  display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:14px;
}
@media(max-width:900px){.kpi-grid{grid-template-columns:repeat(2,1fr);}}
.flex-card-row{
  display:flex;flex-wrap:wrap;gap:14px;margin-bottom:14px;
}
.flex-card-row > .kpi-card{
  flex:1 1 320px;max-width:480px;
}
.kpi-card{
  background:var(--card);border:1px solid var(--border);border-radius:15px;
  padding:16px 18px;transition:box-shadow 0.15s, border-color 0.15s, transform 0.15s;
  box-shadow:0 1px 2px rgba(16,24,40,0.04),0 10px 24px -16px rgba(16,24,40,0.18);
  position:relative;
}
.kpi-clickable{cursor:pointer;}
.kpi-clickable:hover{
  border-color:#BFD6EE;box-shadow:0 4px 14px rgba(11,42,74,0.08);transform:translateY(-1px);
}
.kpi-clickable:focus-visible{outline:2px solid var(--blue);outline-offset:2px;}
.kpi-link-arrow{margin-left:auto;color:#B8C2CE;flex-shrink:0;}
.kpi-top{display:flex;align-items:center;gap:9px;margin-bottom:10px;}
.kpi-icon{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;}
.kpi-label{font-size:12.5px;color:var(--muted);font-weight:500;}
.kpi-value{
  font-family:var(--mono);font-size:24px;font-weight:700;color:var(--text);
  display:flex;align-items:baseline;gap:4px;flex-wrap:wrap;
}
.kpi-currency{
  font-family:var(--display);font-size:12.5px;font-weight:700;color:var(--muted);
  background:#F1F5F9;border-radius:5px;padding:2px 6px;margin-right:2px;letter-spacing:0.3px;
}
.kpi-unit{font-size:12px;color:var(--muted);font-weight:500;}
.kpi-sub{display:flex;justify-content:space-between;margin-top:10px;font-size:12px;
  padding-top:8px;border-top:1px dashed var(--border);}
.kpi-sub-value{font-family:var(--mono);font-weight:600;}
.cash-avail-block{margin-top:14px;padding-top:14px;border-top:1px solid var(--border);}
.cash-avail-block:first-of-type{margin-top:4px;padding-top:0;border-top:none;}
.cash-avail-block .kpi-value{margin-bottom:0;}
.insight-banner{
  display:flex;gap:10px;background:#FFF7E8;border:1px solid #F6DFAE;
  border-radius:13px;padding:13px 16px;font-size:13px;line-height:1.7;
  color:#5A4A22;margin-bottom:16px;
  box-shadow:0 6px 18px -12px rgba(154,110,10,0.35);
}
.insight-banner.soft{background:#EAF4FB;border-color:#CFE3F5;color:#2B4F6B;box-shadow:0 6px 18px -12px rgba(20,90,150,0.25);}
.insight-banner b{color:inherit;}
.chart-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
@media(max-width:960px){.chart-row{grid-template-columns:1fr;}}
.panel{
  background:var(--card);border:1px solid var(--border);border-radius:15px;
  padding:18px 20px;margin-bottom:14px;position:relative;overflow:hidden;
  box-shadow:0 1px 2px rgba(16,24,40,0.04),0 12px 28px -18px rgba(16,24,40,0.20);
}
.panel::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,rgba(46,134,255,0.55) 30%,rgba(34,211,238,0.5) 55%,transparent 85%);
}
.panel-title{
  font-size:14px;font-weight:700;margin-bottom:14px;color:var(--text);
  display:flex;align-items:center;gap:6px;
}
.collapsible-title{cursor:pointer;justify-content:space-between;user-select:none;}
.collapsible-title:hover{color:var(--blue);}
.collapsible-chevron{transition:transform 0.2s ease;color:var(--muted);flex-shrink:0;}
.collapsible-chevron.open{transform:rotate(90deg);}
.donut-wrap{display:flex;align-items:center;gap:10px;position:relative;}
.donut-chart-box{width:55%;flex-shrink:0;position:relative;}
.donut-center-label{
  position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;
  pointer-events:none;
}
.donut-center-title{font-size:11px;color:var(--muted);}
.donut-center-value{font-family:var(--mono);font-weight:700;font-size:15px;}
.donut-center-unit{font-size:10px;color:var(--muted);}
.donut-legend{flex:1;display:flex;flex-direction:column;gap:8px;}
.legend-row{display:flex;align-items:center;gap:8px;font-size:12.5px;}
.legend-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}
.legend-name{flex:1;color:var(--text);}
.legend-pct{font-family:var(--mono);color:var(--muted);font-weight:600;}
.table-wrap{overflow-x:auto;}
table{width:100%;border-collapse:collapse;font-size:12.5px;min-width:760px;}
table.fixed-cols{table-layout:fixed;min-width:560px;}
.freeze-col1 thead th:first-child,
.freeze-col1 tbody td:first-child,
.freeze-col1 tfoot td:first-child{
  position:sticky;left:0;z-index:2;background:var(--card);
  box-shadow:2px 0 5px -2px rgba(16,24,40,0.10);
}
.freeze-col1 thead th:first-child{background:#fff;z-index:3;}
thead th{
  text-align:right;color:var(--muted);font-weight:600;font-size:11.5px;
  padding:8px 10px;border-bottom:2px solid var(--border);white-space:nowrap;
}
thead th.left{text-align:left;}
tbody td{
  text-align:right;padding:9px 10px;font-family:var(--mono);
  border-bottom:1px solid var(--border);color:var(--text);
}
tbody td.left{text-align:left;font-family:inherit;}
.name-cell{display:flex;align-items:center;gap:6px;font-weight:600;}
tfoot td{
  text-align:right;padding:10px;font-family:var(--mono);font-weight:700;
  border-top:2px solid var(--text);color:var(--text);
}
tfoot td.left{text-align:left;font-family:inherit;}
.pos{color:var(--teal);}
.neg{color:var(--coral);}
.opex-bars{display:flex;flex-direction:column;gap:18px;}
.opex-group{display:flex;flex-direction:column;gap:6px;}
.opex-row{display:grid;grid-template-columns:130px 1fr 90px 44px;align-items:center;gap:10px;font-size:12.5px;}
.opex-subitems{
  display:flex;flex-wrap:wrap;align-items:center;gap:8px;
  padding-left:2px;font-size:11.5px;color:var(--muted);
}
.opex-subitem{
  font-family:var(--mono);color:var(--text);background:#F8FAFC;border:1px solid var(--border);
  border-radius:6px;padding:2px 8px;
}
.opex-name{color:var(--text);}
.opex-track{background:#EEF1F5;border-radius:6px;height:9px;overflow:hidden;}
.opex-fill{height:100%;border-radius:6px;}
.opex-value{font-family:var(--mono);text-align:right;color:var(--muted);}
.opex-pct{font-family:var(--mono);text-align:right;font-weight:700;}
.placeholder-panel{
  background:var(--card);border:1px dashed #CBD5E1;border-radius:14px;
  padding:44px 24px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;
}
.placeholder-title{font-size:15px;font-weight:700;margin-top:4px;}
.placeholder-desc{font-size:12.5px;color:var(--muted);max-width:440px;line-height:1.7;}
.placeholder-tags{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:8px;}
.tag{
  background:#F1F5F9;color:var(--muted);font-size:11px;padding:4px 10px;border-radius:20px;
}
.segment-compare{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:14px;}
@media(max-width:900px){.segment-compare{grid-template-columns:1fr;}}
.segment-card{
  background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px 18px;
}
.segment-card.active{border-color:#BEE3DB;background:#F3FBF9;}
.segment-head{display:flex;align-items:center;gap:8px;font-weight:700;font-size:13.5px;margin-bottom:12px;}
.badge-live{
  margin-left:auto;background:#DCF5EE;color:#0E9A82;font-size:10.5px;padding:3px 8px;border-radius:20px;font-weight:700;
}
.badge-pending{
  margin-left:auto;background:#FDECC8;color:#9C6B0C;font-size:10.5px;padding:3px 8px;border-radius:20px;font-weight:700;
}
.segment-row{display:flex;justify-content:space-between;font-size:13px;padding:5px 0;color:var(--muted);}
.segment-row b{font-family:var(--mono);color:var(--text);}
.segment-empty{font-size:12px;color:#B8C2CE;padding:14px 0;text-align:center;}
.mini-donut-row{display:flex;align-items:center;gap:28px;flex-wrap:wrap;}
.mini-donut{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;}
.mini-donut-label{position:absolute;top:34px;left:0;right:0;text-align:center;}
.mini-donut-pct{font-family:var(--mono);font-weight:700;font-size:13px;}
.mini-donut-name{font-size:11.5px;color:var(--muted);text-align:center;}
.mini-donut-note{flex:1;min-width:200px;font-size:12px;color:var(--muted);line-height:1.6;}
.ai-reminder{
  background:linear-gradient(180deg,#F6F4FF 0%,#FBFAFF 100%);
  border:1px solid #DFD9F5;border-radius:15px;padding:18px 20px;margin-top:4px;
  position:relative;overflow:hidden;
  box-shadow:0 1px 2px rgba(16,24,40,0.04),0 10px 24px -18px rgba(91,63,168,0.25);
}
.ai-reminder::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,rgba(139,107,242,0.55) 40%,rgba(139,107,242,0.35) 65%,transparent 90%);
}
.ai-reminder-head{
  position:relative;display:flex;align-items:center;gap:8px;
  font-family:var(--display);font-weight:700;font-size:14px;color:#5B3FA8;margin-bottom:12px;
}
.ai-reminder-list{position:relative;margin:0;padding-left:18px;display:flex;flex-direction:column;gap:9px;}
.ai-reminder-list li{font-size:13px;line-height:1.7;color:#3A2F5C;}
.ai-reminder-list b{color:#5B3FA8;font-weight:700;}
.ai-reminder-disclaimer{
  position:relative;margin-top:14px;padding-top:10px;border-top:1px dashed #DCD6F7;
  font-size:11.5px;color:#8B7FB0;
}
.cash-summary-rows{display:flex;flex-direction:column;gap:7px;margin:2px 0 4px;}
.cash-summary-row{display:flex;align-items:center;gap:8px;}
.cash-summary-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.cash-summary-currency{font-size:11.5px;color:var(--muted);width:34px;font-weight:600;}
.cash-summary-value{font-family:var(--mono);font-weight:700;font-size:15px;color:var(--text);}
.inv-clickable-panel{cursor:pointer;transition:box-shadow 0.15s, border-color 0.15s, transform 0.15s;}
.inv-clickable-panel:hover{border-color:#BFD6EE;box-shadow:0 12px 28px -14px rgba(46,134,255,0.35);transform:translateY(-2px);}
.inv-clickable-panel:focus-visible{outline:2px solid var(--blue);outline-offset:2px;}
.inv-clickable-panel .panel-title{display:flex;align-items:center;}
.inv-clickable-footer{
  display:flex;align-items:center;gap:2px;justify-content:flex-end;
  font-size:12px;color:var(--blue);font-weight:600;margin-top:8px;
}

/* ===========================================================
   手機版排版調整（僅影響 <=640px，桌機版樣式不受影響）
   =========================================================== */
@media(max-width:640px){
  .topbar{
    flex-direction:column;align-items:flex-start;gap:10px;padding:12px 14px;
  }
  .brand-title{font-size:15px;}
  .brand-title-sub{font-size:11px;}
  .brand-sub{font-size:13px;}
  .topnav{width:100%;gap:4px;}
  .topnav-item{padding:7px 10px;font-size:12px;flex:1 1 auto;justify-content:center;}
  .main{padding:12px 12px 32px;}
  .subnav{gap:6px;}
  .subnav-item{padding:7px 12px;font-size:12.5px;}
  .period-bar{font-size:11.5px;padding:7px 10px;line-height:1.5;}
  .kpi-grid{grid-template-columns:1fr 1fr;gap:8px;}
  .kpi-card{padding:12px 13px;}
  .kpi-label{font-size:11px;}
  .kpi-value{font-size:19px;}
  .kpi-unit{font-size:10.5px;}
  .kpi-sub{font-size:10.5px;}
  .panel{padding:14px 14px;}
  .panel-title{font-size:13px;}
  .insight-banner, .insight-banner.soft{font-size:12px;padding:11px 12px;}
  /* 圓餅圖：桌機是圖表+圖例並排，手機改成上下堆疊，避免圖表被壓扁 */
  .donut-wrap{flex-direction:column;align-items:stretch;gap:16px;}
  .donut-chart-box{width:100%;}
  .donut-legend{width:100%;}
  .legend-row{font-size:12px;}
  .mini-donut-row{gap:16px;justify-content:space-around;}
  .mini-donut-note{min-width:100%;order:99;text-align:center;}
  /* 費用結構橫條：桌機是「名稱/長條/數字/百分比」四欄一列，手機改成三行排列 */
  .opex-row{
    grid-template-columns:1fr auto;grid-template-rows:auto auto auto;
    row-gap:4px;column-gap:8px;font-size:12px;
  }
  .opex-name{grid-column:1;grid-row:1;}
  .opex-pct{grid-column:2;grid-row:1;}
  .opex-track{grid-column:1/3;grid-row:2;}
  .opex-value{grid-column:1/3;grid-row:3;text-align:right;font-size:11px;}
  /* 表格：字級縮小、內距縮小，配合既有的橫向捲動 */
  table{font-size:11px;}
  thead th{padding:6px 6px;font-size:10.5px;}
  tbody td{padding:7px 6px;}
  tfoot td{padding:7px 6px;}
  .segment-compare{gap:10px;}
  .segment-card{padding:13px 14px;}
  .ai-reminder{padding:14px 15px;}
  .ai-reminder-list li{font-size:12.5px;}
  .cash-summary-value{font-size:14px;}
}
.login-screen{
  min-height:100vh;width:100%;display:flex;align-items:center;justify-content:center;
  background:
    radial-gradient(circle at 1px 1px, rgba(11,42,74,0.055) 1px, transparent 0) 0 0/24px 24px,
    linear-gradient(135deg,#081428 0%,#0F2547 55%,#15335E 100%);
  padding:20px;font-family:'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif;
}
.login-card{
  width:100%;max-width:380px;background:rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.14);border-radius:18px;padding:36px 32px;
  backdrop-filter:blur(6px);box-shadow:0 24px 60px -20px rgba(0,0,0,0.6);
}
.login-brand{text-align:center;margin-bottom:28px;}
.login-title{
  font-family:var(--display);font-weight:700;font-size:22px;
  background:linear-gradient(90deg,#FFFFFF 0%,#BFE0FF 60%,#8FD8FF 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
}
.login-title-sub{font-size:13px;color:#B9CBE2;margin-top:4px;}
.login-tagline{font-family:'Dancing Script',cursive;font-weight:600;font-size:16px;color:#7FD1FF;margin-top:8px;}
.login-form{display:flex;flex-direction:column;gap:12px;}
.login-label{font-size:12.5px;color:#C7D6E8;font-weight:500;}
.login-input{
  background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:10px;
  padding:11px 14px;font-size:14px;color:#fff;outline:none;font-family:inherit;
  transition:border-color 0.15s,box-shadow 0.15s;
}
.login-input::placeholder{color:#7488A6;}
.login-input:focus{border-color:#5DA9E9;box-shadow:0 0 0 3px rgba(93,169,233,0.2);}
.login-input:disabled{opacity:0.6;}
.login-error{
  font-size:12.5px;color:#FF9B9B;background:rgba(239,100,97,0.12);
  border:1px solid rgba(239,100,97,0.3);border-radius:8px;padding:8px 11px;
}
.login-btn{
  margin-top:4px;background:linear-gradient(135deg,#2E86FF,#22D3EE);color:#fff;border:none;
  border-radius:10px;padding:11px 16px;font-size:14px;font-weight:700;cursor:pointer;
  font-family:inherit;transition:opacity 0.15s,transform 0.15s;
  box-shadow:0 8px 20px -8px rgba(46,134,255,0.6);
}
.login-btn:hover:not(:disabled){transform:translateY(-1px);}
.login-btn:disabled{opacity:0.5;cursor:not-allowed;}
.logout-btn{
  position:fixed;bottom:18px;right:18px;z-index:50;display:flex;align-items:center;gap:6px;
  background:rgba(8,20,40,0.9);color:#E4ECFB;border:1px solid rgba(255,255,255,0.15);
  border-radius:20px;padding:8px 14px;font-size:12.5px;font-weight:600;cursor:pointer;
  font-family:inherit;box-shadow:0 8px 20px -8px rgba(0,0,0,0.5);backdrop-filter:blur(4px);
  transition:transform 0.15s,background 0.15s;
}
.logout-btn:hover{background:rgba(8,20,40,1);transform:translateY(-1px);}
`;
