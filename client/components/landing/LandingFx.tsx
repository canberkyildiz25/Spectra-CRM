'use client';

/* The landing and sign-in choreography (design.md § Motion). Everything runs
 * once and settles; nothing loops. With reduced motion, .motion is never set
 * on <html>, so this returns early and the content is simply there.
 *
 *   .split            words rise behind a mask (on load with data-now, else on enter)
 *   .rise             fades up; data-delay in ms
 *   [data-readout-line] lines grow from the baseline, cold to hot
 *   .sweep            a stage's colour rule draws left to right
 *   [data-rail-seg]   the side rail fills while its stage is on screen
 *   .magnetic         leans toward a fine pointer
 */
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function splitWords(root: HTMLElement): HTMLElement[] {
  const walk = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (child.textContent ?? '').split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          const outer = document.createElement('span');
          outer.className = 'w';
          const inner = document.createElement('span');
          inner.textContent = part;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE && !(child as HTMLElement).classList.contains('w')) {
        walk(child);
      }
    });
  };
  walk(root);
  return [...root.querySelectorAll<HTMLElement>('.w > span')];
}

export default function LandingFx() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains('motion')) return;

    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>('.split').forEach((title) => {
        // Split once; a re-run (Strict Mode mounts effects twice) reuses the
        // spans instead of skipping the title and leaving it unanimated.
        const words = title.dataset.split
          ? [...title.querySelectorAll<HTMLElement>('.w > span')]
          : splitWords(title);
        title.dataset.split = '1';
        gsap.set(title, { visibility: 'visible' });
        const now = title.hasAttribute('data-now');
        gsap.fromTo(
          words,
          { yPercent: 118 },
          {
            yPercent: 0,
            duration: now ? 1.1 : 0.95,
            stagger: now ? 0.09 : 0.05,
            delay: now ? 0.15 : 0,
            ease: 'power4.out',
            scrollTrigger: now ? undefined : { trigger: title, start: 'top 88%', once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('.rise').forEach((el) => {
        const delay = Number(el.dataset.delay ?? 0) / 1000;
        const now = el.hasAttribute('data-now');
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            delay,
            ease: 'power3.out',
            scrollTrigger: now ? undefined : { trigger: el, start: 'top 90%', once: true },
          },
        );
      });

      const lines = gsap.utils.toArray<HTMLElement>('[data-readout-line]');
      if (lines.length) {
        gsap.fromTo(
          lines,
          { scaleY: 0 },
          { scaleY: 1, duration: 1.2, stagger: 0.045, delay: 0.45, ease: 'power3.out' },
        );
      }

      gsap.utils.toArray<HTMLElement>('.sweep').forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.1,
            ease: 'power3.inOut',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-rail-seg]').forEach((seg) => {
        const section = document.getElementById(seg.dataset.railSeg ?? '');
        if (!section) return;
        gsap.fromTo(
          seg,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top 60%', end: 'bottom 60%', scrub: 0.3 },
          },
        );
      });
    });

    html.classList.add('gsap-ready');

    // Magnetic CTA — only where a pointer can hover precisely.
    const cleanups: (() => void)[] = [];
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll<HTMLElement>('.magnetic').forEach((el) => {
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          gsap.to(el, {
            x: (e.clientX - (r.left + r.width / 2)) * 0.18,
            y: (e.clientY - (r.top + r.height / 2)) * 0.28,
            duration: 0.4,
            ease: 'power3.out',
          });
        };
        const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        cleanups.push(() => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerleave', leave);
        });
      });
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      window.removeEventListener('load', refresh);
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  return null;
}
