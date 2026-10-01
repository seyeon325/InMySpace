/* eslint-disable @next/next/no-img-element */
import type { ImgHTMLAttributes } from "react";

/** Figma에서 가져온 픽셀 아트 이미지. 확대해도 흐려지지 않게 pixelated로 그린다. */
export function Px({ className = "", alt = "", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt={alt} draggable={false} className={`pixelated select-none ${className}`} {...props} />;
}
