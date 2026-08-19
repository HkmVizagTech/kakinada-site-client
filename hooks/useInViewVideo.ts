"use client";

import { useEffect } from "react";

/**
 * Sends a YouTube IFrame API command to an iframe element.
 */
function ytCommand(iframe: HTMLIFrameElement, func: string) {
  iframe.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args: "" }),
    "*"
  );
}

/**
 * Observes a container element and plays/pauses child videos based on
 * viewport visibility.
 *
 * Works with:
 * - HTML5 `<video>` elements (calls .play() / .pause())
 * - YouTube iframes (sends postMessage commands; requires `enablejsapi=1`)
 *
 * @param options.threshold  IntersectionObserver threshold (default 0.25)
 */
export default function useInViewVideo(
  containerRef: React.RefObject<HTMLElement | null>,
  options?: { threshold?: number }
) {
  const threshold = options?.threshold ?? 0.25;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const play = () => {
      // HTML5 videos
      el.querySelectorAll<HTMLVideoElement>("video").forEach((v) => {
        v.play().catch(() => {});
      });
      // YouTube iframes
      el.querySelectorAll<HTMLIFrameElement>('iframe[src*="youtube"]').forEach(
        (f) => ytCommand(f, "playVideo")
      );
    };

    const pause = () => {
      el.querySelectorAll<HTMLVideoElement>("video").forEach((v) => v.pause());
      el.querySelectorAll<HTMLIFrameElement>('iframe[src*="youtube"]').forEach(
        (f) => ytCommand(f, "pauseVideo")
      );
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else pause();
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, threshold]);
}
