"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { ImageOff } from "lucide-react";

interface ProductImageProps extends Omit<ImageProps, "src" | "alt" | "onError"> {
  src: string | undefined | null;
  alt: string;
  fallbackClassName?: string;
}

export function ProductImage({
  src,
  alt,
  fallbackClassName = "",
  className = "",
  ...props
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  const isInvalidSrc = !src || (typeof src === 'string' && src.trim() === '');

  if (isInvalidSrc || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center overflow-hidden ${fallbackClassName || className}`}
        style={props.fill ? { position: "absolute", inset: 0 } : {}}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
        
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Shimmer animation */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s infinite ease-in-out",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-3 text-zinc-500">
          <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06]">
            <ImageOff className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <span className="text-xs font-medium tracking-wider uppercase">No Image</span>
        </div>

        {/* Inject shimmer keyframes */}
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={typeof src === 'string' && src.startsWith('/')}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
