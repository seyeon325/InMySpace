"use client";

import { useState } from "react";
import { ClientOnly } from "@/components/ClientOnly";
import { Px } from "@/components/Px";
import { Container, Modal, PageIntro, SectionTitle, SoundCard, inputClass, primaryBtn } from "@/components/ui";
import { A, dayTags } from "@/lib/assets";
import { addDays, fromKey, minutesToText, sleepMinutes, todayKey } from "@/lib/date";
import { type SleepLog, sleepScore, useStore } from "@/lib/store";

export default function DreamRoom() {
  return (
    <>
      <PageIntro
        title="꿈 기록실"
        lead={
          <>
            오늘 꾸신 꿈은
            <br />
            어떤 꿈이었나요?
          </>
        }
        desc="나의 수면 분석 및 기록하기"
      />
      <ClientOnly>
        <DreamBody />
      </ClientOnly>
    </>
  );
}

function emptyLog(date: string): SleepLog {
  return { date, bedtime: "00:00", wake: "07:30", latency: 20, tossing: 5, tags: [], dreamMemo: "", dayNote: "" };
}

function DreamBody() {
  const today = todayKey();
  const sleep = useStore((s) => s.sleep);
  const log = sleep.find((l) => l.date === today) ?? emptyLog(today);
  const [editTime, setEditTime] = useState(false);

  return (
    <>
      <StarBanner />
      <SleepSummary log={log} onEdit={() => setEditTime(true)} />
      <DreamAndDay log={log} />
      <SleepStages log={log} />
      <SleepCompare log={log} />
      <Therapy />
      <SleepTimeDialog key={String(editTime)} open={editTime} log={log} onClose={() => setEditTime(false)} />
    </>
  );
}

function StarBanner() {
  const { sleep, diary } = useStore();
  const today = todayKey();
  const d = fromKey(today);
  // 최근 7일 중 수면 기록이 있는 날 수만큼 별이 밝아진다
  const lit = Array.from({ length: 7 }, (_, i) => addDays(today, -i)).filter((k) => sleep.some((l) => l.date === k && l.dreamMemo)).length;
  const added = sleep.some((l) => l.date === today && (l.dreamMemo || l.dayNote)) || diary.some((x) => x.date === today);

  return (
    <Container className="mt-14 md:mt-[100px]">
      <p className="text-xl font-semibold">오늘</p>
      <p className="text-2xl font-bold">
        {d.getFullYear()}년 {d.getMonth() + 1}월
      </p>
      <div className="relative mt-5 flex min-h-[193px] items-center overflow-hidden rounded-[32px] bg-gradient-to-r from-[#12316b] via-[#3a4fa0] to-[#b9a8ff] p-6 text-white md:pl-[306px]">
        <Px src={A.constellation} className="absolute top-2 left-[4%] w-[40%] opacity-90 md:w-[260px]" />
        <div className="relative">
          <p className="text-2xl leading-8 font-bold md:text-[28px]">
            {added ? "오늘 기록으로" : "꿈을 기록하면"}
            <br />
            {added ? "새로운 별이 추가되었어요." : "새로운 별이 생겨요."}
          </p>
          <p className="mt-2 font-medium">별이 한층 더 밝아졌어요!</p>
          <p className="font-medium tracking-widest">
            진행도 : {"★".repeat(Math.max(lit, added ? 1 : 0))}
            {"○".repeat(7 - Math.max(lit, added ? 1 : 0))}
          </p>
        </div>
        <a href="#memo" className="relative ml-auto hidden h-11 items-center rounded-2xl bg-white px-4 text-2xl font-bold text-[#12316b] md:inline-flex">
          자세히 보기
        </a>
      </div>
    </Container>
  );
}

