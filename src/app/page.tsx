"use client";

import Link from "next/link";
import { useState } from "react";
import { ClientOnly } from "@/components/ClientOnly";
import { Px } from "@/components/Px";
import { Container, PageIntro, Pager, ProgressBar, SectionTitle, SoundCard } from "@/components/ui";
import { A } from "@/lib/assets";
import { WEEK_MON_FIRST, formatMonthDay, minutesToText, sleepMinutes, todayKey, weekOf } from "@/lib/date";
import { moodScore, routineRate, sleepScore, useStore } from "@/lib/store";

export default function ControlRoom() {
  return (
    <>
      <PageIntro
        title="조종실"
        lead="오늘의 컨디션"
        desc="종합 요약, 오늘 하루를 시작하기"
      />
      <ClientOnly>
        <Summary />
        <DailyOrbit />
        <MySpaceRoom />
        <OrbitSignal />
      </ClientOnly>
    </>
  );
}

function Summary() {
  const today = todayKey();
  const { sleep, emotionTemp, routines } = useStore();
  const lastSleep = [...sleep].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  const score = sleepScore(lastSleep);
  const slept = lastSleep ? sleepMinutes(lastSleep.bedtime, lastSleep.wake) : 0;
  const mood = moodScore(emotionTemp[today]);
  const rate = routineRate(routines, today);
  const avgScore = Math.round(sleep.reduce((n, l) => n + sleepScore(l), 0) / Math.max(sleep.length, 1));

  const cards = [
    {
      title: "수면 점수",
      value: `${score}/100`,
      pct: score,
      icon: A.sleepIcon,
      note: `어제는 ${minutesToText(slept)} 잤어요.`,
    },
    {
      title: "감정 점수",
      value: `${mood}/10`,
      pct: mood * 10,
      icon: A.emotionIcon,
      note: mood >= 7 ? "오늘은 긍정적입니다!" : mood >= 4 ? "마음이 잔잔한 날이에요." : "조금 쉬어가도 괜찮아요.",
    },
    {
      title: "루틴 달성",
      value: `${rate.done}/${rate.total}`,
      pct: rate.total ? (rate.done / rate.total) * 100 : 0,
      icon: A.routineIcon,
      note: rate.done / Math.max(rate.total, 1) >= 0.5 ? "루틴을 잘 지키고 있어요." : "루틴 성공률이 낮아요.",
    },
  ];

  return (
    <Container className="mt-16 md:mt-[68px]">
      <SectionTitle info="오늘의 수면, 감정, 루틴을 한눈에 볼 수 있어요." sub={formatMonthDay(today)}>
        종합 요약
      </SectionTitle>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} className="card flex h-[300px] flex-col items-center px-[52px] pt-5 pb-5">
            <p className="text-xl font-bold">{c.title}</p>
            <p className="text-[28px] leading-8 font-bold">{c.value}</p>
            <ProgressBar value={c.pct} className="mt-4" />
            <div className="mt-5 grid size-[100px] place-items-center rounded-xl bg-[#ced7ff] dark:bg-light-3">
              <Px src={c.icon} className="size-[100px]" />
            </div>
            <p className="mt-auto text-base font-medium">{c.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:mt-[41px] md:grid-cols-2 md:gap-[22px]">
        <Link href="/dream" className="card group block h-[300px] rounded-xl p-[30px] pt-6">
          <div className="flex items-center gap-4">
            <Px src={A.sleepCardIcon} className="h-[27px] w-[35px]" />
            <p className="text-xl font-bold">수면</p>
            <Px src={A.chevronRight} className="ml-auto h-4 w-2.5" />
          </div>
          <div className="mt-[52px] grid grid-cols-[1fr_1fr_1.4fr] items-end">
            <Stat label="기간" value={`${sleep.length}일`} />
            <Stat label="품질" value={avgScore >= 70 ? "좋음" : avgScore >= 50 ? "보통" : "나쁨"} />
            <div className="flex items-end justify-between">
              <Stat label="평균 점수" value={String(avgScore)} />
              <ScoreRing value={avgScore} />
            </div>
          </div>
        </Link>

        <div className="card h-[300px] rounded-xl p-[30px] pt-6">
          <div className="flex items-center gap-4">
            <Px src={A.exerciseCardIcon} className="h-8 w-[25px]" />
            <p className="text-xl font-bold">운동</p>
          </div>
          <div className="mt-[52px] grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
            <ExerciseStat label="움직임" color="#ff2a81" value="400" unit="Cal" />
            <ExerciseStat label="운동" color="#7ada3e" value="60" unit="분" />
            <ExerciseStat label="서기" color="#28c8c3" value="3" unit="시간" />
            <ActivityRings />
          </div>
        </div>
      </div>
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xl font-bold">{label}</p>
      <p className="mt-8 text-2xl font-bold text-primary-strong">{value}</p>
    </div>
  );
}

