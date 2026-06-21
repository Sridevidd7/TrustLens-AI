import { useEffect, useState } from 'react';

interface CircularProgressRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function CircularProgressRing({ score, size = 96, strokeWidth = 8 }: CircularProgressRingProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    // Start from 0, then animate to target on next frame
    const id = requestAnimationFrame(() => setAnimated(score));
    return () => cancelAnimationFrame(id);
  }, [score]);

  const r    = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animated / 100) * circ;
  const cx   = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1F2937" strokeWidth={strokeWidth} />
        {/* Animated fill */}
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.25, 1, 0.5, 1)' }}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>
        </defs>
      </svg>
      {/* Animated counter label */}
      <AnimatedNumber target={score} className="absolute text-xl font-bold text-white" />
    </div>
  );
}

// Counts up from 0 → target over ~1 s
function AnimatedNumber({ target, className }: { target: number; className?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(ease * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return <span className={className}>{display}</span>;
}
