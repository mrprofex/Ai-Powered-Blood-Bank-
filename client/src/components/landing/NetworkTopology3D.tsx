import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Activity,
  ArrowRight,
  Building2,
  Compass,
  Droplets,
  RotateCcw,
} from 'lucide-react';
import type { RegionalRiskItem } from '../../../../shared/types/network.ts';
import type { RiskLevel } from '../../../../shared/constants/bloodNetwork.ts';
import { RiskStatusIndicator } from '../ui/UiPrimitives.tsx';

interface HubNodeMeta {
  region: string;
  city: string;
  state: string;
  position: [number, number, number];
  riskLevel: RiskLevel;
  riskScore: number;
  totalUnits: number;
  hospitalsCount: number;
  bloodBanksCount: number;
  criticalGroups: string[];
  etaMinutes: number;
}

const DEFAULT_HUBS: HubNodeMeta[] = [
  {
    region: 'Delhi NCR Network',
    city: 'New Delhi',
    state: 'Delhi NCR',
    position: [-0.35, 0.2, -1.65],
    riskLevel: 'CRITICAL',
    riskScore: 74,
    totalUnits: 4110,
    hospitalsCount: 31,
    bloodBanksCount: 15,
    criticalGroups: ['AB-', 'O-'],
    etaMinutes: 26,
  },
  {
    region: 'Mumbai–Pune Corridor',
    city: 'Mumbai',
    state: 'Maharashtra',
    position: [-1.45, 0.2, 0.1],
    riskLevel: 'CRITICAL',
    riskScore: 78,
    totalUnits: 4620,
    hospitalsCount: 34,
    bloodBanksCount: 16,
    criticalGroups: ['O-', 'B-'],
    etaMinutes: 22,
  },
  {
    region: 'Hyderabad Central Grid',
    city: 'Hyderabad',
    state: 'Telangana',
    position: [-0.15, 0.2, 0.45],
    riskLevel: 'MODERATE',
    riskScore: 49,
    totalUnits: 2680,
    hospitalsCount: 25,
    bloodBanksCount: 11,
    criticalGroups: ['A-'],
    etaMinutes: 29,
  },
  {
    region: 'Bengaluru Urban Cluster',
    city: 'Bengaluru',
    state: 'Karnataka',
    position: [-0.3, 0.2, 1.35],
    riskLevel: 'MODERATE',
    riskScore: 54,
    totalUnits: 3890,
    hospitalsCount: 28,
    bloodBanksCount: 14,
    criticalGroups: ['O-'],
    etaMinutes: 24,
  },
  {
    region: 'Chennai Metro Hub',
    city: 'Chennai',
    state: 'Tamil Nadu',
    position: [0.65, 0.2, 1.45],
    riskLevel: 'LOW',
    riskScore: 28,
    totalUnits: 3120,
    hospitalsCount: 24,
    bloodBanksCount: 12,
    criticalGroups: [],
    etaMinutes: 21,
  },
];

const CORRIDORS: Array<[number, number]> = [
  [0, 1], // Delhi <-> Mumbai
  [0, 2], // Delhi <-> Hyderabad
  [1, 2], // Mumbai <-> Hyderabad
  [1, 3], // Mumbai <-> Bengaluru
  [2, 3], // Hyderabad <-> Bengaluru
  [2, 4], // Hyderabad <-> Chennai
  [3, 4], // Bengaluru <-> Chennai
];

function getRiskHex(risk: RiskLevel): number {
  if (risk === 'CRITICAL') return 0xc93440;
  if (risk === 'MODERATE') return 0xd97706;
  return 0x1d9b65;
}

