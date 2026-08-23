"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, GripVertical, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedImage {
  url: string;
  publicId?: string;
  file?: File;
  isUploading?: boolean;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  primaryIndex?: number;
  onPrimaryChange?: (index: number) => void;
  maxImages?: number;
  folder?: string;
}

export function ImageUploader({
  images,
  onChange,
  primaryIndex = 0,
  onPrimaryChange,
  maxImages = 10,
  folder = "products",
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (images.length + files.length > maxImages) {
        alert(`Maximum ${maxImages} images allowed`);
        return;
      }

      setUploading(true);
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("folder", folder);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Upload failed");
        }

        const data = await res.json();
        const newImages: UploadedImage[] = data.images.map(
          (img: { url: string; publicId: string }) => ({
            url: img.url,
            publicId: img.publicId,
          })
        );

        onChange([...images, ...newImages]);
      } catch (error: unknown) {
        alert(error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Failed to upload images");
      } finally {
        setUploading(false);
      }
    },
    [images, onChange, maxImages, folder]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length > 0) uploadFiles(files);
    },
    [uploadFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) uploadFiles(files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [uploadFiles]
  );

  const removeImage = async (index: number) => {
    const img = images[index];
    if (img.publicId) {
      try {
        await fetch("/api/upload/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: img.publicId }),
        });
      } catch (e) {
        console.error("Failed to delete from Cloudinary:", e);
      }
    }
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    if (primaryIndex >= newImages.length && onPrimaryChange) {
      onPrimaryChange(Math.max(0, newImages.length - 1));
    }
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const newImages = [...images];
    const [dragged] = newImages.splice(dragIndex, 1);
    newImages.splice(index, 0, dragged);
    onChange(newImages);

    // Update primary index if it was affected
    if (onPrimaryChange) {
      if (dragIndex === primaryIndex) {
        onPrimaryChange(index);
      } else if (
        dragIndex < primaryIndex &&
        index >= primaryIndex
      ) {
        onPrimaryChange(primaryIndex - 1);
      } else if (
        dragIndex > primaryIndex &&
        index <= primaryIndex
      ) {
        onPrimaryChange(primaryIndex + 1);
      }
    }
    setDragIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-secondary/30"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium">
          {uploading
            ? "Uploading..."
            : "Drag & drop images here or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PNG, JPG, WebP up to 10MB • Max {maxImages} images
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={img.url + index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={() => setDragIndex(null)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 group cursor-move ${
                index === primaryIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              }`}
            >
              <Image
                src={img.url}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="200px"
              />
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <GripVertical className="w-5 h-5 text-white absolute top-2 left-2" />
                {onPrimaryChange && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrimaryChange(index);
                    }}
                    title="Set as primary image"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        index === primaryIndex ? "fill-yellow-500 text-yellow-500" : ""
                      }`}
                    />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {/* Primary badge */}
              {index === primaryIndex && (
                <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