function SleepSummary({ log, onEdit }: { log: SleepLog; onEdit: () => void }) {
  const total = sleepMinutes(log.bedtime, log.wake);
  const actual = Math.max(0, total - log.latency);
  const deep = Math.round(actual * 0.22);
  const score = sleepScore(log);
  const d = fromKey(log.date);
  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return `${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${String(m).padStart(2, "0")}`;
  };
  const condition = score >= 80 ? "잔잔한 파동" : score >= 60 ? "고요한 궤도" : "흔들리는 별빛";

  return (
    <Container className="mt-16 md:mt-[100px]">
      <SectionTitle
        info="기록한 잠든 시각과 일어난 시각으로 계산해요."
        sub={
          <button type="button" onClick={onEdit} className="text-base font-bold text-ink underline-offset-4 hover:underline">
            {d.getMonth() + 1}월 {d.getDate()}일 {fmt(log.bedtime)} ~ {fmt(log.wake)} ✎
          </button>
        }
      >
        수면 요약
      </SectionTitle>
      <div className="grid gap-4 md:grid-cols-[394px_1fr]">
        <div className="card-lg relative p-7">
          <p className="text-xl font-bold">오늘의 수면 컨디션</p>
          <p className="mt-4 text-[28px] leading-[30px] font-bold text-primary-strong">{condition}</p>
          <Px src={A.sleepIcon} className="absolute top-7 right-6 size-20 md:size-[100px]" />
          <div className="mt-4 flex gap-10 border-b border-primary pb-3">
            <div>
              <p className="font-medium">총 수면 시간</p>
              <p className="text-xl font-bold">{minutesToText(total)}</p>
            </div>
            <div>
              <p className="font-medium">뒤척임</p>
              <p className="text-xl font-bold">{log.tossing}회</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Px src={A.star} className="size-11" />
            <p className="text-sm font-medium">
              {score >= 70 ? "요즘 계속해서 깊게 잘 주무시고 계세요." : "잠드는 시간을 조금 앞당겨 보세요."}
              <br />
              {score >= 70 ? "나쁘지 않은 수면 패턴이에요." : "규칙적인 기상이 도움이 돼요."}
            </p>
          </div>
        </div>
        <div className="card-lg p-7">
          <p className="text-xl font-bold">수면 점수 분석</p>
          <div className="mt-3 flex flex-wrap items-center gap-6">
            <div className="relative size-[163px]">
              <Ring value={score} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl leading-[48px] font-bold text-[#4162ff]">{score}</span>
                <span className="text-[#525252] dark:text-ink-soft">/ 100 점</span>
              </div>
            </div>
            <dl className="grid flex-1 grid-cols-[auto_auto] gap-x-6 gap-y-2 text-[#525252] dark:text-ink-soft">
              <dt className="font-medium">실제 잔 시간</dt>
              <dd className="text-right text-xl font-bold">{minutesToText(actual)}</dd>
              <dt className="font-medium">잠드는 데 걸린 시간</dt>
              <dd className="text-right text-xl font-bold">{minutesToText(log.latency)}</dd>
              <dt className="font-medium">깊이 잔 시간</dt>
              <dd className="text-right text-xl font-bold">{minutesToText(deep)}</dd>
            </dl>
          </div>
        </div>
      </div>
    </Container>
  );
}

function Ring({ value }: { value: number }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 163 163" className="size-full" aria-hidden>
      <circle cx="81.5" cy="81.5" r={r} fill="none" stroke="var(--light-3)" strokeWidth="14" />
      <circle
        cx="81.5"
        cy="81.5"
        r={r}
        fill="none"
        stroke="var(--primary-strong)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${(c * value) / 100} ${c}`}
        transform="rotate(-90 81.5 81.5)"
      />
    </svg>
  );
}

