"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const subscribe = () => () => {};

/** 브라우저 저장소(localStorage) 데이터를 쓰는 화면은 클라이언트에서만 그린다. */
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return mounted ? children : fallback;
}
