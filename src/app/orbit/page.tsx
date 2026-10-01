"use client";

import { useEffect, useMemo, useState } from "react";
import { ClientOnly } from "@/components/ClientOnly";
import { Px } from "@/components/Px";
import {
  Container,
  Modal,
  PageIntro,
  Pager,
  SectionTitle,
  inputClass,
  outlineBtn,
  primaryBtn,
} from "@/components/ui";
import { A } from "@/lib/assets";
import { WEEK_MON_FIRST, diffDays, formatLong, fromKey, todayKey, weekOf, addDays } from "@/lib/date";
import { CATEGORY_STYLE, type Category, type Routine, useStore } from "@/lib/store";

const CATEGORIES = Object.keys(CATEGORY_STYLE) as Category[];
const CATEGORY_EMOJI: Partial<Record<Category, string>> = {
  건강: A.emojiSunglasses,
  지식: A.emojiBook,
  힐링: A.emojiHearts,
};

export default function OrbitRoom() {
  return (
    <>
      <PageIntro
        title="궤도 관리실"
        lead={
          <>
            오늘 우주선의 궤도는
            <br />
            안정적인가요?
          </>
        }
        desc="나만의 루틴, 일정 관리하기"
      />
      <ClientOnly>
        <OrbitBody />
      </ClientOnly>
    </>
  );
}

function OrbitBody() {
  const today = todayKey();
  const [selected, setSelected] = useState(today);
  const [dialog, setDialog] = useState<null | "todo" | "routine">(() =>
    window.location.hash === "#add" ? "todo" : null,
  );

  return (
    <>
      <WeekPlanner selected={selected} onSelect={setSelected} onAdd={setDialog} />
      <TodoList date={selected} />
      <RoutineBoard date={selected} onAdd={() => setDialog("routine")} />
      <OverdueTodos />
      <PopularRoutines />
      <Tools />
      <AddTodoDialog key={selected} open={dialog === "todo"} date={selected} onClose={() => setDialog(null)} />
      <AddRoutineDialog open={dialog === "routine"} onClose={() => setDialog(null)} />
    </>
  );
}