function DreamAndDay({ log }: { log: SleepLog }) {
  const saveSleep = useStore((s) => s.saveSleep);
  const [tags, setTags] = useState(log.tags);
  const [note, setNote] = useState(log.dayNote);
  const [memoOpen, setMemoOpen] = useState(false);
  const [memo, setMemo] = useState(log.dreamMemo);
  const [saved, setSaved] = useState(false);

  return (
    <Container className="mt-16 md:mt-[100px]">
      <SectionTitle id="memo" info="꿈 내용과 오늘 있었던 일을 남기면 수면 분석에 반영돼요.">
        꿈 · 하루 기록
      </SectionTitle>
      <div className="grid gap-4 md:grid-cols-[200px_1fr] md:gap-[27px]">
        <button type="button" onClick={() => setMemoOpen(true)} className="card flex aspect-square flex-col items-center p-5 md:aspect-auto md:h-[200px]">
          <p className="text-xl font-bold">꿈 메모</p>
          <Px src={A.dreamMoon} className="mt-4 h-[57px] w-[52px]" />
          {log.dreamMemo ? (
            <p className="mt-2 line-clamp-2 text-xs text-ink-soft">{log.dreamMemo}</p>
          ) : (
            <Px src={A.plusCircle} className="mt-auto ml-auto size-9" />
          )}
        </button>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold">하루 기록</p>
            <button
              type="button"
              className="h-8 w-[78px] rounded-2xl bg-primary-strong text-sm font-bold text-white"
              onClick={() => {
                saveSleep({ ...log, tags, dayNote: note });
                setSaved(true);
              }}
            >
              {saved ? "저장됨" : "저장"}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {dayTags.map((t) => {
              const on = tags.includes(t.label);
              return (
                <button
                  key={t.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setTags(on ? tags.filter((x) => x !== t.label) : [...tags, t.label]);
                    setSaved(false);
                  }}
                  className={`flex h-[30px] items-center gap-[3px] rounded-[32px] border px-2.5 text-sm font-medium ${
                    on ? "border-primary-strong bg-primary-neutral text-ink" : "border-primary bg-surface text-label-4"
                  }`}
                >
                  <Px src={t.icon} className="size-5" />
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex h-[70px] items-center gap-3 rounded-xl bg-light-2 px-5">
            <input
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setSaved(false);
              }}
              placeholder="오늘 하루를 갈무리하는 한 줄을 남겨 보세요."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-label-4"
            />
            <Px src={A.editCircle} className="size-10" />
          </div>
        </div>
      </div>

      <Modal open={memoOpen} onClose={() => setMemoOpen(false)} title="꿈 메모">
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={6} placeholder="어떤 꿈을 꾸었나요? 기억나는 장면을 적어 보세요." className={`${inputClass} h-auto py-2`} />
        <button
          type="button"
          className={`${primaryBtn} mt-3 w-full`}
          onClick={() => {
            saveSleep({ ...log, tags, dayNote: note, dreamMemo: memo.trim() });
            setMemoOpen(false);
          }}
        >
          저장하기
        </button>
      </Modal>
    </Container>
  );
}

const STAGES = [
  { key: "awake", label: "깸", color: "#ffdaa6", share: 0.04 },
  { key: "rem", label: "렘수면", color: "#ac83df", share: 0.2 },
  { key: "light", label: "일반잠", color: "#9494ff", share: 0.5 },
  { key: "deep", label: "깊은잠", color: "#b1ffe5", share: 0.26 },
] as const;

/** 수면 시간으로 단계 흐름(약 90분 주기)을 만든다 */
function hypnogram(total: number) {
  const segs: { stage: number; start: number; len: number }[] = [];
  const pattern = [2, 3, 2, 1, 2, 3, 2, 1, 0];
  const cycle = 95;
  let t = 0;
  while (t < total) {
    for (const s of pattern) {
      const len = s === 0 ? 4 : s === 3 ? Math.round(18 - Math.min(10, t / 60)) : s === 1 ? Math.round(10 + Math.min(14, t / 30)) : 14;
      if (t >= total) break;
      segs.push({ stage: s, start: t, len: Math.min(len, total - t) });
      t += len;
    }
    t = Math.ceil(t / cycle) * cycle;
  }
  return segs;
}

function SleepStages({ log }: { log: SleepLog }) {
  const total = sleepMinutes(log.bedtime, log.wake);
  const segs = hypnogram(total);
  const hours = Math.ceil(total / 60);
  const sum = (s: number) => segs.filter((x) => x.stage === s).reduce((n, x) => n + x.len, 0);
  const cycles = Math.max(1, Math.round(total / 95));
  const sleep = useStore((s) => s.sleep);
  const recent = [...sleep].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const avg = Math.round(recent.reduce((n, l) => n + sleepMinutes(l.bedtime, l.wake), 0) / Math.max(recent.length, 1));

  return (
    <Container className="mt-16 md:mt-[100px]">
      <SectionTitle info="수면 시간을 바탕으로 예상한 수면 단계예요.">수면 단계</SectionTitle>
      <div className="grid gap-6 rounded-2xl bg-[rgba(34,58,103,0.95)] p-5 text-white md:grid-cols-[1fr_345px] md:p-8">
        <div>
          <div className="relative h-[270px]">
            {STAGES.map((s, i) => (
              <div key={s.key} className="absolute left-0 flex h-[64px] w-full items-center border-b border-white/30" style={{ top: i * 67 }}>
                <span className="w-14 shrink-0 font-medium" style={{ color: s.color }}>
                  {s.label}
                </span>
                <div className="relative h-full flex-1">
                  {segs
                    .filter((x) => x.stage === [0, 1, 2, 3][i])
                    .map((x, j) => (
                      <span
                        key={j}
                        className="absolute top-0 h-full rounded"
                        style={{ left: `${(x.start / (hours * 60)) * 100}%`, width: `${(x.len / (hours * 60)) * 100}%`, background: s.color }}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div className="ml-14 flex justify-between text-sm font-medium">
            <span>시간</span>
            {Array.from({ length: hours }, (_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        </div>

        <div>
          <ul className="space-y-2.5">
            {[
              { label: "자다깸", color: "#ffdaa6", min: sum(0) },
              { label: "렘수면", color: "#ac83df", min: sum(1) },
              { label: "일반잠", color: "#9494ff", min: sum(2) },
              { label: "깊은잠", color: "#b0ffe5", min: sum(3) },
            ].map((s) => (
              <li key={s.label} className="flex items-center gap-3">
                <i className="size-2.5 rounded" style={{ background: s.color }} />
                <span className="font-medium">{s.label}</span>
                <span className="ml-auto text-[#c8c8c8]">
                  {minutesToText(s.min)}({Math.round((s.min / total) * 100)}%)
                </span>
              </li>
            ))}
            <li className="flex items-center gap-3">
              <i className="size-2.5 rounded bg-[#c8c8c8]" />
              <span className="font-medium">수면 사이클</span>
              <span className="ml-auto text-[#c8c8c8]">
                {cycles}회 (회당 평균 {Math.round(total / cycles)}분)
              </span>
            </li>
          </ul>
          <div className="mt-5 rounded-2xl bg-[#3e598b] p-5">
            <p className="flex items-center gap-2 font-bold text-[#74ffd0]">
              <Px src={A.robotSmall} className="size-10" /> AI 수면 해석
            </p>
            <p className="mt-2 text-sm font-medium">
              최근 {recent.length}일 동안 평균 수면 시간이 {minutesToText(avg)}
              {avg < 420 ? "으로 권장량보다 부족해요. 오늘은 30분 일찍 누워 보세요." : "으로 충분한 편이에요. 지금 리듬을 유지해 보세요."}
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}

function SleepCompare({ log }: { log: SleepLog }) {
  const total = sleepMinutes(log.bedtime, log.wake);
  const metrics = {
    잠들기까지: { me: log.latency, avg: 30 },
    깊은잠: { me: Math.round(total * 0.22), avg: 90 },
    렘수면: { me: Math.round(total * 0.2), avg: 100 },
  } as const;
  const [tab, setTab] = useState<keyof typeof metrics>("잠들기까지");
  const { me, avg } = metrics[tab];
  const max = Math.max(me, avg) * 1.15;

  return (
    <Container className="mt-16 md:mt-[100px]">
      <SectionTitle>나의 잠 비교하기</SectionTitle>
      <div className="mx-auto max-w-[700px] rounded-2xl border border-primary-strong bg-[rgba(210,215,239,0.15)] p-6">
        <div className="flex justify-center gap-4 md:gap-[70px]">
          {(Object.keys(metrics) as (keyof typeof metrics)[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`h-[35px] w-[97px] rounded-lg font-bold ${tab === k ? "bg-primary-strong text-white" : "bg-primary-neutral text-primary-strong"}`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="mt-6 flex h-[180px] items-end justify-center gap-[90px]">
          {[
            { label: "나", value: me, color: "bg-primary", text: "text-primary-strong" },
            { label: "일반인 평균", value: avg, color: "bg-[#d4d7e8]", text: "text-dark-2 dark:text-ink" },
          ].map((b) => (
            <div key={b.label} className="flex h-full flex-col items-center justify-end">
              {b.label === "나" && <Px src={A.tired} className="h-[34px] w-[31px]" />}
              <div className={`w-[70px] rounded-lg transition-[height] duration-500 ${b.color}`} style={{ height: `${(b.value / max) * 130}px` }} />
              <p className={`mt-1 font-bold ${b.text}`}>{b.label}</p>
              <p className={`font-bold ${b.text}`}>{minutesToText(b.value)}</p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

function Therapy() {
  return (
    <Container className="mt-16 md:mt-[100px]">
      <h2 id="therapy" className="scroll-mt-28 bg-gradient-to-t from-[#c7b5ff] to-[#758cff] bg-clip-text text-2xl font-bold text-transparent md:text-[28px]">
        AI 추천 슬립 테라피
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <SoundCard title="우주를 느껴보기" desc="잔잔한 우주의 소리를 들으며 잠들어 보세요." img={A.therapySpace} />
      </div>
      <h2 className="mt-16 text-2xl font-bold md:text-[28px]">개운한 아침을 위한</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <SoundCard title="평온한 숲 속 소리" desc="숲 속의 바람과 새소리로 상쾌하게 깨어나요." img={A.therapyForest} />
        <SoundCard title="회복 수면 3.0Hz 델타파" desc="깊은 회복을 돕는 델타파 사운드예요." img={A.therapyDelta} />
        <SoundCard title="도서관의 백색소음" desc="조용한 도서관의 소리로 하루를 시작해요." img={A.therapyLibrary} />
      </div>
    </Container>
  );
}

function SleepTimeDialog({ open, log, onClose }: { open: boolean; log: SleepLog; onClose: () => void }) {
  const saveSleep = useStore((s) => s.saveSleep);
  const [bedtime, setBedtime] = useState(log.bedtime);
  const [wake, setWake] = useState(log.wake);
  const [latency, setLatency] = useState(log.latency);
  const [tossing, setTossing] = useState(log.tossing);

  return (
    <Modal open={open} onClose={onClose} title="어젯밤 수면 기록">
      <div className="grid grid-cols-2 gap-3 text-sm font-bold">
        <label className="space-y-1">
          <span>잠든 시각</span>
          <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className={inputClass} />
        </label>
        <label className="space-y-1">
          <span>일어난 시각</span>
          <input type="time" value={wake} onChange={(e) => setWake(e.target.value)} className={inputClass} />
        </label>
        <label className="space-y-1">
          <span>잠들기까지 (분)</span>
          <input type="number" min={0} value={latency} onChange={(e) => setLatency(Number(e.target.value))} className={inputClass} />
        </label>
        <label className="space-y-1">
          <span>뒤척임 (회)</span>
          <input type="number" min={0} value={tossing} onChange={(e) => setTossing(Number(e.target.value))} className={inputClass} />
        </label>
      </div>
      <button
        type="button"
        className={`${primaryBtn} mt-4 w-full`}
        onClick={() => {
          saveSleep({ ...log, bedtime, wake, latency, tossing });
          onClose();
        }}
      >
        저장하기
      </button>
    </Modal>
  );
}
