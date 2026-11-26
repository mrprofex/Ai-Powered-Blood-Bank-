import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Camera, Mesh, Plane, Program, Renderer, Transform } from 'ogl';
import type { AppPage } from '../../types/navigation.ts';
import type { UserRole } from '../../../../shared/constants/bloodNetwork.ts';

interface CarouselSlide {
  id: string;
  indexLabel: string;
  title: string;
  subtitle: string;
  metric: string;
  imageSrc: string;
  imageAlt: string;
  targetRole: UserRole;
  targetPage: AppPage;
  ctaLabel: string;
}

const SLIDES: CarouselSlide[] = [
  {
    id: 'triage',
    indexLabel: '01',
    title: 'Hospital Emergency Triage',
    subtitle:
      'Submit schema-validated PRBC, platelet, and plasma requests and track allocation ETAs across metropolitan corridors.',
    metric: '28 min mean simulated match',
    imageSrc: '/src/assets/images/carousel_hospital_triage_1795672724842.jpg',
    imageAlt: 'Modern hospital transfusion coordination desk in bright daylight',
    targetRole: 'HOSPITAL_COORDINATOR',
    targetPage: 'hospital',
    ctaLabel: 'Open Hospital Portal',
  },
  {
    id: 'vault',
    indexLabel: '02',
    title: 'Cold-Chain Blood Bank Vaults',
    subtitle:
      'Track batch-level cold storage, isolate units within 72 hours of expiry for FEFO priority transfer, and audit every movement.',
    metric: '72h expiry wastage watch',
    imageSrc: '/src/assets/images/carousel_coldchain_logistics_1795672724484.jpg',
    imageAlt: 'Medical cold-chain blood storage vault and sterile stainless counter',
    targetRole: 'BLOOD_BANK_OFFICER',
    targetPage: 'blood-bank',
    ctaLabel: 'Open Blood Bank Portal',
  },
  {
    id: 'lab',
    indexLabel: '03',
    title: 'Shortage Risk Forecasting',
    subtitle:
      'Compare 7-day and 30-day blood group days-of-cover against institutional thresholds before critical stockouts develop.',
    metric: '8 ABO/Rh groups monitored',
    imageSrc: '/src/assets/images/login_botanical_lab_visual_1795672723756.jpg',
    imageAlt: 'Clean blood safety diagnostics lab with forest green glass partitions',
    targetRole: 'ADMIN',
    targetPage: 'predictions',
    ctaLabel: 'Explore Forecasts',
  },
];

/**
 * Lightweight OGL WebGL Ambient Plane Surface
 * Provides subtle smooth organic forest-green botanical wave shading behind the Flex Carousel
 */
function OglBackdropCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let renderer: Renderer | null = null;
    let frameId = 0;

    try {
      renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio, 1.5) });
      const gl = renderer.gl;
      container.appendChild(gl.canvas);
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';
      gl.canvas.style.display = 'block';

      const camera = new Camera(gl, { fov: 35 });
      camera.position.z = 2.4;

      const scene = new Transform();
      const geometry = new Plane(gl, { width: 4.5, height: 2.2, widthSegments: 24, heightSegments: 12 });

      const program = new Program(gl, {
        vertex: /* glsl */ `
          attribute vec3 position;
          attribute vec2 uv;
          uniform mat4 modelViewMatrix;
          uniform mat4 projectionMatrix;
          uniform float uTime;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            vUv = uv;
            vec3 pos = position;
            float wave = sin(pos.x * 1.4 + uTime * 0.65) * cos(pos.y * 1.8 + uTime * 0.45) * 0.06;
            pos.z += wave;
            vWave = wave;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragment: /* glsl */ `
          precision highp float;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            vec3 base = vec3(0.949, 0.961, 0.945);
            vec3 forest = vec3(0.071, 0.239, 0.169);
            float mixFactor = smoothstep(-0.06, 0.06, vWave) * 0.10 + (1.0 - vUv.y) * 0.05;
            vec3 color = mix(base, forest, mixFactor);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        uniforms: {
          uTime: { value: 0 },
        },
        transparent: false,
      });

      const mesh = new Mesh(gl, { geometry, program });
      mesh.setParent(scene);

      const resize = () => {
        if (!renderer || !container) return;
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 360;
        renderer.setSize(width, height);
        camera.perspective({ aspect: width / height });
      };

      resize();
      window.addEventListener('resize', resize);

      let start = performance.now();
      const renderLoop = (now: number) => {
        if (!renderer) return;
        if (!prefersReduced) {
          program.uniforms.uTime.value = (now - start) * 0.001;
        }
        renderer.render({ scene, camera });
        if (!prefersReduced) {
          frameId = window.requestAnimationFrame(renderLoop);
        }
      };

      frameId = window.requestAnimationFrame(renderLoop);

      return () => {
        window.removeEventListener('resize', resize);
        window.cancelAnimationFrame(frameId);
        if (gl.canvas.parentElement === container) {
          container.removeChild(gl.canvas);
        }
      };
    } catch {
      return undefined;
    }
  }, []);

  return <div ref={containerRef} aria-hidden="true" className="absolute inset-0 pointer-events-none" />;
}

