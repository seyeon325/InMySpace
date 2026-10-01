"use client";

import { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ClientOnly";
import { Px } from "@/components/Px";
import { Container, Modal, PageIntro, SectionTitle, inputClass, outlineBtn, primaryBtn } from "@/components/ui";
import { A } from "@/lib/assets";
import { WEEKDAYS, WEEK_MON_FIRST, fromKey, monthGrid, todayKey, weekOf } from "@/lib/date";
import { MOOD_LABELS, emotionLabel, useStore } from "@/lib/store";

export default function MindStation() {
  return (
    <>
      <PageIntro
        title="마음 정류장"
        lead={
          <>
            오늘 방문할
            <br />
            마음 정류장은 어디인가요?
          </>
        }
        desc="감정 일기 · 마음 챙김"
      />
      <ClientOnly>
        <DiaryCalendar />
        <MindCards />
        <MindExercises />
      </ClientOnly>
    </>
  );
}

const MOOD_COLORS = ["", "#7c7f99", "#9fb0ff", "#b9c4ff", "#c7b6ff", "#ffb8ec"];

function DiaryCalendar() {
  const today = todayKey();
  const diary = useStore((s) => s.diary);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [view, setView] = useState<"calendar" | "timeline">("calendar");
  const [selected, setSelected] = useState(today);
  const [editing, setEditing] = useState(false);
  const entry = diary.find((d) => d.date === selected);
  const cells = monthGrid(month.y, month.m);
  const shift = (n: number) =>
    setMonth(({ y, m }) => {
      const d = new Date(y, m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  const sel = fromKey(selected);

  return (
    <Container className="mt-16 md:mt-[100px]">
      <SectionTitle info="날짜를 눌러 그날의 일기를 쓰거나 다시 볼 수 있어요.">오늘의 일기 작성하기</SectionTitle>

      <div className="card-lg mx-auto max-w-[800px] px-4 py-8 md:px-[30px] md:py-10">
        <div className="flex items-center justify-center gap-6">
          <button type="button" aria-label="이전 달" onClick={() => shift(-1)}>
            <Px src={A.arrowPrev} className="size-7" />
          </button>
          <p className="text-2xl font-bold">
            {month.y}. {String(month.m + 1).padStart(2, "0")}
          </p>
          <button type="button" aria-label="다음 달" onClick={() => shift(1)}>
            <Px src={A.arrowNext} className="size-7" />
          </button>
        </div>

        <div className="mx-auto mt-5 grid h-[30px] w-full max-w-[373px] grid-cols-2 rounded-2xl bg-light-2 p-1">
          {(
            [
              ["calendar", "캘린더"],
              ["timeline", "타임라인"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setView(k)}
              className={`rounded-2xl text-sm font-bold ${view === k ? "border-[1.5px] border-primary-strong bg-primary text-white" : "text-label-4"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {view === "calendar" ? (
          <div className="mx-auto mt-8 max-w-[572px]">
            <div className="grid grid-cols-7 text-center text-lg font-bold md:text-xl">
              {WEEK_MON_FIRST.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-7 gap-y-3">
              {cells.map((key, i) => {
                if (!key) return <span key={i} />;
                const has = diary.find((d) => d.date === key);
                const isToday = key === today;
                return (
                  <button key={key} type="button" onClick={() => setSelected(key)} className="flex h-[66px] flex-col items-center gap-0.5">
                    <span
                      className={`grid size-[30px] place-items-center rounded-full font-medium text-label-3 dark:text-ink ${
                        isToday ? "border-2 border-dashed border-primary-strong" : "bg-primary-neutral"
                      } ${key === selected ? "ring-2 ring-primary-strong ring-offset-2 ring-offset-surface" : ""}`}
                    >
                      {fromKey(key).getDate()}
                    </span>
                    {has && <Px src={A.star} alt="일기 작성함" className="size-8" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <ul className="mx-auto mt-8 max-w-[600px] space-y-3">
            {[...diary]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((d) => (
                <li key={d.date}>
                  <button type="button" onClick={() => setSelected(d.date)} className="flex w-full items-start gap-3 rounded-2xl border border-primary p-3 text-left">
                    <span className="mt-1 size-3 shrink-0 rounded-full" style={{ background: MOOD_COLORS[d.mood] }} />
                    <span>
                      <span className="text-sm font-bold">
                        {fromKey(d.date).getMonth() + 1}.{fromKey(d.date).getDate()} · {MOOD_LABELS[d.mood]}
                      </span>
                      <span className="line-clamp-2 block text-sm">{d.text}</span>
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        )}

        <p className="mt-6 text-xl font-bold md:pl-[18px]">
          {sel.getMonth() + 1}.{sel.getDate()} {WEEKDAYS[sel.getDay()]}요일
        </p>
        <div className="card mt-3 flex items-center gap-4 p-3 md:px-5">
          <div className="flex shrink-0 flex-col items-center">
            <Px src={A.moodFace} className="size-14 md:size-20" style={{ filter: entry ? undefined : "grayscale(1)" }} />
            <span className="font-medium">{entry ? MOOD_LABELS[entry.mood] : "기록 없음"}</span>
          </div>
          <p className="min-w-0 flex-1 text-sm font-medium whitespace-pre-line">
            {entry?.text ?? "아직 이 날의 일기가 없어요. 오늘의 마음을 짧게 남겨 보세요."}
          </p>
          <button type="button" onClick={() => setEditing(true)} aria-label="일기 쓰기">
            <Px src={A.editCircle} className="size-10" />
          </button>
        </div>
      </div>

      <DiaryEditor key={selected + String(editing)} open={editing} date={selected} onClose={() => setEditing(false)} />
    </Container>
  );
}

function DiaryEditor({ open, date, onClose }: { open: boolean; date: string; onClose: () => void }) {
  const existing = useStore((s) => s.diary.find((d) => d.date === date));
  const saveDiary = useStore((s) => s.saveDiary);
  const [mood, setMood] = useState(existing?.mood ?? 3);
  const [text, setText] = useState(existing?.text ?? "");

  return (
    <Modal open={open} onClose={onClose} title="오늘의 일기">
      <p className="mb-2 text-sm font-bold">오늘 마음은 어땠나요?</p>
      <div className="mb-4 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMood(m)}
            className={`rounded-xl border-2 py-2 text-sm font-bold ${mood === m ? "border-primary-strong" : "border-transparent"}`}
            style={{ background: MOOD_COLORS[m] + "55" }}
          >
            {MOOD_LABELS[m]}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="오늘 있었던 일과 느낀 점을 적어 보세요."
        className={`${inputClass} h-auto py-2`}
      />
      <button
        type="button"
        className={`${primaryBtn} mt-4 w-full`}
        disabled={!text.trim()}
        onClick={() => {
          saveDiary({ date, mood, text: text.trim() });
          onClose();
        }}
      >
        저장하기
      </button>
    </Modal>
  );
}

function MindCards() {
  const today = todayKey();
  const { emotionTemp, setEmotionTemp, moodNotes, addMoodNote, release, userName } = useStore();
  const [temp, setTemp] = useState(emotionTemp[today] ?? 50);
  const [savedTemp, setSavedTemp] = useState(false);
  const [note, setNote] = useState("");
  const [worry, setWorry] = useState("");
  const [swallowing, setSwallowing] = useState(false);

  useEffect(() => {
    if (!swallowing) return;
    const id = setTimeout(() => setSwallowing(false), 1400);
    return () => clearTimeout(id);
  }, [swallowing]);

  const words = moodNotes.slice(-6).map((n) => n.text.split(/\s+/)[0]);

  return (
    <Container className="mt-12 md:mt-[100px]">
      <div className="grid gap-5 md:grid-cols-2 md:gap-10">
        {/* 감정 온도계 */}
        <section className="card-lg relative h-[400px] px-[52px] pt-[22px]">
          <Px src={A.thermometer} className="absolute top-[22px] left-[18px] size-20" />
          <div className="pl-[68px]">
            <h3 className="text-xl font-bold">감정 온도계</h3>
            <p className="text-sm font-bold text-[#404040] dark:text-ink-soft">지금 마음의 파장을 알려주세요.</p>
          </div>
          <Px src={temp >= 50 ? A.emotionOrbBright : A.emotionOrbCalm} className="mx-auto mt-4 size-[120px] md:size-[150px]" />
          <p className="mt-2 text-center text-2xl font-bold">{emotionLabel(temp)}</p>
          <input
            type="range"
            min={0}
            max={100}
            value={temp}
            aria-label="감정 온도"
            onChange={(e) => {
              setTemp(Number(e.target.value));
              setSavedTemp(false);
            }}
            className="mt-4 h-5 w-full cursor-pointer appearance-none rounded-[32px] accent-secondary-strong"
            style={{ background: `linear-gradient(90deg, var(--secondary-normal) ${temp}%, var(--secondary-neutral) ${temp}%)` }}
          />
          <div className="mt-3 text-center">
            <button
              type="button"
              className="h-8 w-[78px] rounded-2xl bg-secondary-strong text-sm font-bold text-white"
              onClick={() => {
                setEmotionTemp(today, temp);
                setSavedTemp(true);
              }}
            >
              {savedTemp ? "저장됨" : "확인"}
            </button>
          </div>
        </section>

        {/* 감정 일지 */}
        <section className="card-lg flex h-[400px] flex-col px-[29px] pt-[38px] pb-6">
          <h3 className="text-xl font-bold">감정 일지</h3>
          <p className="text-sm font-bold text-[#404040] dark:text-ink-soft">현재 기분을 기록해 보세요.</p>
          <div className="relative mx-auto mt-10 h-[103px] w-[145px]">
            <Px src={A.talkBubble} className="absolute inset-0 size-full" />
            {moodNotes.at(-1) && (
              <span className="absolute inset-x-3 top-6 line-clamp-2 text-center text-xs font-bold text-dark-2">{moodNotes.at(-1)!.text}</span>
            )}
          </div>
          <form
            className="mt-auto flex flex-col items-center gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!note.trim()) return;
              addMoodNote(note.trim());
              setNote("");
            }}
          >
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="한 줄로 현재 기분을 간단하게 기록해 보세요." className={`${inputClass} h-[35px] text-center`} />
            <button type="submit" className="h-8 w-[78px] rounded-2xl bg-primary-strong text-sm font-bold text-white">
              확인
            </button>
          </form>
        </section>

        {/* 블랙홀 */}
        <section className="flex h-[350px] flex-col rounded-[32px] border-[1.5px] border-secondary-strong bg-[#f9f8ff] px-[23px] pt-[38px] pb-6 dark:bg-surface">
          <div className="px-[13px]">
            <h3 className="text-xl font-bold">블랙홀</h3>
            <p className="text-sm font-bold text-[#404040] dark:text-ink-soft">잡고 있던 감정들을 놓아보세요.</p>
          </div>
          <div className="relative mx-auto mt-4 size-[123px]">
            <Px src={A.blackhole} className={`size-full ${swallowing ? "animate-spin" : ""}`} />
            {swallowing && <span className="absolute inset-0 grid place-items-center text-xs font-bold text-white">안녕~</span>}
          </div>
          <form
            className="mt-auto flex flex-col items-center gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!worry.trim()) return;
              release(worry.trim());
              setWorry("");
              setSwallowing(true);
            }}
          >
            <input
              value={worry}
              onChange={(e) => setWorry(e.target.value)}
              placeholder="무엇이 걱정이었나요?, 어떤 감정을 놓고 싶으신가요?"
              className={`${inputClass} h-[35px] border-secondary-strong text-center`}
            />
            <button type="submit" className="h-8 w-[78px] rounded-2xl bg-secondary-strong text-sm font-bold text-white">
              확인
            </button>
          </form>
        </section>

        {/* 주간 감정 구름 */}
        <section className="card-lg relative h-[350px] overflow-hidden px-[44px] pt-[38px]">
          <h3 className="text-xl font-bold">주간 감정 구름</h3>
          <p className="text-sm font-bold text-[#404040] dark:text-ink-soft">{userName}님의 최근 마음의 단어들이 모여 있어요.</p>
          <div className="group relative mx-auto mt-6 size-[188px]">
            <Px src={A.cloud} className="size-full transition-transform group-hover:-translate-y-2" />
            {words.map((w, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-surface/80 px-2 text-xs font-bold text-primary-strong opacity-0 transition-opacity group-hover:opacity-100"
                style={{ left: `${10 + ((i * 37) % 70)}%`, top: `${15 + ((i * 23) % 60)}%` }}
              >
                {w}
              </span>
            ))}
          </div>
          {!words.length && <p className="text-center text-xs text-ink-muted">감정 일지를 쓰면 단어가 구름에 모여요.</p>}
        </section>
      </div>

      <div className="mt-5 grid gap-5 md:mt-[29px] md:grid-cols-[350px_1fr]">
        <WeeklyEmotionGraph />
        <MindBottles />
      </div>
    </Container>
  );
}

function WeeklyEmotionGraph() {
  const emotionTemp = useStore((s) => s.emotionTemp);
  const week = weekOf(todayKey());
  const pts = week.map((d, i) => ({ x: 14 + i * 40, y: 110 - ((emotionTemp[d] ?? 0) / 100) * 90, has: d in emotionTemp }));
  const known = pts.filter((p) => p.has);

  return (
    <section className="card-lg h-[250px] px-[26px] pt-[30px]">
      <h3 className="text-xl font-bold">주간 감정 그래프</h3>
      <svg viewBox="0 0 270 120" className="mt-3 w-full" aria-label="이번 주 감정 온도 그래프">
        {[30, 60, 90].map((y) => (
          <line key={y} x1="0" x2="270" y1={y} y2={y} stroke="var(--light-3)" />
        ))}
        <polyline points={known.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="var(--primary-strong)" strokeWidth="2.5" />
        {known.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--primary-strong)" />
        ))}
      </svg>
      <div className="flex justify-between px-1.5 text-sm font-bold">
        {WEEK_MON_FIRST.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
    </section>
  );
}

const BOTTLE_IMG = [A.bottleCalm, A.bottleNight, A.bottleJoy];

function MindBottles() {
  const { bottles, addBottle, addToBottle } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [text, setText] = useState("");
  const bottle = bottles.find((b) => b.id === openId);

  return (
    <section className="card-lg flex h-[250px] flex-col px-[27px] pt-[17px] pb-4">
      <h3 className="text-xl font-bold">마음 보관함</h3>
      <p className="text-sm font-bold text-[#404040] dark:text-ink-soft">소중한 감정들을 보관할 수 있어요.</p>
      <ul className="scrollbar-none mt-3 flex gap-5 overflow-x-auto">
        {bottles.map((b, i) => (
          <li key={b.id} className="shrink-0">
            <button type="button" onClick={() => setOpenId(b.id)} className="flex flex-col items-center">
              <Px src={BOTTLE_IMG[i % BOTTLE_IMG.length]} className="h-[75px] w-[60px]" />
              <span className="relative mt-1 grid h-[27px] w-[88px] place-items-center">
                <Px src={A.bottleLabel} className="absolute inset-0 size-full" />
                <span className="relative truncate px-1 text-sm font-medium text-dark-2">{b.name}</span>
              </span>
              <span className="text-xs text-ink-muted">{b.notes.length}개</span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setCreating(true)} className="mx-auto mt-auto inline-flex h-[35px] items-center gap-1.5 rounded-2xl border border-primary-strong px-3 text-sm font-medium">
        새 보관병 만들기 <span className="text-primary-strong">+</span>
      </button>

      <Modal open={!!bottle} onClose={() => setOpenId(null)} title={bottle?.name ?? ""}>
        <ul className="mb-3 max-h-48 space-y-2 overflow-y-auto">
          {bottle?.notes.map((n, i) => (
            <li key={i} className="rounded-xl bg-light-2 px-3 py-2 text-sm">
              {n}
            </li>
          ))}
          {!bottle?.notes.length && <li className="text-sm text-ink-muted">아직 담긴 감정이 없어요.</li>}
        </ul>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim() || !bottle) return;
            addToBottle(bottle.id, text.trim());
            setText("");
          }}
        >
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="담아 둘 감정이나 순간" className={inputClass} />
          <button type="submit" className={primaryBtn}>
            담기
          </button>
        </form>
      </Modal>

      <Modal open={creating} onClose={() => setCreating(false)} title="새 보관병 만들기">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            addBottle(text.trim());
            setText("");
            setCreating(false);
          }}
        >
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="보관병 이름" className={inputClass} />
          <button type="submit" className={primaryBtn}>
            만들기
          </button>
        </form>
      </Modal>
    </section>
  );
}

const EXERCISES = [
  { id: "breath", title: "호흡 1분 리셋", desc: ["숨을 고르게 들이마시며", "마음을 정돈하기"], icon: A.wind },
  { id: "plane", title: "종이 비행기", desc: ["일주일 뒤의 나에게", "작은 편지 보내기"], icon: A.favPlane },
  { id: "galaxy", title: "은하수 바라보기", desc: ["은하수를 감상하며", "걱정을 비워내기"], icon: A.starSky },
  { id: "star", title: "별 수집하기", desc: ["오늘 작은 좋은 순간", "1개만 떠올려 저장하기"], icon: A.starBig },
] as const;

function MindExercises() {
  const [active, setActive] = useState<(typeof EXERCISES)[number]["id"] | null>(null);
  const ex = EXERCISES.find((e) => e.id === active);

  return (
    <Container className="mt-16 md:mt-[100px]">
      <span className="inline-flex rounded-2xl bg-primary-strong px-2.5 text-sm font-medium text-white">Ai 추천</span>
      <SectionTitle id="exercise">마음챙김 운동 추천</SectionTitle>
      <div className="mx-auto grid max-w-[560px] grid-cols-2 gap-4 md:gap-[60px]">
        {EXERCISES.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setActive(e.id)}
            className="card-lg flex aspect-square flex-col items-center justify-center gap-2 p-3 transition-transform hover:-translate-y-1"
          >
            <p className="text-lg font-bold md:text-xl">{e.title}</p>
            <span className="grid size-[50px] place-items-center rounded-xl border-[1.5px] border-primary-strong">
              <Px src={e.icon} className="size-10" />
            </span>
            <p className="text-center text-xs font-medium md:text-sm">
              {e.desc[0]}
              <br />
              {e.desc[1]}
            </p>
            <span className="font-bold text-primary-strong">시작하기 ›</span>
          </button>
        ))}
      </div>
      <Modal open={!!ex} onClose={() => setActive(null)} title={ex?.title ?? ""}>
        {ex && <ExerciseBody key={ex.id} id={ex.id} onDone={() => setActive(null)} />}
      </Modal>
    </Container>
  );
}

function ExerciseBody({ id, onDone }: { id: string; onDone: () => void }) {
  const complete = useStore((s) => s.completeMindExercise);
  const addToBottle = useStore((s) => s.addToBottle);
  const [seconds, setSeconds] = useState(60);
  const [text, setText] = useState("");
  const finish = () => {
    complete();
    onDone();
  };

  useEffect(() => {
    if (id !== "breath" && id !== "galaxy") return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [id]);

  if (id === "breath" || id === "galaxy") {
    const phase = Math.floor((60 - seconds) / 4) % 2 === 0 ? "들이마시기" : "내쉬기";
    return (
      <div className="flex flex-col items-center gap-4">
        <div
          className={`grid size-40 place-items-center rounded-full transition-transform duration-[4000ms] ${
            id === "galaxy" ? "bg-gradient-to-br from-dark-1 to-primary-strong text-white" : "bg-primary-neutral"
          } ${phase === "들이마시기" ? "scale-110" : "scale-90"}`}
        >
          <span className="font-bold">{id === "galaxy" ? "✦ ✧ ✦" : phase}</span>
        </div>
        <p className="font-dot text-3xl">{seconds}초</p>
        <button type="button" className={primaryBtn} onClick={finish}>
          {seconds === 0 ? "완료" : "마치기"}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        if (id === "star") addToBottle("joy", text.trim());
        finish();
      }}
      className="space-y-3"
    >
      <p className="text-sm text-ink-soft">
        {id === "plane" ? "일주일 뒤의 나에게 짧은 편지를 써 보세요." : "오늘 있었던 작은 좋은 순간 하나를 적어 보세요. 기쁨 조각 병에 담아 둘게요."}
      </p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className={`${inputClass} h-auto py-2`} />
      <div className="flex gap-2">
        <button type="submit" className={primaryBtn} disabled={!text.trim()}>
          {id === "plane" ? "날려 보내기" : "별 수집하기"}
        </button>
        <button type="button" className={outlineBtn} onClick={onDone}>
          닫기
        </button>
      </div>
    </form>
  );
}
