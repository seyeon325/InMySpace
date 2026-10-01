"use client";

import Link from "next/link";
import { useState } from "react";
import { ClientOnly } from "@/components/ClientOnly";
import { Px } from "@/components/Px";
import { Container, Modal, SectionTitle } from "@/components/ui";
import { A } from "@/lib/assets";
import { addDays, todayKey } from "@/lib/date";
import { routineRate, sleepScore, useStore } from "@/lib/store";

export default function MySpace() {
  const name = useStore((s) => s.userName);
  return (
    <>
      <Container className="mt-10 md:mt-[60px]">
        <h1 className="text-4xl font-bold md:text-5xl">마이 스페이스</h1>
        <ClientOnly fallback={<p className="mt-2 h-8" />}>
          <p className="mt-2 text-xl font-bold md:text-2xl">{name}님의 스페이스를 같이 탐험할까요?</p>
        </ClientOnly>
        <p className="mt-1 text-base md:text-xl">정신 건강 육각형 · 나노미 꾸미기 · 배지 · 통계</p>
      </Container>
      <ClientOnly>
        <SpaceBody />
      </ClientOnly>
    </>
  );
}

type Axis = { key: string; label: string; img: string; value: number };

/** 최근 7일 기록으로 정신 건강 여섯 축(0~100)을 계산한다 */
function useHexagon(): Axis[] {
  const { todos, routines, diary, emotionTemp, moodNotes, sleep, mindExercises } = useStore();
  const today = todayKey();
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, -i));
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const clamp = (n: number) => Math.round(Math.max(10, Math.min(100, n)));

  const weekTodos = todos.filter((t) => week.includes(t.date));
  const social = weekTodos.length ? (weekTodos.filter((t) => t.done).length / weekTodos.length) * 100 : 40;
  const mind = 30 + mindExercises * 8 + moodNotes.filter((n) => week.includes(n.date)).length * 6;
  const energy = avg(sleep.filter((l) => week.includes(l.date)).map(sleepScore)) || 50;
  const growth = avg(week.map((d) => routineRate(routines, d)).map((r) => (r.total ? (r.done / r.total) * 100 : 0)));
  const emotion = avg(week.map((d) => emotionTemp[d]).filter((v): v is number => v !== undefined)) || 50;
  const focus = 30 + diary.filter((d) => week.includes(d.date)).length * 10;

  return [
    { key: "social", label: "사회", img: A.planetSocial, value: clamp(social) },
    { key: "energy", label: "에너지", img: A.planetEnergy, value: clamp(energy) },
    { key: "emotion", label: "감정", img: A.planetEmotion, value: clamp(emotion) },
    { key: "focus", label: "집중", img: A.planetFocus, value: clamp(focus) },
    { key: "growth", label: "성장", img: A.planetGrowth, value: clamp(growth) },
    { key: "mind", label: "마음챙김", img: A.planetMind, value: clamp(mind) },
  ];
}

function SpaceBody() {
  const axes = useHexagon();
  return (
    <>
      <Hexagon axes={axes} />
      <Stats />
      <Badges />
      <Nanomi />
    </>
  );
}

