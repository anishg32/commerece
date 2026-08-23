"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Package } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-secondary text-muted-foreground ${fallbackClassName || className}`}
        style={props.fill ? { position: "absolute", inset: 0 } : {}}
      >
        <Package className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-xs font-medium">Image unavailable</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div
          className={`absolute inset-0 bg-secondary animate-pulse`}
          style={{ zIndex: 1 }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        {...props}
      />
    </>
  );
}
