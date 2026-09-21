"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const motionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window.matchMedia !== "function") return () => undefined;
  const media = window.matchMedia(motionQuery);
  media.addEventListener?.("change", callback);
  return () => media.removeEventListener?.("change", callback);
}

function getReducedMotionSnapshot() {
  return typeof window.matchMedia === "function" ? window.matchMedia(motionQuery).matches : false;
}

function getReducedMotionServerSnapshot() {
  return true;
}

export function HeroMotionVideo() {
  const rootRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (reducedMotion || playbackFailed || !rootRef.current || !videoRef.current) return;
    const root = rootRef.current;
    const video = videoRef.current;
    let substantiallyVisible = false;

    const syncPlayback = () => {
      if (!document.hidden && substantiallyVisible) {
        const playResult = video.play();
        if (playResult) {
          void playResult.catch(() => {
            setPlaybackFailed(true);
            setIsPlaying(false);
          });
        }
      } else {
        video.pause();
        setIsPlaying(false);
      }
    };

    const observer = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(([entry]) => {
          substantiallyVisible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
          syncPlayback();
        }, { threshold: [0, 0.35, 0.75] });

    if (observer) observer.observe(root);
    else {
      substantiallyVisible = true;
      syncPlayback();
    }
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, [playbackFailed, reducedMotion]);

  return (
    <figure
      className={`hero-motion${isPlaying ? " is-playing" : ""}`}
      ref={rootRef}
      aria-label="IncomeNow opportunity workflow showing a Pergola Business Kit, relevant resources, and offer preparation"
    >
      <Image
        alt="Pergola Business Kit connected to a CRM demo, source code, setup guide, and offer preparation panel"
        className="hero-motion-poster"
        fill
        preload
        sizes="(max-width: 767px) calc(100vw - 28px), (max-width: 1120px) calc(100vw - 48px), 56vw"
        src="/media/incomenow-hero-poster.webp"
      />
      {!reducedMotion && !playbackFailed ? (
        <video
          aria-hidden="true"
          autoPlay
          className="hero-motion-video"
          height={720}
          loop
          muted
          onError={() => setPlaybackFailed(true)}
          onPause={() => setIsPlaying(false)}
          onPlaying={() => setIsPlaying(true)}
          playsInline
          preload="auto"
          ref={videoRef}
          width={1280}
        >
          <source src="/media/incomenow-hero-motion-loop.webm" type="video/webm" />
          <source src="/media/incomenow-hero-motion-loop.mp4" type="video/mp4" />
        </video>
      ) : null}
    </figure>
  );
}