function Hexagon({ axes }: { axes: Axis[] }) {
  const name = useStore((s) => s.userName);
  const C = 50;
  const R = 34;
  const point = (i: number, r: number) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
  };
  const outline = axes.map((_, i) => point(i, R).join(",")).join(" ");
  const shape = axes.map((a, i) => point(i, (R * a.value) / 100).join(",")).join(" ");
  const sorted = [...axes].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, 2);
  const low = sorted.slice(-2);

  return (
    <Container className="mt-16 md:mt-[100px]">
      <SectionTitle info="최근 7일 동안의 할 일, 루틴, 수면, 감정, 일기, 마음 운동 기록으로 계산해요.">{name}님의 우주 정육각형</SectionTitle>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] border-[1.5px] border-line bg-[#1b1d33] md:aspect-[800/550]">
        <Px src={A.hexBg} className="absolute inset-0 size-full object-cover" />
        <Px src={A.hexStars} className="absolute inset-0 size-full object-cover opacity-80" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 size-full" aria-hidden>
          <polygon points={outline} fill="rgba(117,141,255,0.12)" stroke="#b9c4ff" strokeWidth="0.4" />
          <polygon points={axes.map((_, i) => point(i, R * 0.6).join(",")).join(" ")} fill="none" stroke="#b9c4ff" strokeOpacity="0.4" strokeWidth="0.3" />
          {axes.map((_, i) => (
            <line key={i} x1={C} y1={C} x2={point(i, R)[0]} y2={point(i, R)[1]} stroke="#b9c4ff" strokeOpacity="0.35" strokeWidth="0.25" />
          ))}
          <polygon points={shape} fill="rgba(185,196,255,0.45)" stroke="#dbe2ff" strokeWidth="0.5" className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Px src={A.hexCore} className="w-[9%] animate-[float_3s_ease-in-out_infinite]" />
        </div>
        {/* 행성은 viewBox(100x100)를 화면 비율에 맞춰 퍼센트로 배치 */}
        <div className="absolute inset-y-0 left-1/2 aspect-square -translate-x-1/2">
          {axes.map((a, i) => {
            const [x, y] = point(i, R + 2);
            return (
              <div
                key={a.key}
                className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <Px src={a.img} className="w-10 md:w-16" />
                <span className="font-pixel text-xs font-bold text-white md:text-base">{a.label}</span>
                <span className="pointer-events-none absolute -top-6 rounded bg-white/90 px-1.5 text-xs font-bold text-dark-1 opacity-0 transition group-hover:opacity-100">
                  {a.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_310px]">
        <div className="card p-5">
          <p className="flex items-center gap-2 font-bold">
            <Px src={A.robotSmall} className="size-7" /> AI 정육각형 해석
          </p>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            {top.map((a) => a.label).join("과 ")} 영역에서 안정적인 흐름을 보여주고 계시네요. 정말 잘 해오셨어요!
            <br />
            {low.map((a) => a.label).join("과 ")} 영역은 조금 흔들렸던 순간도 있었지만, 작은 여유를 더하면 다시 균형을 찾을 수 있을 거예요.
            <br />
            지금의 당신은 이미 충분히 잘하고 있어요. 계속해서 당신만의 속도로 빛나세요!
          </p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-sm font-bold">
            {name}님을 위한
            <br />
            추천 마음운동이에요.
          </p>
          <div className="mt-3 flex justify-center gap-6">
            {[
              { label: "종이 비행기", img: A.favPlane },
              { label: "은하수 바라보기", img: A.starSky },
            ].map((x) => (
              <Link key={x.label} href="/mind#exercise" className="flex flex-col items-center gap-1 text-xs font-medium">
                <span className="grid size-16 place-items-center rounded-xl border-[1.5px] border-line bg-light-2">
                  <Px src={x.img} className="size-12 object-cover" />
                </span>
                {x.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}

function Stats() {
  const { userName, stella, mindExercises, diary } = useStore();
  const rows = [
    { label: "지금까지 모은 스텔라 수", value: stella, img: A.starBadge },
    { label: "완료한 마음 운동 수", value: mindExercises, img: A.heartStat },
    { label: "지금까지 작성한 일기 수", value: diary.length, img: A.planetStat },
  ];
  return (
    <Container className="mt-16 md:mt-[100px]">
      <SectionTitle info="InMySpace에서 쌓아온 기록이에요.">{userName}님을 나타내기</SectionTitle>
      <div className="card-lg space-y-4 p-5 md:px-12 md:py-10">
        {rows.map((r) => (
          <div key={r.label} className="card flex h-[70px] items-center gap-5 px-6 md:h-[86px]">
            <Px src={r.img} className="size-9" />
            <span className="font-bold md:text-lg">{r.label}</span>
            <span className="ml-auto text-lg font-bold text-primary-strong">{r.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </Container>
  );
}

function Badges() {
  const { userName, todos, routines, stella, emotionTemp } = useStore();
  const anyRoutineDone = routines.some((r) => r.doneDates.length > 0);
  const badges = [
    { name: "탐험가", img: A.badgeExplorer, desc: "새로운 루틴을 처음으로 완료하여 당신의 우주 여정을 시작했어요.", earned: anyRoutineDone },
    { name: "새싹", img: A.badgeSprout, desc: "루틴을 꾸준히 일주일 동안 이어가며 첫 성장의 변화를 만들어냈어요.", earned: routines.some((r) => r.doneDates.length >= 7) },
    { name: "스텔라", img: A.badgeStella, desc: "오늘의 목표를 달성해 작은 성취가 별처럼 모였어요.", earned: todos.some((t) => t.done) || stella >= 100 },
    {
      name: "반짝이",
      img: A.badgeSparkle,
      desc: "하루 평균 감정 온도 100점을 달성했어요. 스스로를 잘 돌본 덕분이에요.",
      earned: Object.values(emotionTemp).some((v) => v >= 100),
    },
  ];
  return (
    <Container className="mt-16 md:mt-[100px]">
      <SectionTitle info="기록을 이어가면 새로운 배지가 열려요.">{userName}님이 모은 뱃지</SectionTitle>
      <div className="card-lg grid grid-cols-2 gap-6 p-6 md:grid-cols-4 md:px-10 md:py-12">
        {badges.map((b) => (
          <div key={b.name} className={`flex flex-col items-center text-center ${b.earned ? "" : "opacity-40 grayscale"}`}>
            <Px src={b.img} className="size-24 md:size-[110px]" />
            <p className="mt-2 font-bold">{b.name}</p>
            <p className="mt-1 text-xs leading-5 text-ink-soft">{b.desc}</p>
            {!b.earned && <p className="mt-1 text-xs font-bold text-label-4">아직 잠겨 있어요</p>}
          </div>
        ))}
      </div>
    </Container>
  );
}

const OUTFITS = [
  { id: "basic", label: "기본 우주복", filter: "" },
  { id: "lavender", label: "라벤더", filter: "hue-rotate(40deg) saturate(1.4)" },
  { id: "mint", label: "민트", filter: "hue-rotate(-60deg) saturate(1.3)" },
  { id: "night", label: "밤하늘", filter: "brightness(0.8) hue-rotate(20deg) saturate(1.8)" },
];

function Nanomi() {
  const userName = useStore((s) => s.userName);
  const [open, setOpen] = useState(false);
  const [outfit, setOutfit] = useState(() => {
    try {
      return localStorage.getItem("inmyspace-outfit") ?? "basic";
    } catch {
      return "basic";
    }
  });
  const filter = OUTFITS.find((o) => o.id === outfit)?.filter;

  return (
    <Container className="mt-16 mb-24 md:mt-[100px] md:mb-[180px]">
      <SectionTitle info="나노미는 당신의 우주를 함께 여행하는 친구예요.">{userName}님의 나노미</SectionTitle>
      <div className="card-lg flex flex-col items-center py-12 md:py-16">
        <div className="relative size-[180px] md:size-[220px]">
          <Px src={A.nanomiFrame} className="absolute inset-0 size-full" />
          <Px src={A.nanomi} className="absolute inset-[25%] size-[50%] animate-[float_3s_ease-in-out_infinite]" style={{ filter }} />
        </div>
        <button type="button" onClick={() => setOpen(true)} className="mt-6 flex flex-col items-center gap-1 text-sm font-bold">
          <Px src={A.closet} className="size-10" />
          옷장
        </button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="나노미 옷장">
        <div className="grid grid-cols-2 gap-3">
          {OUTFITS.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={outfit === o.id}
              onClick={() => {
                setOutfit(o.id);
                try {
                  localStorage.setItem("inmyspace-outfit", o.id);
                } catch {}
              }}
              className={`flex flex-col items-center gap-2 rounded-xl border-[1.5px] p-3 text-sm font-bold ${
                outfit === o.id ? "border-primary-strong bg-primary-neutral" : "border-primary"
              }`}
            >
              <Px src={A.nanomi} className="size-14" style={{ filter: o.filter }} />
              {o.label}
            </button>
          ))}
        </div>
      </Modal>
    </Container>
  );
}