function WeekPlanner({
  selected,
  onSelect,
  onAdd,
}: {
  selected: string;
  onSelect: (d: string) => void;
  onAdd: (k: "todo" | "routine") => void;
}) {
  const today = todayKey();
  const [anchor, setAnchor] = useState(today);
  const [menu, setMenu] = useState(false);
  const week = weekOf(anchor);
  const start = useStore((s) => s.todos.reduce((min, t) => (t.date < min ? t.date : min), today));
  const dPlus = diffDays(today, start) + 1;
  const d = fromKey(anchor);

  return (
    <Container className="mt-14 md:mt-[84px]">
      <div className="flex flex-wrap items-end gap-3 md:gap-6">
        <div>
          <p className="text-xl font-semibold">오늘</p>
          <p className="text-2xl font-bold">
            {d.getFullYear()}년 {d.getMonth() + 1}월
          </p>
        </div>
        <div className="card flex h-11 min-w-0 flex-1 items-center gap-3 px-3 md:max-w-[650px]">
          <span className="shrink-0 rounded-2xl bg-[#f9b8ff] px-2 text-base font-medium text-dark-2">D+{dPlus}</span>
          <span className="truncate font-bold text-ink-soft">인마이스페이스 시작!</span>
        </div>
      </div>

      <div className="relative mt-8 md:px-[60px]">
        <div className="rounded-[32px] bg-light-1 px-2 py-3 dark:bg-surface-muted md:px-9">
          <div className="flex items-center gap-1">
            <button type="button" aria-label="이전 주" onClick={() => setAnchor(addDays(anchor, -7))}>
              <Px src={A.arrowPrev} className="size-6" />
            </button>
            <ul className="grid flex-1 grid-cols-7">
              {week.map((day, i) => {
                const isSel = day === selected;
                const isToday = day === today;
                const past = day < today;
                return (
                  <li key={day} className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => onSelect(day)}
                      className={`flex w-full max-w-[92px] flex-col items-center gap-2 rounded-[32px] py-3 transition-colors ${
                        isSel ? "bg-primary-neutral" : ""
                      }`}
                    >
                      <span className={`text-base font-bold ${past ? "text-label-4" : "text-ink"}`}>{WEEK_MON_FIRST[i]}</span>
                      <span
                        className={`grid size-10 place-items-center rounded-full text-base md:size-[68px] ${
                          isToday
                            ? "border-4 border-primary-strong border-l-primary-neutral bg-surface font-bold"
                            : `border bg-surface ${past ? "border-label-4 text-label-4" : "border-label-4 text-dark-2 dark:text-ink"}`
                        }`}
                      >
                        {fromKey(day).getDate()}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button type="button" aria-label="다음 주" onClick={() => setAnchor(addDays(anchor, 7))}>
              <Px src={A.arrowNext} className="size-6" />
            </button>
          </div>
        </div>

        <div className="absolute -top-16 right-0 md:top-1/2 md:-right-6 md:-translate-y-1/2">
          <button type="button" aria-label="추가하기" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <Px src={A.fabPlus} className={`size-14 transition-transform md:size-20 ${menu ? "rotate-45" : ""}`} />
          </button>
          {menu && (
            <div className="absolute top-full right-0 z-10 mt-2 flex flex-col gap-3">
              {(
                [
                  ["routine", "루틴 추가하기"],
                  ["todo", "할 일 추가하기"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    onAdd(k);
                    setMenu(false);
                  }}
                  className="h-[35px] w-[150px] rounded-[32px] border border-primary-strong bg-surface text-sm font-bold shadow"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

function Check({ checked, onChange, color = "var(--primary-strong)", label }: { checked: boolean; onChange: () => void; color?: string; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="grid size-[26px] shrink-0 place-items-center rounded-full border-2 transition-colors"
      style={{ borderColor: color, background: checked ? color : "transparent" }}
    >
      {checked && (
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
          <path d="M3 8.5l3 3 7-7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function TodoList({ date }: { date: string }) {
  const todos = useStore((s) => s.todos);
  const { toggleTodo, removeTodo, addTodo } = useStore();
  const list = todos.filter((t) => t.date === date).sort((a, b) => a.time.localeCompare(b.time));
  const done = list.filter((t) => t.done).length;
  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState("");

  return (
    <Container className="mt-10">
      <div id="todo" className="flex scroll-mt-28 items-center gap-2 md:px-[30px]">
        <svg viewBox="0 0 24 24" className="size-6 text-primary-strong" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M7.5 12.5l3 3 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <h2 className="text-xl font-bold">{date === todayKey() ? "오늘의 할 일" : `${fromKey(date).getDate()}일의 할 일`}</h2>
        <span className="text-2xl font-bold text-primary-strong">
          {done}/{list.length}
        </span>
        <button type="button" onClick={() => setOpen(!open)} className="ml-auto text-primary-strong" aria-label={open ? "접기" : "펼치기"}>
          {open ? "▲" : "▼"}
        </button>
      </div>

      {open && (
        <div className="card-lg mt-5 px-5 py-5 md:px-[58px] md:py-[49px]">
          <ul>
            {list.map((t) => (
              <li key={t.id} className="flex items-center gap-3 border-b-2 border-light-3 py-3">
                <Check checked={t.done} onChange={() => toggleTodo(t.id)} label={t.title} />
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${t.done ? "text-label-4 line-through" : ""}`}>{t.title}</p>
                  <p className="text-xs text-label-4">TO DO · ⏰ {t.time}</p>
                </div>
                <button type="button" onClick={() => removeTodo(t.id)} className="px-2 text-label-4 hover:text-[#ff4242]" aria-label={`${t.title} 삭제`}>
                  ⋮
                </button>
              </li>
            ))}
          </ul>
          <form
            className="flex items-center gap-3 border-b-2 border-light-3 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              addTodo(title.trim(), "23:59", date);
              setTitle("");
            }}
          >
            <span className="grid size-[26px] place-items-center rounded-full border-2 border-label-4 text-label-4">+</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="할 일 추가하기"
              className="flex-1 bg-transparent font-medium outline-none placeholder:text-label-4"
            />
          </form>
        </div>
      )}
    </Container>
  );
}

function RoutineBoard({ date, onAdd }: { date: string; onAdd: () => void }) {
  const routines = useStore((s) => s.routines);
  const toggleRoutine = useStore((s) => s.toggleRoutine);
  const removeRoutine = useStore((s) => s.removeRoutine);
  const [status, setStatus] = useState<"all" | "todo" | "done">("all");
  const [cats, setCats] = useState<Category[]>([]);

  const isDone = (r: Routine) => r.doneDates.includes(date);
  const counts = {
    all: routines.length,
    todo: routines.filter((r) => !isDone(r)).length,
    done: routines.filter(isDone).length,
  };
  const visible = routines.filter(
    (r) =>
      (status === "all" || (status === "done" ? isDone(r) : !isDone(r))) &&
      (cats.length === 0 || cats.includes(r.category)),
  );
  const groups = CATEGORIES.map((c) => ({ c, items: visible.filter((r) => r.category === c) })).filter((g) => g.items.length);

  return (
    <Container className="mt-16 md:mt-[100px]">
      <SectionTitle id="routine" info="카테고리별로 오늘의 루틴을 체크해 보세요.">
        오늘의 루틴 확인하기
      </SectionTitle>

      <div className="flex flex-wrap gap-2.5">
        {(
          [
            ["all", "전체"],
            ["todo", "미완료"],
            ["done", "완료"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setStatus(k)}
            className={`flex h-8 items-center gap-1.5 rounded-2xl border-2 px-3 font-medium ${
              status === k ? "border-primary-strong bg-primary-strong text-white" : "border-[#c8c8c8] bg-surface"
            }`}
          >
            {label} <span>{counts[k]}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {CATEGORIES.map((c) => {
          const on = cats.includes(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCats(on ? cats.filter((x) => x !== c) : [...cats, c])}
              className="h-[23px] rounded-2xl px-3 text-sm font-medium"
              style={{ background: on ? CATEGORY_STYLE[c].color : "#ededed", color: on ? "#fff" : "#47484c" }}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {groups.map(({ c, items }) => {
          const color = CATEGORY_STYLE[c].color;
          const done = routines.filter((r) => r.category === c && isDone(r)).length;
          const total = routines.filter((r) => r.category === c).length;
          return (
            <section key={c} className="min-h-[345px] rounded-[32px] border-[1.5px] bg-surface" style={{ borderColor: color }}>
              <header className="flex items-center gap-2 border-b-[1.5px] px-[45px] py-[14px]" style={{ borderColor: color }}>
                {CATEGORY_EMOJI[c] && <Px src={CATEGORY_EMOJI[c]} className="size-6" />}
                <span className="text-xl font-bold">{c}</span>
                <span className="text-2xl font-bold" style={{ color }}>
                  {done}/{total}
                </span>
              </header>
              <ul className="px-7 py-3">
                {items.map((r) => (
                  <li key={r.id} className="relative flex items-center gap-3 border-b-[1.5px] py-2 pl-5" style={{ borderColor: color }}>
                    <span className="absolute top-2 left-0 h-[44px] w-1 rounded-xl" style={{ background: color }} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{r.title}</p>
                      <p className="text-xs text-label-4">루틴 · ⏰ {r.time}</p>
                    </div>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isDone(r)}
                      aria-label={r.title}
                      onClick={() => toggleRoutine(r.id, date)}
                      className="grid size-[26px] place-items-center rounded-md border-2"
                      style={{ borderColor: color, background: isDone(r) ? color : "transparent" }}
                    >
                      {isDone(r) && (
                        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
                          <path d="M3 8.5l3 3 7-7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
                        </svg>
                      )}
                    </button>
                    <button type="button" onClick={() => removeRoutine(r.id)} className="text-label-4 hover:text-[#ff4242]" aria-label={`${r.title} 삭제`}>
                      ⋮
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <button
          type="button"
          onClick={onAdd}
          className="grid min-h-[160px] place-items-center rounded-[32px] border-[1.5px] border-dashed border-primary text-lg font-bold text-primary-strong"
        >
          + 루틴 추가하기
        </button>
      </div>
    </Container>
  );
}

function OverdueTodos() {
  const today = todayKey();
  const { todos, postponeTodo, removeTodo, toggleTodo } = useStore();
  const overdue = todos.filter((t) => !t.done && t.date < today).sort((a, b) => b.date.localeCompare(a.date));
  const [detail, setDetail] = useState<string | null>(null);
  const item = todos.find((t) => t.id === detail);

  if (!overdue.length) return null;

  // 같은 D+N 끼리 묶는다
  const groups = overdue.reduce<Record<number, typeof overdue>>((acc, t) => {
    const n = diffDays(today, t.date);
    (acc[n] ??= []).push(t);
    return acc;
  }, {});

  return (
    <Container className="mt-16 md:mt-[100px]">
      <SectionTitle info="기한이 지난 할 일을 미루거나 정리해 보세요.">
        <span>
          완료하지 않은 TO DO가
          <br />
          <span className="text-primary-strong">{overdue.length}개</span> 있습니다
        </span>
      </SectionTitle>

      <div className="flex flex-col gap-5">
        {Object.entries(groups)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([n, items]) => (
            <ul key={n} className="card-lg divide-y-[1.5px] divide-primary-strong overflow-hidden">
              {items.map((t, i) => (
                <li key={t.id} className="flex flex-wrap items-center gap-3 px-5 py-3 md:px-[50px]">
                  <div className="min-w-0 flex-1">
                    {i === 0 && <p className="font-dot text-[22px] text-[#ff4242]">D + {n}</p>}
                    <p className="font-bold">{t.title}</p>
                    <p className="text-xs text-[#ff8080]">⏱ {formatLong(t.date)}</p>
                  </div>
                  <button type="button" onClick={() => postponeTodo(t.id)} className="inline-flex h-[35px] w-[110px] items-center justify-center rounded-lg border border-label-4 text-sm font-bold text-label-4 md:w-[150px]">
                    미루기
                  </button>
                  <button type="button" onClick={() => setDetail(t.id)} className="inline-flex h-[35px] w-[110px] items-center justify-center rounded-lg border border-primary-strong text-sm font-bold md:w-[150px]">
                    자세히 보기
                  </button>
                  <button type="button" onClick={() => removeTodo(t.id)} aria-label={`${t.title} 삭제`} className="text-label-4 hover:text-[#ff4242]">
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          ))}
      </div>

      <Modal open={!!item} onClose={() => setDetail(null)} title="할 일 자세히 보기">
        {item && (
          <div className="space-y-2">
            <p className="text-lg font-bold">{item.title}</p>
            <p className="text-sm text-ink-muted">
              {formatLong(item.date)} · {item.time}
            </p>
            <div className="flex gap-2 pt-3">
              <button
                type="button"
                className={primaryBtn}
                onClick={() => {
                  toggleTodo(item.id);
                  setDetail(null);
                }}
              >
                완료하기
              </button>
              <button
                type="button"
                className={outlineBtn}
                onClick={() => {
                  postponeTodo(item.id);
                  setDetail(null);
                }}
              >
                내일로 미루기
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Container>
  );
}

const POPULAR: { title: string; desc: string; icon: string; category: Category; count: string; time: string }[] = [
  { title: "기상", desc: "기상 목표에 맞게 일어나기", icon: A.emojiYawn, category: "생활", count: "15K", time: "7:00" },
  { title: "영화 한편 보기", desc: "장르에 상관없이 영화 한 편 보고 한줄 감상 남기기", icon: A.emojiCamera, category: "힐링", count: "12K", time: "20:00" },
  { title: "물 2L 마시기", desc: "하루 동안 물을 나눠서 2L 마시기", icon: A.emojiSunglasses, category: "건강", count: "9K", time: "9:00" },
  { title: "책 20쪽 읽기", desc: "자기 전에 책 20쪽 읽고 한 줄 남기기", icon: A.emojiBook, category: "지식", count: "8K", time: "22:00" },
];

function PopularRoutines() {
  const addRoutine = useStore((s) => s.addRoutine);
  const routines = useStore((s) => s.routines);
  const [cat, setCat] = useState<Category | "전체">("전체");
  const [page, setPage] = useState(0);
  const list = useMemo(() => POPULAR.filter((p) => cat === "전체" || p.category === cat), [cat]);
  const pages = Math.max(1, Math.ceil(list.length / 2));
  const shown = list.slice(page * 2, page * 2 + 2);

  return (
    <Container className="mt-16 md:mt-[100px]">
      <SectionTitle info="다른 사람들이 많이 하는 루틴이에요. 눌러서 내 루틴에 추가해요.">
        <span>
          실시간 인기 루틴
          <br />
          살펴보기
        </span>
      </SectionTitle>
      <div className="flex flex-wrap gap-2">
        {(["전체", "건강", "지식", "힐링", "동기부여", "기타"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCat(c);
              setPage(0);
            }}
            className={`rounded-2xl px-2.5 text-sm font-medium text-white ${cat === c ? "bg-primary-strong" : "bg-[#c8c8c8]"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {shown.map((p) => {
          const added = routines.some((r) => r.title === p.title);
          return (
            <article key={p.title} className="card flex min-h-[200px] flex-col p-8">
              <Px src={p.icon} className="size-[35px]" />
              <p className="mt-2 text-xl font-bold">{p.title}</p>
              <p className="font-medium">{p.desc}</p>
              <div className="mt-auto flex items-center gap-2 pt-4">
                <span className="rounded-2xl bg-[#ffa04d] px-2.5 text-sm font-medium text-white">HOT</span>
                <span className="rounded-2xl bg-[#c8c8c8] px-2.5 text-sm font-medium text-label-4">👥 {p.count}</span>
                <button
                  type="button"
                  disabled={added}
                  onClick={() => addRoutine(p.title, p.time, p.category)}
                  className="ml-auto text-sm font-bold text-primary-strong disabled:text-label-4"
                >
                  {added ? "추가됨" : "+ 내 루틴에 추가"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <Pager count={pages} index={page} onChange={setPage} />
    </Container>
  );
}

function Tools() {
  const [timer, setTimer] = useState(false);
  const [memo, setMemo] = useState(false);

  return (
    <Container className="mt-16 md:mt-[100px]">
      <SectionTitle id="tools" info="자주 쓰는 도구를 바로 열 수 있어요.">
        <span>
          작업 도구
          <br />
          바로가기
        </span>
      </SectionTitle>
      <div className="grid grid-cols-3 gap-3 md:mx-auto md:max-w-[700px] md:gap-[33px]">
        {[
          { label: "오늘의 할 일", icon: A.favTodo, onClick: () => document.getElementById("todo")?.scrollIntoView({ behavior: "smooth" }) },
          { label: "집중 타이머", icon: A.favTimer, onClick: () => setTimer(true) },
          { label: "메모", icon: A.favMemo, onClick: () => setMemo(true) },
        ].map((t) => (
          <button key={t.label} type="button" onClick={t.onClick} className="card flex aspect-square flex-col items-center justify-center gap-3 transition-transform hover:-translate-y-1">
            <Px src={t.icon} className="size-14 md:size-[100px]" />
            <span className="font-pixel text-sm md:text-xl">{t.label}</span>
          </button>
        ))}
      </div>
      <FocusTimer open={timer} onClose={() => setTimer(false)} />
      <QuickMemo open={memo} onClose={() => setMemo(false)} />
    </Container>
  );
}

function FocusTimer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [minutes, setMinutes] = useState(25);
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  const finished = running && left === 0;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <Modal open={open} onClose={onClose} title="집중 타이머">
      <p className="text-center font-dot text-6xl tabular-nums">
        {mm}:{ss}
      </p>
      {finished && <p className="mt-2 text-center font-bold text-primary-strong">수고했어요! 잠깐 쉬어가요.</p>}
      <div className="mt-4 flex justify-center gap-2">
        {[15, 25, 50].map((m) => (
          <button
            key={m}
            type="button"
            className={m === minutes ? primaryBtn : outlineBtn}
            onClick={() => {
              setMinutes(m);
              setLeft(m * 60);
              setRunning(false);
            }}
          >
            {m}분
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        <button type="button" className={primaryBtn} onClick={() => setRunning(!running)}>
          {running ? "일시정지" : "시작"}
        </button>
        <button
          type="button"
          className={outlineBtn}
          onClick={() => {
            setRunning(false);
            setLeft(minutes * 60);
          }}
        >
          초기화
        </button>
      </div>
    </Modal>
  );
}

function QuickMemo({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem("inmyspace-memo") ?? "";
    } catch {
      return "";
    }
  });
  return (
    <Modal open={open} onClose={onClose} title="메모">
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            localStorage.setItem("inmyspace-memo", e.target.value);
          } catch {}
        }}
        rows={8}
        placeholder="떠오르는 생각을 적어 두세요. 자동으로 저장돼요."
        className={`${inputClass} h-auto py-2`}
      />
    </Modal>
  );
}

function AddTodoDialog({ open, date, onClose }: { open: boolean; date: string; onClose: () => void }) {
  const addTodo = useStore((s) => s.addTodo);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [day, setDay] = useState(date);

  return (
    <Modal open={open} onClose={onClose} title="할 일 추가하기">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          addTodo(title.trim(), time, day);
          setTitle("");
          onClose();
        }}
      >
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="무엇을 해야 하나요?" className={inputClass} />
        <div className="flex gap-2">
          <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className={inputClass} />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
        </div>
        <button type="submit" className={`${primaryBtn} w-full`} disabled={!title.trim()}>
          추가
        </button>
      </form>
    </Modal>
  );
}

function AddRoutineDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addRoutine = useStore((s) => s.addRoutine);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("08:00");
  const [category, setCategory] = useState<Category>("건강");

  return (
    <Modal open={open} onClose={onClose} title="루틴 추가하기">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          addRoutine(title.trim(), time.replace(/^0/, ""), category);
          setTitle("");
          onClose();
        }}
      >
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="매일 반복할 루틴" className={inputClass} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className="h-7 rounded-2xl px-3 text-sm font-medium"
              style={{ background: c === category ? CATEGORY_STYLE[c].color : "#ededed", color: c === category ? "#fff" : "#47484c" }}
            >
              {c}
            </button>
          ))}
        </div>
        <button type="submit" className={`${primaryBtn} w-full`} disabled={!title.trim()}>
          추가
        </button>
      </form>
    </Modal>
  );
}
