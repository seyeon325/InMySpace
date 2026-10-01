import Link from "next/link";
import { A } from "@/lib/assets";
import { Px } from "./Px";

const SERVICE = [
  { href: "/", label: "조종실" },
  { href: "/orbit", label: "궤도 관리실" },
  { href: "/mind", label: "마음 정류장" },
  { href: "/dream", label: "꿈 기록실" },
  { href: "/my-space", label: "마이 스페이스" },
];
const POLICY = ["개인정보 처리 방침", "데이터 사용 안내", "도움말", "AI 해석 참고 사항"];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden text-white md:mt-[120px]">
      <div className="absolute inset-0 bg-gradient-to-t from-[#c7b5ff] to-[#758cff] opacity-90 dark:opacity-50" />
      <Px src={A.constellation} className="pointer-events-none absolute top-0 left-[0.5%] w-[31%] opacity-30" />

      <div className="relative mx-auto max-w-[1440px] px-5 pt-10 pb-8 md:px-10 md:pt-12">
        <p className="font-pixel text-right text-base leading-7 text-light-1 md:mr-[300px] md:text-xl md:leading-8">
          우주를 유영하듯, 나의 리듬을 찾아가는 공간.
          <br />
          InMySpace.
        </p>

        <div className="mt-6 border-t-2 border-white/80 pt-4 md:mr-[300px]">
          <div className="grid grid-cols-2 gap-6 md:flex md:gap-0">
            <FooterColumn title="서비스">
              {SERVICE.map((s) => (
                <Link key={s.href} href={s.href} className="block border-b border-white/70 py-1 hover:underline">
                  {s.label}
                </Link>
              ))}
            </FooterColumn>
            <div className="hidden w-px self-stretch bg-white/80 md:mx-12 md:block" />
            <FooterColumn title="정책 및 안내">
              {POLICY.map((p) => (
                <span key={p} className="block border-b border-white/70 py-1">
                  {p}
                </span>
              ))}
            </FooterColumn>
            <div className="hidden w-px self-stretch bg-white/80 md:mx-12 md:block" />
            <div className="col-span-2 flex items-center gap-6 md:col-span-1">
              <div className="flex flex-col gap-3">
                <span className="flex h-10 w-[140px] items-center justify-center rounded-full border border-white/80">
                  <Px src={A.appleLogo} alt="App Store" className="h-[45px] w-[90px]" />
                </span>
                <span className="flex h-10 w-[140px] items-center justify-center rounded-full border border-white/80">
                  <Px src={A.googleLogo} alt="Google Play" className="h-5 w-24" />
                </span>
              </div>
              <Px src={A.footerStars} className="size-20 md:size-[115px]" />
            </div>
          </div>
        </div>

        <div className="mt-6 border-t-2 border-white/80 pt-6 md:mr-[300px]">
          <p className="font-pixel text-lg text-light-1 md:text-2xl">당신의 하루엔 당신만의 궤도가 있어요.</p>
        </div>
      </div>

      <Px src={A.footerLogo} alt="" className="absolute top-[156px] right-0 hidden size-[186px] md:block" />
      <Px src={A.footerRoom} alt="" className="absolute right-3 bottom-5 hidden h-[160px] w-[267px] md:block" />
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-[150px]">
      <p className="font-bit mb-2 text-xl md:text-2xl">{title}</p>
      <div className="font-pixel text-sm md:text-base">{children}</div>
    </div>
  );
}
