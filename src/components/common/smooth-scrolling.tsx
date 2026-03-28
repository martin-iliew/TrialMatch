"use client";

import { ReactLenis } from "lenis/react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import type { LenisRef } from "lenis/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
function SmoothScrolling({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef | null>(null);

  useEffect(() => {
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
      ScrollTrigger.update();
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        lerp: 0.07,
        smoothWheel: true,
      }}
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  );
}

export default SmoothScrolling;
