'use client';

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = window.scrollY;
  const target = el.getBoundingClientRect().top + start;
  const duration = 1000;
  const startTime = performance.now();

  function ease(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, start + (target - start) * ease(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

export function ScrollLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button onClick={() => scrollTo(to)} className={className}>
      {children}
    </button>
  );
}
