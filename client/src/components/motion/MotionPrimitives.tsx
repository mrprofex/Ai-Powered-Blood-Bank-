import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react';

function isTouchOrReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return coarse || reduced || navigator.maxTouchPoints > 0;
}

/**
 * Top hairline reading progress indicator synced to scroll position
 */
export function ScrollProgressBar() {
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  if (prefersReduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX, transformOrigin: '0% 50%' }}
      className="fixed top-0 left-0 right-0 z-[70] h-[2.5px] bg-gradient-to-r from-[var(--bn-primary)] via-[var(--bn-accent)] to-[var(--bn-secondary)] pointer-events-none"
    />
  );
}

/**
 * Smooth animated tabular-numeral counter for KPI metrics
 */
export function AnimatedCounter({
  value,
  durationMs = 950,
  locale = 'en-IN',
  suffix = '',
  prefix = '',
}: {
  value: number;
  durationMs?: number;
  locale?: string;
  suffix?: string;
  prefix?: string;
}) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [displayValue, setDisplayValue] = useState<number>(prefersReduced ? value : 0);

  useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(value);
      return;
    }
    if (!isInView) return;

    let frameId = 0;
    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      // Quintic ease-out for calm luxury deceleration
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.round(from + (value - from) * eased));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [value, durationMs, isInView, prefersReduced]);

  return (
    <span ref={ref} className="font-mono-tabular">
      {prefix}
      {displayValue.toLocaleString(locale)}
      {suffix}
    </span>
  );
}

/**
 * Interactive cursor-tracking spotlight card with optional subtle elevation tilt
 */
export function SpotlightCard({
  children,
  className = '',
  onClick,
  asButton = false,
  spotlightColor = 'var(--bn-spotlight)',
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  asButton?: boolean;
  spotlightColor?: string;
}) {
  const prefersReduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false });

  const handleMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (prefersReduced || isTouchOrReducedMotion() || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    });
  };

  const handleLeave = () => {
    setMousePos((prev) => ({ ...prev, active: false }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      role={asButton ? 'button' : undefined}
      tabIndex={asButton ? 0 : undefined}
      onKeyDown={
        asButton && onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      data-cursor={asButton ? 'target' : undefined}
      className={`clinical-card relative overflow-hidden ${
        asButton ? 'clinical-card-interactive cursor-pointer text-left' : ''
      } ${className}`}
    >
      {/* Dynamic cursor-reactive ambient sheen */}
      {!prefersReduced ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: mousePos.active ? 1 : 0,
            background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 70%)`,
          }}
        />
      ) : null}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

/**
 * Magic UI Cursor + React Bits Target Cursor hybrid:
 * - Renders subtle theme-adaptive cursor glow & target reticle on desktop pointers
 * - Never intercepts pointer events or blocks typing/scrolling
 * - Automatically disabled on touch devices and prefers-reduced-motion
 */
export function TargetCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isTargeting, setIsTargeting] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const glowRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isTouchOrReducedMotion()) {
      setEnabled(false);
      return;
    }
    setEnabled(true);

    let mouseX = -200;
    let mouseY = -200;
    let ringX = -200;
    let ringY = -200;
    let frameId = 0;

    const handleMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      setVisible(true);

      const target = event.target as HTMLElement | null;
      if (!target) return;

      const formElement = target.closest('input, textarea, select, [contenteditable="true"]');
      setIsInputFocused(Boolean(formElement));

      const interactive = target.closest(
        'button, a, [role="button"], [data-cursor="target"]',
      );
      setIsTargeting(Boolean(interactive) && !formElement);
    };

    const handleLeave = () => {
      setVisible(false);
      setIsTargeting(false);
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      frameId = window.requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  if (!enabled || !visible || isInputFocused) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    >
      <div
        ref={glowRef}
        className="absolute top-0 left-0 h-36 w-36 rounded-full transition-opacity duration-200"
        style={{
          background:
            'radial-gradient(circle, var(--bn-glow) 0%, transparent 70%)',
          opacity: isTargeting ? 1 : 0.65,
        }}
      />

      <div
        ref={ringRef}
        className={`absolute top-0 left-0 rounded-full border transition-[width,height,border-color,opacity] duration-150 ${
          isTargeting
            ? 'h-10 w-10 border-[var(--bn-accent)] bg-[var(--bn-primary)]/[0.04]'
            : 'h-6 w-6 border-[var(--bn-primary)]/35'
        }`}
      />

      <div
        ref={dotRef}
        className={`absolute top-0 left-0 rounded-full bg-[var(--bn-primary)] transition-[width,height] duration-150 ${
          isTargeting ? 'h-1.5 w-1.5' : 'h-2 w-2'
        }`}
      />
    </div>
  );
}

/**
 * React Bits Magnet wrapper for primary buttons & key interactive triggers
 */
export function Magnet({
  children,
  strength = 0.2,
  className = '',
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (prefersReduced || isTouchOrReducedMotion() || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const clampedX = Math.max(-7, Math.min(7, dx * strength));
    const clampedY = Math.max(-7, Math.min(7, dy * strength));
    setOffset({ x: clampedX, y: clampedY });
  };

  const reset = () => setOffset({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      data-cursor="target"
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      className={`inline-flex ${className}`}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: 'transform 160ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * React Bits Blur Text reveal for display headlines
 */
export function BlurText({
  text,
  className = '',
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      initial={{ opacity: 0, filter: 'blur(6px)', y: 8 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      transition={{ duration: 0.44, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-block ${className}`}
    >
      {text}
    </motion.span>
  );
}

/**
 * React Bits Fade Content & Animated Content wrappers
 */
export function FadeContent({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.38, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function GlassSurface({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-surface rounded-xl ${className}`}>
      {children}
    </div>
  );
}
