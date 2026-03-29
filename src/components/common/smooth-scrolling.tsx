"use client";

import { ReactLenis } from "lenis/react";

function SmoothScrolling({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: true,
        syncTouchLerp: 0.075,
      }}
    >
      {children}
    </ReactLenis>
  );
}

export default SmoothScrolling;