export function FlexCarouselOGL({
  onSelectPortal,
}: {
  onSelectPortal: (role: UserRole, page: AppPage) => void;
}) {
  const [activeId, setActiveId] = useState<string>('triage');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--bn-border)] bg-[var(--bn-soft-bg)] p-4 sm:p-6">
      <OglBackdropCanvas />

      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:h-[380px]">
        {SLIDES.map((slide) => {
          const isActive = activeId === slide.id;
          return (
            <div
              key={slide.id}
              onClick={() => setActiveId(slide.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveId(slide.id);
                }
              }}
              aria-expanded={isActive}
              className={`group relative overflow-hidden rounded-xl border border-[var(--bn-border)] bg-white transition-[flex-grow,box-shadow] duration-300 ease-out cursor-pointer flex flex-col justify-end min-h-[240px] lg:min-h-0 ${
                isActive
                  ? 'lg:flex-[2.4] shadow-[0_14px_34px_rgba(14,50,36,0.14)]'
                  : 'lg:flex-[1] hover:border-[var(--bn-border-hover)]'
              }`}
            >
              {!imgErrors[slide.id] ? (
                <img
                  src={slide.imageSrc}
                  alt={slide.imageAlt}
                  referrerPolicy="no-referrer"
                  onError={() => setImgErrors((prev) => ({ ...prev, [slide.id]: true }))}
                  className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 ${
                    isActive ? 'scale-[1.02]' : 'scale-100 opacity-85 group-hover:scale-[1.03]'
                  }`}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#F2F5F1] to-[#DCE3DC]" />
              )}

              {/* Measured Forest-Green Contrast Scrim */}
              <div
                aria-hidden="true"
                className={`absolute inset-0 transition-opacity duration-300 ${
                  isActive
                    ? 'bg-gradient-to-t from-[#123D2B]/95 via-[#123D2B]/55 to-transparent'
                    : 'bg-gradient-to-t from-[#123D2B]/90 via-[#123D2B]/45 to-[#123D2B]/15'
                }`}
              />

              <div className="relative z-10 p-5 text-white">
                <div className="flex items-center justify-between gap-2 text-xs text-white/80">
                  <span className="font-mono-tabular font-semibold">{slide.indexLabel}</span>
                  {isActive ? (
                    <span className="font-mono-tabular text-[11px] text-[#DCE3DC]">
                      {slide.metric} · DEMO DATA
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-white">
                  {slide.title}
                </h3>

                {isActive ? (
                  <div className="mt-2 space-y-3">
                    <p className="max-w-lg text-xs leading-relaxed text-white/90 sm:text-sm">
                      {slide.subtitle}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPortal(slide.targetRole, slide.targetPage);
                      }}
                      className="clinical-btn inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-[#123D2B] hover:bg-[#F2F5F1] whitespace-nowrap"
                    >
                      {slide.ctaLabel}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-white/75 line-clamp-2">{slide.metric}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
