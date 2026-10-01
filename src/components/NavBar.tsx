"use client";

import Link from "next/link";
import { useEffect } from "react";
import { A } from "@/lib/assets";
import { useStore } from "@/lib/store";
import { ClientOnly } from "./ClientOnly";
import { Px } from "./Px";

export function NavBar() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const dark = theme === "dark";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-line/60 bg-page/90 backdrop-blur md:h-[100px]">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-3 md:px-7">
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="인마이스페이스 홈">
            <Px src={A.navLogo} className="size-14 md:size-20" />
          </Link>
          <button
            type="button"
            aria-label="언어 선택"
            className="relative grid size-9 place-items-center md:size-[45px]"
          >
            <Px src={A.globeRing} className="absolute inset-0 size-full" />
            <Px src={A.globe} className="relative size-6 md:size-[30px]" />
          </button>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <ClientOnly fallback={<span className="h-8 w-[62px] md:h-10 md:w-[77px]" />}>
          <button
            type="button"
            onClick={() => setTheme(dark ? "light" : "dark")}
            aria-label={dark ? "라이트 모드로 바꾸기" : "다크 모드로 바꾸기"}
            aria-pressed={dark}
            className="relative h-8 w-[62px] overflow-hidden md:h-10 md:w-[77px]"
          >
            <Px src={dark ? A.toggleTrackDark : A.toggleTrackLight} className="absolute inset-0 size-full" />
            <Px
              src={dark ? A.toggleKnobDark : A.toggleKnobLight}
              className={`absolute top-[4px] size-6 transition-all md:top-[5px] md:size-[30px] ${
                dark ? "left-[33px] md:left-[41px]" : "left-[6px] md:left-[8px]"
              }`}
            />
          </button>
          </ClientOnly>
          <Px src={A.weather} alt="오늘 날씨" className="hidden h-[28px] w-[30px] sm:block" />
          <button type="button" aria-label="알림">
            <Px src={A.bell} className="h-7 w-6 md:h-[34px] md:w-[30px]" />
          </button>
          <Link href="/my-space" aria-label="마이 스페이스" className="relative size-12 md:size-[66px]">
            <Px src={A.avatarRing} className="absolute inset-0 size-full" />
            <Px src={A.astronautFace} className="absolute inset-[6%] size-[88%]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
