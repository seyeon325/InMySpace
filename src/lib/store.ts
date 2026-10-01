"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addDays, sleepMinutes, todayKey } from "./date";

export type Category = "생활" | "건강" | "지식" | "힐링" | "동기부여" | "기타";

export const CATEGORY_STYLE: Record<Category, { color: string; emoji?: string }> = {
  생활: { color: "#9aa3c7" },
  건강: { color: "#53cf91" },
  지식: { color: "#59baeb" },
  힐링: { color: "#ffc000" },
  동기부여: { color: "#ff8fb1" },
  기타: { color: "#a58cff" },
};

export type Todo = {
  id: string;
  title: string;
  date: string;
  time: string;
  done: boolean;
};

export type Routine = {
  id: string;
  title: string;
  time: string;
  category: Category;
  doneDates: string[];
};

export type DiaryEntry = {
  date: string;
  text: string;
  /** 1(힘듦) ~ 5(아주 좋음) */
  mood: number;
};

export type SleepLog = {
  date: string;
  bedtime: string;
  wake: string;
  /** 잠들기까지 걸린 분 */
  latency: number;
  tossing: number;
  tags: string[];
  dreamMemo: string;
  dayNote: string;
};

export type Bottle = { id: string; name: string; notes: string[] };

type State = {
  userName: string;
  theme: "light" | "dark";
  todos: Todo[];
  routines: Routine[];
  diary: DiaryEntry[];
  /** 날짜별 감정 온도 0~100 */
  emotionTemp: Record<string, number>;
  moodNotes: { date: string; text: string }[];
  released: string[];
  bottles: Bottle[];
  sleep: SleepLog[];
  mindExercises: number;
  stella: number;

  setTheme: (t: "light" | "dark") => void;
  addTodo: (title: string, time: string, date?: string) => void;
  toggleTodo: (id: string) => void;
  postponeTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  addRoutine: (title: string, time: string, category: Category) => void;
  toggleRoutine: (id: string, date: string) => void;
  removeRoutine: (id: string) => void;
  saveDiary: (entry: DiaryEntry) => void;
  setEmotionTemp: (date: string, value: number) => void;
  addMoodNote: (text: string) => void;
  release: (text: string) => void;
  addBottle: (name: string) => void;
  addToBottle: (id: string, note: string) => void;
  saveSleep: (log: SleepLog) => void;
  completeMindExercise: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

function seed() {
  const t = todayKey();
  const routine = (title: string, time: string, category: Category, doneToday: boolean): Routine => ({
    id: uid(),
    title,
    time,
    category,
    doneDates: [addDays(t, -1), addDays(t, -2), ...(doneToday ? [t] : [])],
  });
  const sleep = (offset: number, bedtime: string, wake: string, latency: number): SleepLog => ({
    date: addDays(t, offset),
    bedtime,
    wake,
    latency,
    tossing: 6,
    tags: [],
    dreamMemo: "",
    dayNote: "",
  });
  return {
    todos: [
      { id: uid(), title: "봉사활동 보고서 작성", date: t, time: "14:00", done: true },
      { id: uid(), title: "정보인터랙션디자인기초 12주차 과제", date: t, time: "20:00", done: false },
      { id: uid(), title: "봉사활동 회의록 작성", date: addDays(t, -1), time: "18:00", done: false },
      { id: uid(), title: "독서 감상문 쓰기", date: addDays(t, -5), time: "21:00", done: false },
      { id: uid(), title: "책상 정리", date: addDays(t, -5), time: "10:00", done: false },
      { id: uid(), title: "그림책 디자인 작업 마무리", date: addDays(t, -5), time: "16:00", done: false },
      { id: uid(), title: "휴대폰 금액 납부", date: addDays(t, -5), time: "12:00", done: false },
    ],
    routines: [
      routine("약/영양제 챙겨먹기", "8:00", "건강", true),
      routine("웨이트 트레이닝", "16:00", "건강", true),
      routine("9시 이후 금식", "21:00", "건강", true),
      routine("영단어 암기", "13:00", "지식", true),
      routine("10페이지 독서", "19:00", "지식", false),
      routine("픽셀아트 찍기", "13:00", "힐링", false),
      routine("영화 한 편 보기", "19:00", "힐링", false),
    ],
    diary: [
      { date: addDays(t, -3), text: "오랜만에 친구를 만나서 기분이 좋았다.", mood: 4 },
      { date: addDays(t, -1), text: "과제가 많아서 조금 지쳤지만 잘 마무리했다.", mood: 3 },
      {
        date: t,
        text: "감정 기복이 거의 없어서 안정적으로 하루를 보냈다.\n특별한 일은 없었지만 작은 루틴들이 마음을 편하게 해줬다.",
        mood: 3,
      },
    ],
    emotionTemp: {
      [addDays(t, -6)]: 45,
      [addDays(t, -5)]: 55,
      [addDays(t, -4)]: 50,
      [addDays(t, -3)]: 70,
      [addDays(t, -2)]: 60,
      [addDays(t, -1)]: 72,
      [t]: 80,
    },
    sleep: [
      sleep(-6, "00:40", "07:20", 25),
      sleep(-5, "01:10", "07:00", 30),
      sleep(-4, "23:50", "07:30", 15),
      sleep(-3, "00:30", "08:00", 20),
      sleep(-2, "01:20", "06:40", 35),
      sleep(-1, "00:20", "07:50", 20),
      sleep(0, "01:10", "08:30", 20),
    ],
  };
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      userName: "송보람",
      theme: "light",
      ...seed(),
      moodNotes: [],
      released: [],
      bottles: [
        { id: "calm", name: "안정의 파동", notes: [] },
        { id: "night", name: "조용한 밤", notes: [] },
        { id: "joy", name: "기쁨 조각", notes: [] },
      ],
      mindExercises: 4,
      stella: 500,

      setTheme: (theme) => set({ theme }),
      addTodo: (title, time, date = todayKey()) =>
        set((s) => ({ todos: [...s.todos, { id: uid(), title, time, date, done: false }] })),
      toggleTodo: (id) =>
        set((s) => {
          const todos = s.todos.map((x) => (x.id === id ? { ...x, done: !x.done } : x));
          const wasDone = s.todos.find((x) => x.id === id)?.done;
          return { todos, stella: s.stella + (wasDone ? -10 : 10) };
        }),
      postponeTodo: (id) =>
        set((s) => ({ todos: s.todos.map((x) => (x.id === id ? { ...x, date: addDays(todayKey(), 1) } : x)) })),
      removeTodo: (id) => set((s) => ({ todos: s.todos.filter((x) => x.id !== id) })),
      addRoutine: (title, time, category) =>
        set((s) => ({ routines: [...s.routines, { id: uid(), title, time, category, doneDates: [] }] })),
      toggleRoutine: (id, date) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id !== id
              ? r
              : {
                  ...r,
                  doneDates: r.doneDates.includes(date)
                    ? r.doneDates.filter((d) => d !== date)
                    : [...r.doneDates, date],
                },
          ),
        })),
      removeRoutine: (id) => set((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),
      saveDiary: (entry) =>
        set((s) => ({ diary: [...s.diary.filter((d) => d.date !== entry.date), entry], stella: s.stella + 5 })),
      setEmotionTemp: (date, value) => set((s) => ({ emotionTemp: { ...s.emotionTemp, [date]: value } })),
      addMoodNote: (text) => set((s) => ({ moodNotes: [...s.moodNotes, { date: todayKey(), text }] })),
      release: (text) => set((s) => ({ released: [...s.released, text] })),
      addBottle: (name) => set((s) => ({ bottles: [...s.bottles, { id: uid(), name, notes: [] }] })),
      addToBottle: (id, note) =>
        set((s) => ({ bottles: s.bottles.map((b) => (b.id === id ? { ...b, notes: [...b.notes, note] } : b)) })),
      saveSleep: (log) => set((s) => ({ sleep: [...s.sleep.filter((l) => l.date !== log.date), log] })),
      completeMindExercise: () => set((s) => ({ mindExercises: s.mindExercises + 1, stella: s.stella + 5 })),
    }),
    { name: "inmyspace", version: 1 },
  ),
);

/* ---------- 파생 값 ---------- */

export function sleepScore(log: SleepLog | undefined): number {
  if (!log) return 0;
  const total = sleepMinutes(log.bedtime, log.wake);
  const durationScore = Math.max(0, 100 - Math.abs(total - 480) / 3);
  const latencyPenalty = Math.max(0, log.latency - 15) * 0.6;
  return Math.round(Math.max(0, Math.min(100, durationScore - latencyPenalty - log.tossing)));
}

export function routineRate(routines: Routine[], date: string) {
  const done = routines.filter((r) => r.doneDates.includes(date)).length;
  return { done, total: routines.length };
}

export function moodScore(temp: number | undefined): number {
  return Math.round((temp ?? 50) / 10);
}

export const MOOD_LABELS = ["", "힘듦", "우울", "평범", "좋음", "아주 좋음"];

export function emotionLabel(temp: number): string {
  if (temp >= 80) return "반짝이는 초신성";
  if (temp >= 60) return "따뜻한 별빛";
  if (temp >= 40) return "잔잔한 궤도";
  if (temp >= 20) return "흐린 성운";
  return "고요한 블랙홀";
}
