"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";

export function ArtworkImage({
  src,
  alt,
  position = "50% 50%",
  sizes,
  className = "",
  preload = false,
}: {
  src: string;
  alt: string;
  position?: string;
  sizes: string;
  className?: string;
  preload?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className={`artwork-image ${className}${failed ? " artwork-image-failed" : ""}`}>
      {failed ? (
        <span className="artwork-fallback" role="img" aria-label={`${alt}. Artwork unavailable.`}>
          <ImageOff aria-hidden="true" size={24} />
          <span>Artwork unavailable</span>
        </span>
      ) : (
        <Image
          alt={alt}
          fill
          loading={preload ? undefined : "lazy"}
          onError={() => setFailed(true)}
          preload={preload}
          sizes={sizes}
          src={src}
          style={{ objectPosition: position }}
        />
      )}
    </figure>
  );
}
