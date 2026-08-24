/**
 * Vietnamese Lunar Calendar Algorithm (Lịch Âm Việt Nam - UTC+7)
 * Based on the astronomical formulas by Dr. Ho Ngoc Duc.
 */

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeap: boolean;
  canChiYear: string;
}

const CAN = [
  "Giáp",
  "Ất",
  "Bính",
  "Đinh",
  "Mậu",
  "Kỷ",
  "Canh",
  "Tân",
  "Nhâm",
  "Quý",
];

const CHI = [
  "Tý",
  "Sửu",
  "Dần",
  "Mão",
  "Thìn",
  "Tỵ",
  "Ngọ",
  "Mùi",
  "Thân",
  "Dậu",
  "Tuất",
  "Hợi",
];

function jdFromDate(dd: number, mm: number, yyyy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yyyy + 4800 - a;
  const m = mm + 12 * a - 3;
  return (
    dd +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function getNewMoonDay(k: number, timeZone = 7): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 =
    2415020.75933 +
    29.53058868 * k +
    0.0001178 * T2 -
    0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

  let C1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) +
    0.0021 * Math.sin(2 * M * dr);
  C1 -= 0.4068 * Math.sin(Mpr * dr) - 0.0161 * Math.sin(2 * Mpr * dr);
  C1 += 0.0104 * Math.sin(2 * F * dr);
  C1 -= 0.0051 * Math.sin((M + Mpr) * dr);
  C1 -= 0.0074 * Math.sin((M - Mpr) * dr);
  C1 += 0.0004 * Math.sin((2 * F + M) * dr);
  C1 -= 0.0004 * Math.sin((2 * F - M) * dr);
  C1 -= 0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 += 0.01 * Math.sin((2 * F - Mpr) * dr);
  C1 += 0.0005 * Math.sin((M + 2 * Mpr) * dr);

  const deltat =
    k < -11
      ? 0.001 * (T * T + 20 * T + 20)
      : k > 0
      ? 0.00001 * (T * T + Math.pow(T + 0.5, 2))
      : 0;

  const JdNew = Jd1 + C1 - deltat;
  return Math.floor(JdNew + 0.5 + timeZone / 24);
}

function getSunLongitude(jdn: number, timeZone = 7): number {
  const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;

  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  const DL =
    (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(M * dr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr) +
    0.00029 * Math.sin(3 * M * dr);
  let L = L0 + DL;
  L = L % 360;
  if (L < 0) L += 360;
  return Math.floor(L / 30);
}

function getLunarMonth11(yyyy: number, timeZone = 7): number {
  const off = jdFromDate(31, 12, yyyy) - 2415021;
  const k = Math.floor(off / 29.5305888);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

export function getCanChiYear(year: number): string {
  const can = CAN[(year + 6) % 10];
  const chi = CHI[(year + 8) % 12];
  return `${can} ${chi}`;
}

export function convertSolarToLunar(
  dd: number,
  mm: number,
  yyyy: number,
  timeZone = 7,
): LunarDate {
  const dayJd = jdFromDate(dd, mm, yyyy);
  let k = Math.floor((dayJd - 2415021) / 29.5305888);

  let lastNewMoon = getNewMoonDay(k, timeZone);
  if (lastNewMoon > dayJd) {
    k -= 1;
    lastNewMoon = getNewMoonDay(k, timeZone);
  }

  let a11 = getLunarMonth11(yyyy, timeZone);
  let b11 = a11;
  let lunarYear = yyyy;

  if (dayJd >= a11) {
    b11 = getLunarMonth11(yyyy + 1, timeZone);
  } else {
    lunarYear = yyyy - 1;
    a11 = getLunarMonth11(yyyy - 1, timeZone);
  }

  const lunarDay = dayJd - lastNewMoon + 1;
  const diff = Math.floor((lastNewMoon - a11) / 29);

  let isLeap = false;
  let lunarMonth = diff + 11;

  if (b11 - a11 > 365) {
    const leapMonthDiff = findLeapMonth(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        isLeap = true;
      }
    }
  }

  if (lunarMonth > 12) {
    lunarMonth -= 12;
  }

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeap,
    canChiYear: getCanChiYear(lunarYear),
  };
}

function findLeapMonth(a11: number, timeZone = 7): number {
  let k = Math.floor((a11 - 2415021) / 29.5305888) + 1;
  let lastSunLong = getSunLongitude(getNewMoonDay(k, timeZone), timeZone);
  let i = 1;

  while (i <= 14) {
    const nm = getNewMoonDay(k + i, timeZone);
    const sunLong = getSunLongitude(nm, timeZone);
    if (sunLong === lastSunLong) {
      return i;
    }
    lastSunLong = sunLong;
    i += 1;
  }

  return 0;
}

export function formatLunarDate(date: Date, showCanChi = true): string {
  const lunar = convertSolarToLunar(
    date.getDate(),
    date.getMonth() + 1,
    date.getFullYear(),
  );

  const dayStr = String(lunar.day).padStart(2, "0");
  const monthStr = String(lunar.month).padStart(2, "0");
  const leapStr = lunar.isLeap ? " (Nhuận)" : "";
  const canChiStr = showCanChi ? ` (${lunar.canChiYear})` : "";

  return `${dayStr}/${monthStr}${leapStr} Âm lịch${canChiStr}`;
}