function ExerciseStat({ label, color, value, unit }: { label: string; color: string; value: string; unit: string }) {
  return (
    <div>
      <p className="text-xl font-bold" style={{ color }}>
        {label}
      </p>
      <p className="mt-8 text-xl font-bold">
        {value} <span className="text-sm font-medium text-label-4">{unit}</span>
      </p>
    </div>
  );
}

function ScoreRing({ value, size = 64 }: { value: number; size?: number }) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--light-3)" strokeWidth="6" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--primary-strong)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${(c * value) / 100} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

function ActivityRings() {
  const rings = [
    { r: 33, color: "#ff2a81", pct: 0.8 },
    { r: 24, color: "#7ada3e", pct: 0.65 },
    { r: 15, color: "#28c8c3", pct: 0.9 },
  ];
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="rounded-full bg-black" aria-hidden>
      {rings.map(({ r, color, pct }) => {
        const c = 2 * Math.PI * r;
        return (
          <g key={r}>
            <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="8" />
            <circle
              cx="38"
              cy="38"
              r={r}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${c * pct} ${c}`}
              transform="rotate(-90 38 38)"
            />
          </g>
        );
      })}
    </svg>
  );
}

function DailyOrbit() {
  const today = todayKey();
  const { routines, sleep, emotionTemp, todos } = useStore();
  const rate = routineRate(routines, today);
  const routinePct = Math.round((rate.done / Math.max(rate.total, 1)) * 100);
  const lastSleep = [...sleep].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  const temp = emotionTemp[today] ?? 50;
  const stability = temp >= 70 ? "좋음" : temp >= 40 ? "보통" : "낮음";
  const week = weekOf(today);
  const openTodos = todos.filter((t) => !t.done && t.date <= today).length;

  return (
    <Container className="mt-16 md:mt-[100px]">
      <SectionTitle info="하루의 수면과 루틴, 감정 흐름을 한눈에 볼 수 있어요.">데일리 오비트</SectionTitle>

      <div className="grid gap-5 md:grid-cols-[515px_1fr]">
        <div className="card flex flex-col p-6 md:p-[22px]">
          <p className="text-2xl font-bold md:text-[28px] md:leading-8">오늘의 리듬뷰</p>
          <p className="mt-3 text-base text-[#404040] dark:text-ink-soft md:text-xl md:leading-5">
            하루의 수면과 루틴, 감정 흐름을 한눈에 볼 수 있어요.
          </p>

          <div className="relative mx-auto my-8 aspect-square w-full max-w-[320px]">
            <div className="absolute inset-0 rounded-full border-[14px] border-primary-neutral" />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(var(--primary-strong) ${routinePct * 3.6}deg, transparent 0)`,
                mask: "radial-gradient(farthest-side, transparent calc(100% - 14px), #000 calc(100% - 13px))",
              }}
            />
            <div className="absolute inset-[18%] rounded-full border-2 border-dashed border-primary" />
            <div className="absolute inset-[35%] rounded-full bg-gradient-to-br from-primary to-primary-strong shadow-[0_0_40px_rgba(117,141,255,0.6)]" />
            <Px src={A.orbitPlanet} className="absolute top-[3%] left-[3%] w-[24%]" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ["루틴 완성률", `${routinePct}%`],
              ["수면 완성률", String(sleepScore(lastSleep))],
              ["안정 지수", stability],
            ].map(([label, value]) => (
              <div key={label} className="flex h-20 flex-col items-center justify-center rounded-lg border border-primary-strong">
                <p className="text-sm font-bold text-ink-soft md:text-base">{label}</p>
                <p className="text-xl font-bold text-primary-strong">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="card p-6">
            <p className="text-xl font-bold">
              오늘의 미션 <span className="ml-1 text-sm font-medium text-label-4">(Orbit Tasks)</span>
            </p>
            <Badge className="mt-3">도전 가능</Badge>
            <div className="mt-3 flex items-center gap-4 rounded-lg border border-primary p-4">
              <span className="grid size-[55px] shrink-0 place-items-center rounded-xl border border-primary-strong">
                <Px src={A.missionWalk} className="size-[50px]" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="inline-flex h-[15px] items-center rounded-md bg-light-1 px-3 text-xs font-bold text-label-4 dark:bg-light-3">
                  1일 남음
                </span>
                <p className="mt-1 text-xl font-bold">오늘 1,225보 걷기</p>
              </div>
              <Link
                href="/orbit#routine"
                className="inline-flex h-[35px] shrink-0 items-center rounded-2xl bg-dark-1 px-4 font-bold text-light-1 dark:bg-primary-strong"
              >
                도전 하기
              </Link>
            </div>
            <Badge className="mt-4 w-[90px]">개인 뱃지 미션</Badge>
            <div className="mt-3 flex items-center gap-4 rounded-lg border border-primary p-4">
              <Px src={A.missionSprout} className="h-[57px] w-[55px] shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="inline-flex h-[15px] items-center rounded-lg bg-light-1 px-3 text-xs font-bold text-label-4 dark:bg-light-3">
                  {openTodos ? `할 일 ${openTodos}개` : "1일 남음"}
                </span>
                <p className="mt-1 text-sm font-medium">고정 루틴 일주일 동안 지속하기</p>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-xl bg-light-3">
                  <div className="h-full rounded-xl bg-primary-strong" style={{ width: "39%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <p className="text-xl font-bold">
              지난 일주일의 리듬 보기 <span className="ml-1 text-sm font-medium text-label-4">(History Orbit)</span>
            </p>
            <div className="mt-5 flex items-end justify-between gap-2 border-b border-label-4/50 px-2 pb-1">
              {week.map((d) => {
                const r = routineRate(routines, d);
                const routineH = 30 + (r.done / Math.max(r.total, 1)) * 70;
                const emotionH = ((emotionTemp[d] ?? 40) / 100) * 70;
                return (
                  <div key={d} className="relative flex h-[100px] w-[30px] items-end">
                    <div className="w-full rounded-md bg-primary" style={{ height: routineH }} />
                    <div
                      className="absolute bottom-0 w-full rounded-t-md bg-accent"
                      style={{ height: Math.min(emotionH, routineH), bottom: routineH - Math.min(emotionH, routineH) }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between px-2 pt-1">
              {WEEK_MON_FIRST.map((w) => (
                <span key={w} className="w-[30px] text-center text-sm font-medium">
                  {w}
                </span>
              ))}
            </div>
            <div className="mt-2 flex justify-end gap-3 text-xs font-bold">
              <span className="flex items-center gap-1">
                <i className="size-3.5 rounded-[3px] bg-accent" /> 감정
              </span>
              <span className="flex items-center gap-1">
                <i className="size-3.5 rounded-[3px] bg-primary" /> 루틴
              </span>
            </div>
            <div className="mt-3 text-center">
              <Link href="/orbit" className="inline-flex h-[35px] w-[150px] items-center justify-center rounded-2xl border border-primary-strong text-sm font-bold">
                자세히 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex h-[25px] items-center justify-center rounded-lg bg-light-2 px-3 text-xs font-bold text-label-3 dark:text-ink ${className}`}
    >
      {children}
    </span>
  );
}

function MySpaceRoom() {
  const userName = useStore((s) => s.userName);
  const R = A.spaceRoom;
  return (
    <Container className="mt-16 md:mt-[100px]">
      <SectionTitle info="나만의 우주 방이에요. 기록이 쌓이면 방이 꾸며져요.">{userName}님의 스페이스</SectionTitle>
      <Link href="/my-space" className="card relative mx-auto block aspect-[808/406] w-full max-w-[808px] overflow-hidden">
        {/* Figma 좌표(808×406)를 비율로 옮긴 배치 */}
        <Px src={R.window} className="absolute" style={pos(262.5, 77.5, 330, 158)} />
        <Px src={R.room} className="absolute" style={pos(42.5, -1.5, 710, 406)} />
        <Px src={R.telescope} className="absolute" style={pos(606.5, 201.5, 111, 187)} />
        <Px src={R.lamp} className="absolute" style={pos(500.5, 205.5, 62, 90)} />
        <Px src={R.beanbag} className="absolute" style={pos(243.5, 235.5, 159, 139)} />
        <Px src={R.astronaut} className="absolute animate-[float_4s_ease-in-out_infinite]" style={pos(339.5, 246.5, 116, 130)} />
        <Px src={R.plant} className="absolute" style={pos(-1.5, 62.5, 77, 120)} />
      </Link>
    </Container>
  );
}

function pos(left: number, top: number, w: number, h: number) {
  return {
    left: `${(left / 808) * 100}%`,
    top: `${(top / 406) * 100}%`,
    width: `${(w / 808) * 100}%`,
    height: `${(h / 406) * 100}%`,
  };
}

const SIGNALS = [
  { title: "집중 백색소음", desc: "오늘 집중해서 원하는 목표를 달성해보세요.", img: A.soundFocus },
  { title: "새벽 숲 속 힐링 사운드", desc: "새벽의 숲 속의 힐링 사운드를 통해 마음의 안정을 얻어보세요.", img: A.soundForest },
  { title: "달빛 사운드", desc: "달 빛의 밝은 기운을 느껴보세요. 너무 아름답지 않나요?", img: A.soundMoon },
  { title: "우주를 느껴보기", desc: "잔잔한 우주의 소리를 들으며 하루를 정리해 보세요.", img: A.therapySpace },
  { title: "회복 수면 3.0Hz 델타파", desc: "깊은 잠을 돕는 델타파 사운드예요.", img: A.therapyDelta },
  { title: "도서관의 백색소음", desc: "조용한 도서관의 소리로 집중력을 높여 보세요.", img: A.therapyLibrary },
];

function OrbitSignal() {
  const userName = useStore((s) => s.userName);
  const [page, setPage] = useState(0);
  const perPage = 3;
  const pages = Math.ceil(SIGNALS.length / perPage);

  return (
    <Container className="mt-16 md:mt-[100px]">
      <SectionTitle
        info="오늘의 컨디션에 맞춘 콘텐츠예요."
        sub={`맞춤형 AI로 ${userName}님에게 딱 맞는 음악 콘텐츠를 준비했어요.`}
        action={
          <Link href="/dream#therapy" className="shrink-0 text-base underline md:text-xl">
            전체보기
          </Link>
        }
      >
        오늘의 궤도 시그널
      </SectionTitle>
      <div className="grid gap-5 sm:grid-cols-3">
        {SIGNALS.slice(page * perPage, page * perPage + perPage).map((s) => (
          <SoundCard key={s.title} {...s} />
        ))}
      </div>
      <Pager count={pages} index={page} onChange={setPage} />
    </Container>
  );
}
