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
        className={`flex items-center justify-center bg-secondary ${fallbackClassName || className}`}
        style={props.fill ? { position: "absolute", inset: 0 } : {}}
      >
        <Package className="w-10 h-10 text-muted-foreground/30" />
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
