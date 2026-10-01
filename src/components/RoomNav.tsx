"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { A } from "@/lib/assets";
import { Px } from "./Px";

export const ROOMS = [
  { href: "/", label: "조종실", icon: A.roomControl },
  { href: "/orbit", label: "궤도관리실", icon: A.roomOrbit },
  { href: "/mind", label: "마음 정류장", icon: A.roomMind },
  { href: "/dream", label: "꿈 기록실", icon: A.roomDream },
  { href: "/my-space", label: "마이 스페이스", icon: A.roomMySpace },
] as const;

/** 상단 로고 + 다섯 개의 방으로 이동하는 메뉴 (Figma: 헤더) */
export function RoomNav() {
  const pathname = usePathname();

  return (
    <section className="mx-auto max-w-[1133px] px-4 pt-6 md:pt-[53px]">
      <Link href="/" className="mx-auto block w-[200px] md:w-[326px]" aria-label="InMySpace 홈">
        <Px src={A.heroLogo} alt="IN MY SPACE" className="aspect-square w-full" />
      </Link>

      <nav aria-label="방 이동" className="relative -mt-8 md:-mt-[100px]">
        <div className="absolute inset-x-0 bottom-0 h-[56%] rounded-[30px] bg-nav-band" />
        <ul className="relative grid grid-cols-5 px-1 pb-3 md:px-[60px] md:pb-5">
          {ROOMS.map((room) => {
            const active = room.href === "/" ? pathname === "/" : pathname.startsWith(room.href);
            return (
              <li key={room.href}>
                <Link
                  href={room.href}
                  aria-current={active ? "page" : undefined}
                  className="group flex flex-col items-center gap-1 md:gap-2"
                >
                  <Px
                    src={room.icon}
                    className={`aspect-square w-[54px] transition-transform group-hover:-translate-y-1 sm:w-[90px] md:w-[135px] ${
                      active ? "drop-shadow-[0_6px_10px_rgba(117,141,255,0.45)]" : ""
                    }`}
                  />
                  <span
                    className={`font-pixel text-[11px] leading-tight whitespace-nowrap sm:text-base md:text-xl ${
                      active ? "text-primary-strong" : "text-ink"
                    }`}
                  >
                    {room.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}
