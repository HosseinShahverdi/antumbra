"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { SplitWords } from "@/components/ui/SplitWords";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { fragmentShader, vertexShader, obscuration, MOON_R } from "./eclipse/shader";

const LIMIT_X = 3.2;
const LIMIT_Y = 1.7;
const TOTAL_EPS = MOON_R - 1 + 0.012;

function phaseOf(x: number, y: number) {
  const d = Math.hypot(x, y);
  if (d <= TOTAL_EPS) return "Totality";
  if (d >= 1 + MOON_R) return x < 0 ? "Before first contact" : "After last contact";
  return x < 0 ? "Partial · contacts I–II" : "Partial · contacts III–IV";
}

/**
 * The instrument: a Three.js shader eclipse the visitor drives by dragging,
 * by the range input, or with arrow keys. One canvas, one job. Replaced by a
 * static CSS rendering under reduced motion or if WebGL is unavailable.
 */
export function Instrument() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const fbSun = useRef<HTMLDivElement>(null);
  const fbMoon = useRef<HTMLDivElement>(null);
  const out = useRef<Record<string, HTMLElement | null>>({});
  const target = useRef({ x: -2.35, y: 0.32 });
  const current = useRef({ x: -2.35, y: 0.32 });
  const touched = useRef(false);
  const [mode, setMode] = useState<"pending" | "webgl" | "fallback">("pending");
  const [total, setTotal] = useState(false);

  /** write the live readout straight to the DOM — no React render per frame */
  const writeReadout = (x: number, y: number) => {
    const d = Math.hypot(x, y);
    const cover = obscuration(d, 1, MOON_R);
    const mag = Math.max(0, (1 + MOON_R - d) / 2);
    const o = out.current;
    if (o.mag) o.mag.textContent = mag.toFixed(3);
    if (o.obs) o.obs.textContent = `${(cover * 100).toFixed(1)}%`;
    if (o.phase) o.phase.textContent = phaseOf(x, y);
    if (o.marker) o.marker.style.left = `${((Math.max(-LIMIT_X, Math.min(LIMIT_X, x)) + LIMIT_X) / (2 * LIMIT_X)) * 100}%`;
    return { d, cover };
  };

  const setTarget = (x: number, y: number) => {
    let nx = Math.max(-LIMIT_X, Math.min(LIMIT_X, x));
    let ny = Math.max(-LIMIT_Y, Math.min(LIMIT_Y, y));
    if (Math.hypot(nx, ny) < 0.07) {
      nx = 0;
      ny = 0;
    }
    target.current = { x: nx, y: ny };
    if (range.current && document.activeElement !== range.current) range.current.value = nx.toFixed(2);
  };

  // decide the rendering path once on mount
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (prefersReducedMotion()) return setMode("fallback");
      try {
        const c = document.createElement("canvas");
        const ok = !!(c.getContext("webgl2") || c.getContext("webgl"));
        setMode(ok ? "webgl" : "fallback");
      } catch {
        setMode("fallback");
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  // ── WebGL path ──────────────────────────────────────────────
  useEffect(() => {
    if (mode !== "webgl") return;
    const el = host.current;
    const stg = stage.current;
    if (!el || !stg) return;
    let disposed = false;
    let raf = 0;
    let visible = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
      } catch {
        setMode("fallback");
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.className = "absolute inset-0 h-full w-full";
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const geometry = new THREE.PlaneGeometry(2, 2);
      const uniforms = {
        uRes: { value: new THREE.Vector2(1, 1) },
        uCenter: { value: new THREE.Vector2(0, 0) },
        uRadius: { value: 100 },
        uTime: { value: 0 },
        uMoon: { value: new THREE.Vector2(current.current.x, current.current.y) },
        uCover: { value: 0 },
        uTotal: { value: 0 },
      };
      const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, depthTest: false, depthWrite: false });
      scene.add(new THREE.Mesh(geometry, material));
      const size = new THREE.Vector2();

      const resize = () => {
        const w = stg.clientWidth;
        const h = stg.clientHeight;
        renderer.setSize(w, h, false);
        renderer.getDrawingBufferSize(size);
        const pr = renderer.getPixelRatio();
        const mobile = w < 768;
        uniforms.uRes.value.copy(size);
        uniforms.uRadius.value = Math.min(w, h) * (mobile ? 0.25 : 0.19) * pr;
        // gl_FragCoord.y runs bottom-up: on phones the sun sits below the heading
        uniforms.uCenter.value.set(size.x / 2, size.y * (mobile ? 0.45 : 0.48));
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(stg);

      let totalEase = 0;
      let wasTotal = false;
      const clock = new THREE.Clock();
      const frame = () => {
        raf = 0;
        if (!visible || document.hidden) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        const c = current.current;
        const tg = target.current;
        const k = 1 - Math.pow(0.0009, dt);
        c.x += (tg.x - c.x) * k;
        c.y += (tg.y - c.y) * k;
        const { d, cover } = writeReadout(c.x, c.y);
        const isTotal = d <= TOTAL_EPS;
        totalEase += ((isTotal ? 1 : 0) - totalEase) * Math.min(1, dt * 2.2);
        if (isTotal !== wasTotal) {
          wasTotal = isTotal;
          setTotal(isTotal);
        }
        uniforms.uTime.value += dt;
        uniforms.uMoon.value.set(c.x, c.y);
        uniforms.uCover.value = cover;
        uniforms.uTotal.value = totalEase;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      };
      const start = () => {
        if (!raf && visible && !document.hidden) {
          clock.getDelta();
          raf = requestAnimationFrame(frame);
        }
      };

      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible) start();
        },
        { rootMargin: "100px" },
      );
      io.observe(stg);
      const onVis = () => start();
      document.addEventListener("visibilitychange", onVis);

      const onLost = (e: Event) => {
        e.preventDefault();
        setMode("fallback");
      };
      renderer.domElement.addEventListener("webglcontextlost", onLost);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        renderer.domElement.removeEventListener("webglcontextlost", onLost);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [mode]);

  // ── fallback path: static CSS eclipse, moved directly by input ──
  useEffect(() => {
    if (mode !== "fallback") return;
    let raf = 0;
    const loop = () => {
      const tg = target.current;
      current.current = { ...tg };
      const { d } = writeReadout(tg.x, tg.y);
      const sun = fbSun.current;
      const moon = fbMoon.current;
      if (sun && moon) {
        const R = sun.offsetWidth / 2;
        moon.style.transform = `translate(${tg.x * R}px, ${-tg.y * R}px)`;
        sun.style.boxShadow = d <= TOTAL_EPS ? "0 0 0 2px #efece5, 0 0 60px 18px rgba(239,236,229,.35), 0 0 180px 60px rgba(239,236,229,.12)" : "0 0 90px 30px rgba(239,236,229,.25)";
      }
      setTotal(d <= TOTAL_EPS);
      raf = 0;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    schedule();
    window.addEventListener("antumbra:moon", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("antumbra:moon", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [mode]);

  const nudgeFallback = () => window.dispatchEvent(new Event("antumbra:moon"));

  // ── dragging on the stage ─────────────────────────────────
  useEffect(() => {
    const stg = stage.current;
    if (!stg) return;
    let drag: { id: number; x: number; y: number } | null = null;
    const unit = () => Math.min(stg.clientWidth, stg.clientHeight) * (stg.clientWidth < 768 ? 0.25 : 0.19);
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
      touched.current = true;
      stg.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const u = unit();
      const t = target.current;
      setTarget(t.x + (e.clientX - drag.x) / u, t.y - (e.clientY - drag.y) / u);
      drag.x = e.clientX;
      drag.y = e.clientY;
      nudgeFallback();
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      const t = target.current;
      if (Math.hypot(t.x, t.y) < 0.16) setTarget(0, 0);
      if (range.current) range.current.value = target.current.x.toFixed(2);
      nudgeFallback();
    };
    stg.addEventListener("pointerdown", down);
    stg.addEventListener("pointermove", move);
    stg.addEventListener("pointerup", up);
    stg.addEventListener("pointercancel", up);
    return () => {
      stg.removeEventListener("pointerdown", down);
      stg.removeEventListener("pointermove", move);
      stg.removeEventListener("pointerup", up);
      stg.removeEventListener("pointercancel", up);
    };
  }, []);

  // ── entrance: headline, and a slow teaser glide if untouched ──
  useGSAP(
    () => {
      gsap.from("#instrument-title .split-inner", {
        yPercent: 110,
        duration: 1.4,
        stagger: 0.06,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 60%" },
      });
      gsap.from("[data-inst-fade]", { y: 20, autoAlpha: 0, duration: 1.2, stagger: 0.08, scrollTrigger: { trigger: root.current, start: "top 55%" } });
      if (prefersReducedMotion()) return;
      const glide = { x: target.current.x };
      gsap.to(glide, {
        x: -1.25,
        duration: 3.2,
        ease: "power2.inOut",
        scrollTrigger: { trigger: root.current, start: "top 45%", once: true },
        onUpdate: () => {
          if (!touched.current) setTarget(glide.x, 0.32 * (1 - (glide.x + 2.35) / 1.1) + 0.0);
        },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="instrument"
      aria-labelledby="instrument-title"
      className="relative h-[100svh] min-h-[42rem] overflow-hidden bg-[#050505] text-bone"
    >
      {/* stage: canvas or fallback, draggable */}
      <div ref={stage} className="absolute inset-0 touch-none select-none" data-cursor="Drag">
        <div ref={host} className="absolute inset-0" />
        {mode === "fallback" ? (
          <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
            <div className="relative aspect-square w-[50vw] max-w-[22rem] translate-y-[2vh] md:w-[38vmin] md:max-w-none">
              <div ref={fbSun} className="absolute inset-0 rounded-full bg-bone" style={{ boxShadow: "0 0 90px 30px rgba(239,236,229,.25)" }} />
              <div ref={fbMoon} className="absolute -inset-[2%] rounded-full bg-[#050505]" />
            </div>
          </div>
        ) : null}
        {mode === "pending" ? <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(closest-side,#1b1b1c,#050505)]" /> : null}
      </div>

      {/* heading */}
      <div className="pointer-events-none relative z-10 grid grid-cols-1 gap-6 px-[var(--gutter)] pt-[calc(var(--nav-h)+2rem)] md:grid-cols-12">
        <div className="md:col-span-7">
          <p data-inst-fade className="label mb-5 text-mist">
            <span className="text-smoke">§ 05 —</span> The instrument
          </p>
          <SplitWords as="h2" id="instrument-title" text="Make your own eclipse." className="display text-[clamp(2.3rem,5.2vw,5.4rem)] [--wght:220]" />
        </div>
        <p data-inst-fade className="hidden max-w-xs self-end text-[0.95rem] leading-relaxed text-mist md:col-span-4 md:col-start-9 md:block md:justify-self-end">
          Drag the moon across the sun. Every crown we make is designed in this light — the last thin ring before the dark.
        </p>
        <p data-inst-fade className="label -mt-2 text-smoke md:hidden">
          Drag the moon across the sun
        </p>
      </div>

      {/* totality message */}
      <div
        aria-live="polite"
        className={`pointer-events-none absolute inset-x-0 top-[64%] z-10 flex flex-col items-center gap-4 text-center transition-all duration-1000 ease-[var(--ease-out-soft)] md:top-[66%] ${
          total ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {total ? (
          <>
            <p className="serif-i text-[clamp(2.2rem,4.6vw,4.4rem)] leading-none">Totality.</p>
            <div className="pointer-events-auto" data-no-drag>
              <ButtonLink href="#fittings" icon="arrowRight">
                Now, book a fitting
              </ButtonLink>
            </div>
          </>
        ) : null}
      </div>

      {/* readout + control */}
      <div data-no-drag className="absolute inset-x-0 bottom-0 z-10 px-[var(--gutter)] pb-[clamp(1.25rem,4vh,2.5rem)]">
        <div data-inst-fade className="relative mb-5 h-px bg-bone/15" aria-hidden="true">
          {[0.18, 0.5, 0.82].map((p, i) => (
            <span key={p} className="label absolute -top-6 -translate-x-1/2 whitespace-nowrap text-[0.55rem] text-smoke" style={{ left: `${p * 100}%` }}>
              {["I · II", "Totality", "III · IV"][i]}
            </span>
          ))}
          <span
            ref={(n) => {
              out.current.marker = n;
            }}
            className="absolute -top-1 size-2 -translate-x-1/2 rounded-full bg-bone shadow-[0_0_10px_2px_rgba(239,236,229,.6)]"
            style={{ left: "13%" }}
          />
        </div>

        <div data-inst-fade className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-12 md:items-end">
          <dl className="contents">
            <div className="md:col-span-2">
              <dt className="label text-smoke">Magnitude</dt>
              <dd
                ref={(n) => {
                  out.current.mag = n;
                }}
                className="font-mono text-lg tabular-nums"
              >
                0.000
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="label text-smoke">Obscuration</dt>
              <dd
                ref={(n) => {
                  out.current.obs = n;
                }}
                className="font-mono text-lg tabular-nums"
              >
                0.0%
              </dd>
            </div>
            <div className="col-span-2 md:col-span-3">
              <dt className="label text-smoke">Phase</dt>
              <dd
                ref={(n) => {
                  out.current.phase = n;
                }}
                className="font-mono text-lg"
              >
                Before first contact
              </dd>
            </div>
          </dl>
          <label className="col-span-2 flex items-center gap-4 md:col-span-5">
            <span className="label shrink-0 text-smoke">
              <Icon name="drag" size={16} className="mr-1.5 inline" />
              Moon
            </span>
            <input
              ref={range}
              type="range"
              min={-LIMIT_X}
              max={LIMIT_X}
              step={0.01}
              defaultValue={-2.35}
              aria-label="Move the moon across the sun"
              onChange={(e) => {
                touched.current = true;
                setTarget(Number(e.target.value), 0);
                nudgeFallback();
              }}
              className="h-8 w-full cursor-pointer appearance-none bg-transparent accent-bone [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-bone [&::-moz-range-track]:h-px [&::-moz-range-track]:bg-bone/30 [&::-webkit-slider-runnable-track]:h-px [&::-webkit-slider-runnable-track]:bg-bone/30 [&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-bone"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
