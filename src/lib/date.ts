export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
export const WEEK_MON_FIRST = ["월", "화", "수", "목", "금", "토", "일"] as const;

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function diffDays(a: string, b: string): number {
  return Math.round((fromKey(a).getTime() - fromKey(b).getTime()) / 86_400_000);
}

/** 월요일 시작 주의 날짜 7개 */
export function weekOf(key: string): string[] {
  const d = fromKey(key);
  const offset = (d.getDay() + 6) % 7;
  const monday = addDays(key, -offset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** 월요일 시작 달력. 앞쪽 빈칸은 null */
export function monthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let i = 1; i <= days; i++) cells.push(toKey(new Date(year, month, i)));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function formatMonthDay(key: string): string {
  const d = fromKey(key);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 · ${WEEKDAYS[d.getDay()]}요일`;
}

export function formatLong(key: string): string {
  const d = fromKey(key);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function minutesToText(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m}분`;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

/** "23:30" 형식 두 시각 사이 분 (자정 넘김 처리) */
export function sleepMinutes(bed: string, wake: string): number {
  const [bh, bm] = bed.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  let diff = wh * 60 + wm - (bh * 60 + bm);
  if (diff <= 0) diff += 24 * 60;
  return diff;
}