export function NetworkTopology3D({
  regionalData,
  onExploreRegion,
}: {
  regionalData?: RegionalRiskItem[];
  onExploreRegion: (city: string) => void;
}) {
  const hubs: HubNodeMeta[] = DEFAULT_HUBS.map((hub) => {
    const matched = regionalData?.find((r) => r.region === hub.region);
    if (!matched) return hub;
    return {
      ...hub,
      riskLevel: matched.riskLevel,
      riskScore: matched.riskScore,
      totalUnits: matched.totalUnits,
      hospitalsCount: matched.hospitalsCount,
      bloodBanksCount: matched.bloodBanksCount,
      criticalGroups: matched.criticalGroups,
    };
  });

  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(1);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [webglReady, setWebglReady] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState<number>(0);

  const activeIdx = hoveredIdx ?? selectedIdx;
  const activeHub = hubs[activeIdx] ?? hubs[0];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let renderer: THREE.WebGLRenderer | null = null;
    let controls: OrbitControls | null = null;
    let frameId = 0;

    try {
      const width = container.clientWidth || 640;
      const height = container.clientHeight || 400;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x091d15, 0.085);

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 60);
      camera.position.set(2.9, 2.85, 3.8);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.cursor = 'grab';

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.enablePan = false;
      controls.minDistance = 3.1;
      controls.maxDistance = 6.8;
      controls.maxPolarAngle = Math.PI / 2.15;
      controls.minPolarAngle = Math.PI / 6;
      controls.autoRotate = !prefersReduced;
      controls.autoRotateSpeed = 0.55;

      // Studio Lighting
      const ambient = new THREE.AmbientLight(0xd9efe4, 0.85);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xfff4df, 1.55);
      keyLight.position.set(4, 6, 4);
      scene.add(keyLight);

      const rimLight = new THREE.PointLight(0x34d399, 1.4, 14);
      rimLight.position.set(-3.5, 2.5, -2.5);
      scene.add(rimLight);

      // Architectural Base Platform & Radar Rings
      const baseGroup = new THREE.Group();
      scene.add(baseGroup);

      const grid = new THREE.GridHelper(6.2, 22, 0x266549, 0x153b2b);
      grid.position.y = 0;
      baseGroup.add(grid);

      const ringGeo1 = new THREE.RingGeometry(1.9, 1.93, 72);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xb8863b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.42,
      });
      const outerRing = new THREE.Mesh(ringGeo1, ringMat);
      outerRing.rotation.x = -Math.PI / 2;
      outerRing.position.y = 0.01;
      baseGroup.add(outerRing);

      const ringGeo2 = new THREE.RingGeometry(1.15, 1.17, 64);
      const innerRingMat = new THREE.MeshBasicMaterial({
        color: 0x6ee7b7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25,
      });
      const innerRing = new THREE.Mesh(ringGeo2, innerRingMat);
      innerRing.rotation.x = -Math.PI / 2;
      innerRing.position.y = 0.01;
      baseGroup.add(innerRing);

      // Procedural 3D Hub Beacons (4-part composite nodes)
      const hitMeshes: THREE.Mesh[] = [];
      const haloRings: THREE.Mesh[] = [];
      const hubGroups: THREE.Group[] = [];

      hubs.forEach((hub, index) => {
        const colorHex = getRiskHex(hub.riskLevel);
        const group = new THREE.Group();
        group.position.set(hub.position[0], hub.position[1], hub.position[2]);

        // Pedestal disc
        const baseMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.2, 0.05, 28),
          new THREE.MeshStandardMaterial({
            color: 0x0e3224,
            metalness: 0.55,
            roughness: 0.3,
          }),
        );
        baseMesh.position.y = -0.17;
        group.add(baseMesh);

        // Glowing core orb
        const coreMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.125, 24, 24),
          new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 0.65,
            metalness: 0.2,
            roughness: 0.2,
          }),
        );
        coreMesh.position.y = 0.08;
        coreMesh.userData = { hubIndex: index };
        hitMeshes.push(coreMesh);
        group.add(coreMesh);

        // Orbiting telemetry halo
        const haloMesh = new THREE.Mesh(
          new THREE.TorusGeometry(0.22, 0.014, 12, 42),
          new THREE.MeshStandardMaterial({
            color: 0xf6d594,
            emissive: 0xb8863b,
            emissiveIntensity: 0.35,
            metalness: 0.7,
            roughness: 0.25,
          }),
        );
        haloMesh.position.y = 0.08;
        haloMesh.rotation.x = Math.PI / 2.3;
        haloRings.push(haloMesh);
        group.add(haloMesh);

        // Vertical beam spire
        const spireMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.012, 0.28, 12),
          new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.75,
          }),
        );
        spireMesh.position.y = -0.04;
        group.add(spireMesh);

        scene.add(group);
        hubGroups.push(group);
      });

      // Cold-Chain Corridor Arcs + Flowing Courier Particles
      const courierParticles: Array<{
        mesh: THREE.Mesh;
        curve: THREE.QuadraticBezierCurve3;
        speed: number;
        offset: number;
      }> = [];

      CORRIDORS.forEach(([fromIdx, toIdx], idx) => {
        const start = new THREE.Vector3(...hubs[fromIdx].position);
        start.y += 0.08;
        const end = new THREE.Vector3(...hubs[toIdx].position);
        end.y += 0.08;

        const mid = start.clone().add(end).multiplyScalar(0.5);
        mid.y += 0.45 + start.distanceTo(end) * 0.22;

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(44);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const isCriticalRoute =
          hubs[fromIdx].riskLevel === 'CRITICAL' || hubs[toIdx].riskLevel === 'CRITICAL';

        const lineMat = new THREE.LineBasicMaterial({
          color: isCriticalRoute ? 0xfbbf24 : 0x6ee7b7,
          transparent: true,
          opacity: isCriticalRoute ? 0.65 : 0.4,
        });
        const arcLine = new THREE.Line(lineGeo, lineMat);
        scene.add(arcLine);

        // Flowing courier pulse along each corridor
        const packet = new THREE.Mesh(
          new THREE.SphereGeometry(0.038, 12, 12),
          new THREE.MeshBasicMaterial({
            color: isCriticalRoute ? 0xfef08a : 0xa7f3d0,
          }),
        );
        scene.add(packet);
        courierParticles.push({
          mesh: packet,
          curve,
          speed: 0.22 + (idx % 3) * 0.06,
          offset: idx * 0.17,
        });
      });

      // Raycasting for interactive hover & click
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const updatePointer = (e: PointerEvent) => {
        if (!renderer) return;
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      };

      const onPointerMove = (e: PointerEvent) => {
        updatePointer(e);
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(hitMeshes, false);
        if (intersects.length > 0) {
          const hitIndex = intersects[0].object.userData.hubIndex as number;
          setHoveredIdx(hitIndex);
          if (renderer) renderer.domElement.style.cursor = 'pointer';
        } else {
          setHoveredIdx(null);
          if (renderer) renderer.domElement.style.cursor = 'grab';
        }
      };

      const onClick = (e: PointerEvent) => {
        updatePointer(e);
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(hitMeshes, false);
        if (intersects.length > 0) {
          const hitIndex = intersects[0].object.userData.hubIndex as number;
          setSelectedIdx(hitIndex);
        }
      };

      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('click', onClick);

      const handleResize = () => {
        if (!renderer || !container) return;
        const w = container.clientWidth || 640;
        const h = container.clientHeight || 400;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      const clock = new THREE.Clock();
      const animate = () => {
        const t = clock.getElapsedTime();
        controls?.update();

        if (!prefersReduced) {
          haloRings.forEach((ring, i) => {
            ring.rotation.z = t * (0.65 + i * 0.12);
          });
          courierParticles.forEach((p) => {
            const progress = (t * p.speed + p.offset) % 1;
            const pos = p.curve.getPointAt(progress);
            p.mesh.position.copy(pos);
          });
        } else {
          courierParticles.forEach((p) => {
            p.mesh.position.copy(p.curve.getPointAt(0.5));
          });
        }

        renderer?.render(scene, camera);
        if (!prefersReduced) {
          frameId = window.requestAnimationFrame(animate);
        }
      };

      animate();

      return () => {
        window.removeEventListener('resize', handleResize);
        window.cancelAnimationFrame(frameId);
        if (renderer) {
          renderer.domElement.removeEventListener('pointermove', onPointerMove);
          renderer.domElement.removeEventListener('click', onClick);
        }
        controls?.dispose();
        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
        renderer?.dispose();
      };
    } catch {
      setWebglReady(false);
      return undefined;
    }
  }, [resetNonce]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--bn-border)] bg-[var(--bn-primary-deep)] text-white shadow-[0_20px_50px_-15px_rgba(9,34,24,0.42)]">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Interactive 3D Viewport */}
        <div className="relative min-h-[360px] sm:min-h-[420px] lg:col-span-7 bg-gradient-to-br from-[#081C14] via-[#0D2B1F] to-[#123D2B]">
          {/* Top Overlay Controls */}
          <div className="pointer-events-none absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2">
            <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 backdrop-blur-md">
              <Compass className="h-3.5 w-3.5 text-[#F6D594]" aria-hidden="true" />
              <span className="font-mono-tabular text-[11px] font-medium text-white/90">
                3D Cold-Chain Grid · Drag to Orbit · Click Node
              </span>
            </div>
            <button
              type="button"
              onClick={() => setResetNonce((n) => n + 1)}
              aria-label="Reset 3D camera view"
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[11px] font-medium text-white/90 backdrop-blur-md hover:bg-white/15 transition-colors"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Reset View
            </button>
          </div>

          {webglReady ? (
            <div ref={mountRef} className="h-[360px] sm:h-[420px] w-full" />
          ) : (
            <div className="flex h-[360px] sm:h-[420px] flex-col items-center justify-center p-8 text-center">
              <Activity className="h-8 w-8 text-[#A3C4AE]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-white">
                2D Corridor Fallback Active
              </p>
              <p className="mt-1 max-w-sm text-xs text-white/75">
                WebGL is unavailable on this browser session. Select any regional hub on the right to inspect corridor metrics.
              </p>
            </div>
          )}

          {/* Bottom Hub Quick-Select Strip */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center gap-1.5">
            {hubs.map((hub, idx) => {
              const active = idx === activeIdx;
              return (
                <button
                  key={hub.region}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium backdrop-blur-md transition-all ${
                    active
                      ? 'bg-white text-[#0E3224] font-semibold shadow-sm'
                      : 'border border-white/15 bg-black/35 text-white/85 hover:bg-white/15'
                  }`}
                >
                  {hub.city}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Interactive Regional Telemetry Inspector */}
        <div className="flex flex-col justify-between border-t border-white/10 bg-[#0D2B1F]/90 p-6 lg:col-span-5 lg:border-t-0 lg:border-l">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#F6D594]">
                  Selected Corridor Hub · DEMO DATA
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold text-white">
                  {activeHub.region}
                </h3>
                <p className="text-xs text-white/70">
                  {activeHub.city}, {activeHub.state}
                </p>
              </div>
              <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 font-mono-tabular text-xs font-semibold text-white">
                Risk {activeHub.riskScore}/100
              </span>
            </div>

            <motion.div
              key={activeHub.region}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/75">Corridor Status</span>
                  <div className="rounded-md bg-white px-2 py-0.5">
                    <RiskStatusIndicator level={activeHub.riskLevel} />
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      activeHub.riskLevel === 'CRITICAL'
                        ? 'bg-[#EF4444]'
                        : activeHub.riskLevel === 'MODERATE'
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#34D399]'
                    }`}
                    style={{ width: `${activeHub.riskScore}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] text-white/65">Tracked Units</p>
                  <p className="mt-1 font-mono-tabular text-lg font-semibold text-white">
                    {activeHub.totalUnits.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] text-white/65">Hospitals</p>
                  <p className="mt-1 font-mono-tabular text-lg font-semibold text-white">
                    {activeHub.hospitalsCount}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] text-white/65">Mean ETA</p>
                  <p className="mt-1 font-mono-tabular text-lg font-semibold text-[#F6D594]">
                    {activeHub.etaMinutes}m
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs">
                <span className="inline-flex items-center gap-1.5 text-white/75">
                  <Building2 className="h-3.5 w-3.5 text-[#A3C4AE]" aria-hidden="true" />
                  {activeHub.bloodBanksCount} Licensed Blood Banks
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono-tabular text-white/90">
                  <Droplets className="h-3.5 w-3.5 text-[#F6D594]" aria-hidden="true" />
                  {activeHub.criticalGroups.length > 0
                    ? `Watch: ${activeHub.criticalGroups.join(', ')}`
                    : 'All Groups Stable'}
                </span>
              </div>
            </motion.div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <span className="text-[11px] text-white/60">
              Simulated regional topology
            </span>
            <button
              type="button"
              onClick={() => onExploreRegion(activeHub.city)}
              className="clinical-btn inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#0E3224] hover:bg-[#F3F6F2] whitespace-nowrap"
            >
              Inspect {activeHub.city} Stock
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
