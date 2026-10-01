"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { A } from "@/lib/assets";
import { WEEK_MON_FIRST, todayKey, weekOf } from "@/lib/date";
import { useStore } from "@/lib/store";
import { ClientOnly } from "./ClientOnly";
import { Px } from "./Px";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1000px] px-4 ${className}`}>{children}</div>;
}

export function SectionTitle({
  children,
  info,
  sub,
  action,
  id,
}: {
  children: ReactNode;
  info?: string;
  sub?: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="mb-5 flex scroll-mt-28 items-end justify-between gap-4 md:mb-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-[28px] md:leading-8">
          {children}
          {info && (
            <span title={info} className="inline-flex">
              <Px src={A.info} alt={info} className="size-6 md:size-7 dark:invert" />
            </span>
          )}
        </h2>
        {sub && <p className="mt-2 text-base text-ink-soft md:text-xl">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const FAVORITES = [
  { href: "/orbit#todo", label: "오늘의 할 일", icon: A.favTodo },
  { href: "/dream#memo", label: "꿈 메모", icon: A.favMemo },
  { href: "/orbit#tools", label: "집중 타이머", icon: A.favTimer },
  { href: "/mind#exercise", label: "종이 비행기", icon: A.favPlane },
];

export function Favorites() {
  return (
    <div className="flex items-center gap-4 md:gap-6">
      <p className="text-base leading-6 font-bold md:text-xl md:leading-7">
        나의
        <br />
        즐겨찾기
      </p>
      <ul className="flex gap-2.5 md:gap-5">
        {FAVORITES.map((f) => (
          <li key={f.href}>
            <Link
              href={f.href}
              title={f.label}
              aria-label={f.label}
              className="card grid size-12 place-items-center rounded-xl transition-transform hover:-translate-y-0.5 md:size-[60px]"
            >
              <Px src={f.icon} className="size-10 md:size-[54px]" />
            </Link>
          </li>
        ))}
        <li>
          <Link href="/orbit#add" aria-label="즐겨찾기 추가" className="block size-12 md:size-[60px]">
            <Px src={A.favAdd} className="size-full" />
          </Link>
        </li>
      </ul>
    </div>
  );
}

/** 각 방 상단의 "AI 추천: 아침 루틴 시작하기" 카드 */
export function AiRecommendCard() {
  const routines = useStore((s) => s.routines);
  const today = todayKey();
  const week = weekOf(today);

  return (
    <Link
      href="/orbit#routine"
      className="card group relative flex min-h-[150px] items-center gap-4 rounded-xl p-4 transition-shadow hover:shadow-[0_6px_24px_rgba(117,141,255,0.25)] md:min-h-[184px] md:gap-6 md:px-6"
    >
      <Px src={A.robot} className="size-16 shrink-0 md:size-[85px]" />
      <div className="min-w-0 flex-1">
        <span className="inline-flex h-[25px] items-center rounded-lg bg-light-2 px-3 text-xs font-bold text-label-3 dark:text-ink">
          AI 추천
        </span>
        <p className="mt-2 font-dot text-base md:text-xl">어제 잘 잤나요?</p>
        <p className="font-dot text-2xl leading-8 tracking-[-0.1em] md:text-4xl">아침 루틴 시작하기</p>
        <ul className="mt-2 flex flex-wrap gap-1.5 md:gap-2.5">
          {week.map((d, i) => {
            const isToday = d === today;
            const done = routines.some((r) => r.doneDates.includes(d));
            return (
              <li
                key={d}
                className={`grid size-7 place-items-center rounded-full text-xs font-medium md:size-[37px] md:text-sm ${
                  isToday
                    ? "border border-primary-strong bg-surface text-ink"
                    : done
                      ? "bg-primary-strong text-light-1"
                      : "bg-primary-neutral text-ink-muted"
                }`}
              >
                {WEEK_MON_FIRST[i]}
              </li>
            );
          })}
        </ul>
      </div>
      <Px src={A.circleArrow} className="size-8 shrink-0 transition-transform group-hover:translate-x-1 md:size-[42px]" />
    </Link>
  );
}

export function PageIntro({
  title,
  lead,
  desc,
}: {
  title: string;
  lead: ReactNode;
  desc: string;
}) {
  return (
    <Container className="mt-8 md:mt-12">
      <Favorites />
      <div className="mt-8 grid gap-6 md:mt-[60px] md:grid-cols-[210px_1fr] md:items-center md:gap-5">
        <div className="flex flex-col gap-2.5">
          <h1 className="text-4xl leading-tight font-bold md:text-5xl md:leading-[48px]">{title}</h1>
          <p className="text-xl leading-[30px] font-bold md:text-2xl md:leading-[34px]">{lead}</p>
          <p className="text-base text-ink md:text-xl">{desc}</p>
        </div>
        <ClientOnly fallback={<div className="card min-h-[150px] rounded-xl md:min-h-[184px]" />}>
          <AiRecommendCard />
        </ClientOnly>
      </div>
    </Container>
  );
}

export function Pager({
  count,
  index,
  onChange,
}: {
  count: number;
  index: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="mx-auto flex gap-1.5">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1}번째`}
            onClick={() => onChange(i)}
            className={`h-[5px] rounded-full transition-all ${i === index ? "w-6 bg-primary-strong" : "w-[5px] bg-primary"}`}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button type="button" aria-label="이전" disabled={index === 0} onClick={() => onChange(index - 1)} className="disabled:opacity-40">
          <Px src={A.arrowPrev} className="size-7" />
        </button>
        <button
          type="button"
          aria-label="다음"
          disabled={index >= count - 1}
          onClick={() => onChange(index + 1)}
          className="disabled:opacity-40"
        >
          <Px src={A.arrowNext} className="size-7" />
        </button>
      </div>
    </div>
  );
}

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-[13px] w-full overflow-hidden rounded-xl bg-light-3 ${className}`}>
      <div
        className="h-full rounded-xl bg-primary-strong transition-[width] duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="card-lg m-auto w-[min(92vw,460px)] p-0 text-ink backdrop:bg-dark-1/40"
    >
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">{title}</h3>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-2xl leading-none text-ink-muted">
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export const inputClass =
  "h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-primary";

export const primaryBtn =
  "inline-flex h-9 items-center justify-center rounded-2xl bg-primary-strong px-5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40";

export const outlineBtn =
  "inline-flex h-9 items-center justify-center rounded-lg border border-line bg-surface px-4 text-sm font-bold text-ink transition-colors hover:bg-light-2";

export function SoundCard({ title, desc, img }: { title: string; desc: string; img: string }) {
  return (
    <article className="overflow-hidden rounded-2xl border-[1.5px] border-primary bg-surface">
      <Px src={img} className="h-[200px] w-full object-cover [image-rendering:auto]" />
      <div className="min-h-[94px] px-3.5 py-3">
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-sm font-medium">{desc}</p>
      </div>
    </article>
  );
}
