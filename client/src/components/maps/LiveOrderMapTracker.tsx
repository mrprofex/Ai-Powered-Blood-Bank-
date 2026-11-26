import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  CheckCircle2,
  Clock,
  KeyRound,
  MapPin,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  Thermometer,
  Truck,
} from 'lucide-react';
import { BLOOD_COMPONENT_LABELS } from '../../../../shared/constants/bloodNetwork.ts';
import type { DemoHospitalRequestRecord } from '../../../../shared/types/network.ts';

interface LatLng {
  lat: number;
  lng: number;
}

interface CorridorGeoProfile {
  originName: string;
  origin: LatLng;
  destination: LatLng;
  distanceKm: number;
  waypoints: LatLng[];
}

const CITY_CORRIDOR_COORDS: Record<string, CorridorGeoProfile> = {
  Mumbai: {
    originName: 'KEM Regional Blood Center, Parel',
    origin: { lat: 19.0022, lng: 72.8421 },
    destination: { lat: 19.0176, lng: 72.8562 },
    distanceKm: 4.8,
    waypoints: [
      { lat: 19.0022, lng: 72.8421 },
      { lat: 19.0068, lng: 72.8458 },
      { lat: 19.0121, lng: 72.8509 },
      { lat: 19.0176, lng: 72.8562 },
    ],
  },
  Pune: {
    originName: 'Deccan Regional Blood Hub, Shivajinagar',
    origin: { lat: 18.5308, lng: 73.8475 },
    destination: { lat: 18.5256, lng: 73.8712 },
    distanceKm: 6.2,
    waypoints: [
      { lat: 18.5308, lng: 73.8475 },
      { lat: 18.5291, lng: 73.8548 },
      { lat: 18.5274, lng: 73.8632 },
      { lat: 18.5256, lng: 73.8712 },
    ],
  },
  Bengaluru: {
    originName: 'Manipal Old Airport Blood Center',
    origin: { lat: 12.9592, lng: 77.648 },
    destination: { lat: 12.9634, lng: 77.5855 },
    distanceKm: 8.9,
    waypoints: [
      { lat: 12.9592, lng: 77.648 },
      { lat: 12.9615, lng: 77.6284 },
      { lat: 12.9652, lng: 77.6058 },
      { lat: 12.9634, lng: 77.5855 },
    ],
  },
  'New Delhi': {
    originName: 'Safdarjung Trauma Blood Center',
    origin: { lat: 28.5672, lng: 77.2065 },
    destination: { lat: 28.5798, lng: 77.2244 },
    distanceKm: 5.4,
    waypoints: [
      { lat: 28.5672, lng: 77.2065 },
      { lat: 28.5718, lng: 77.2116 },
      { lat: 28.5759, lng: 77.2183 },
      { lat: 28.5798, lng: 77.2244 },
    ],
  },
  Chennai: {
    originName: 'Madras Medical Blood Bank',
    origin: { lat: 13.0811, lng: 80.2759 },
    destination: { lat: 13.0604, lng: 80.2512 },
    distanceKm: 5.9,
    waypoints: [
      { lat: 13.0811, lng: 80.2759 },
      { lat: 13.0745, lng: 80.2681 },
      { lat: 13.0671, lng: 80.2598 },
      { lat: 13.0604, lng: 80.2512 },
    ],
  },
  Hyderabad: {
    originName: 'NIMS Central Blood Transfusion Hub',
    origin: { lat: 17.4216, lng: 78.4521 },
    destination: { lat: 17.4399, lng: 78.4983 },
    distanceKm: 7.4,
    waypoints: [
      { lat: 17.4216, lng: 78.4521 },
      { lat: 17.4275, lng: 78.4682 },
      { lat: 17.4338, lng: 78.4836 },
      { lat: 17.4399, lng: 78.4983 },
    ],
  },
};

function getCorridorProfile(req: DemoHospitalRequestRecord): CorridorGeoProfile {
  const base = CITY_CORRIDOR_COORDS[req.city] ?? CITY_CORRIDOR_COORDS.Bengaluru;
  return {
    ...base,
    originName:
      req.matchedBank === 'Pending Allocation'
        ? `${req.city} Nearest Regional Vault (Standby)`
        : req.matchedBank,
  };
}

function interpolatePolyline(points: LatLng[], t: number): LatLng {
  if (points.length === 0) return { lat: 12.96, lng: 77.6 };
  if (points.length === 1 || t <= 0) return points[0];
  if (t >= 1) return points[points.length - 1];

  const totalSegments = points.length - 1;
  const scaled = t * totalSegments;
  const idx = Math.min(totalSegments - 1, Math.floor(scaled));
  const localT = scaled - idx;
  const a = points[idx];
  const b = points[idx + 1];
  return {
    lat: a.lat + (b.lat - a.lat) * localT,
    lng: a.lng + (b.lng - a.lng) * localT,
  };
}

function getInitialProgressForStatus(status: DemoHospitalRequestRecord['status']): number {
  switch (status) {
    case 'OPEN':
      return 0.12;
    case 'MATCHED':
      return 0.42;
    case 'ALLOCATED':
      return 0.68;
    case 'DISPATCHED':
      return 0.86;
    case 'COMPLETED':
      return 1;
    default:
      return 0.35;
  }
}

interface GoogleMapsNamespace {
  maps?: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => {
      fitBounds: (bounds: unknown, padding?: number) => void;
    };
    Marker: new (opts: Record<string, unknown>) => {
      setPosition: (pos: LatLng) => void;
      setMap: (map: unknown) => void;
    };
    Polyline: new (opts: Record<string, unknown>) => {
      setMap: (map: unknown) => void;
    };
    LatLngBounds: new () => {
      extend: (pos: LatLng) => void;
    };
    DirectionsService: new () => {
      route: (
        req: Record<string, unknown>,
        cb: (result: { routes?: Array<{ overview_path?: Array<{ lat: () => number; lng: () => number }> }> } | null, status: string) => void,
      ) => void;
    };
    SymbolPath: {
      CIRCLE: unknown;
      FORWARD_CLOSED_ARROW: unknown;
    };
    TravelMode: {
      DRIVING: string;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleMapsNamespace;
    gm_authFailure?: () => void;
  }
}

const MAPS_KEY_STORAGE = 'bn-google-maps-session-key';

export function LiveOrderMapTracker({
  requests,
  selectedRequestId,
  onSelectRequest,
}: {
  requests: DemoHospitalRequestRecord[];
  selectedRequestId?: string;
  onSelectRequest?: (id: string) => void;
}) {
  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    requests[0]?.id ?? '',
  );
  const activeId = selectedRequestId || internalSelectedId || requests[0]?.id;
  const activeRequest =
    requests.find((r) => r.id === activeId) ?? requests[0] ?? null;

  const envMapsKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ?? '';
  const [sessionMapsKey, setSessionMapsKey] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.sessionStorage.getItem(MAPS_KEY_STORAGE) ?? '';
  });
  const effectiveApiKey = (sessionMapsKey || envMapsKey).trim();

  const [keyInputOpen, setKeyInputOpen] = useState(false);
  const [draftKey, setDraftKey] = useState(sessionMapsKey);
  const [googleMapStatus, setGoogleMapStatus] = useState<
    'idle' | 'loading' | 'ready' | 'fallback'
  >(effectiveApiKey ? 'loading' : 'fallback');

  const [progress, setProgress] = useState<number>(0.42);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const courierMarkerRef = useRef<{ setPosition: (pos: LatLng) => void } | null>(null);
  const routePathRef = useRef<LatLng[]>([]);

  const geoProfile = useMemo(
    () => (activeRequest ? getCorridorProfile(activeRequest) : CITY_CORRIDOR_COORDS.Bengaluru),
    [activeRequest],
  );

  useEffect(() => {
    if (!activeRequest) return;
    setProgress(getInitialProgressForStatus(activeRequest.status));
    routePathRef.current = geoProfile.waypoints;
  }, [activeRequest?.id, activeRequest?.status, geoProfile]);

  // Load Google Maps JS API dynamically when a key is provided
  useEffect(() => {
    if (!effectiveApiKey) {
      setGoogleMapStatus('fallback');
      return;
    }

    let cancelled = false;
    setGoogleMapStatus('loading');

    window.gm_authFailure = () => {
      if (!cancelled) {
        setGoogleMapStatus('fallback');
      }
    };

    const initGoogleMap = () => {
      if (cancelled || !mapContainerRef.current || !window.google?.maps) return;
      const gmaps = window.google.maps;

      const map = new gmaps.Map(mapContainerRef.current, {
        center: geoProfile.origin,
        zoom: 13,
        disableDefaultUI: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
          { featureType: 'water', stylers: [{ color: '#dbeafe' }] },
          { featureType: 'landscape', stylers: [{ color: '#f4f7f5' }] },
        ],
      });

      const bounds = new gmaps.LatLngBounds();
      bounds.extend(geoProfile.origin);
      bounds.extend(geoProfile.destination);
      map.fitBounds(bounds, 56);

      new gmaps.Marker({
        position: geoProfile.origin,
        map,
        title: `Origin Blood Bank: ${geoProfile.originName}`,
        label: { text: 'B', color: '#FFFFFF', fontWeight: '700' },
      });

      new gmaps.Marker({
        position: geoProfile.destination,
        map,
        title: `Destination Hospital: ${activeRequest?.hospitalName ?? 'Hospital'}`,
        label: { text: 'H', color: '#FFFFFF', fontWeight: '700' },
      });

      const initialPos = interpolatePolyline(geoProfile.waypoints, progress);
      const courier = new gmaps.Marker({
        position: initialPos,
        map,
        title: 'Live Cold-Chain Courier',
        icon: {
          path: gmaps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#C93440',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });
      courierMarkerRef.current = courier;

      const drawFallbackPolyline = () => {
        routePathRef.current = geoProfile.waypoints;
        new gmaps.Polyline({
          path: geoProfile.waypoints,
          geodesic: true,
          strokeColor: '#123D2B',
          strokeOpacity: 0.85,
          strokeWeight: 4,
          map,
        });
      };

      try {
        const directionsService = new gmaps.DirectionsService();
        directionsService.route(
          {
            origin: geoProfile.origin,
            destination: geoProfile.destination,
            travelMode: gmaps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (cancelled) return;
            const overview = result?.routes?.[0]?.overview_path;
            if (status === 'OK' && overview && overview.length > 1) {
              const path = overview.map((pt) => ({ lat: pt.lat(), lng: pt.lng() }));
              routePathRef.current = path;
              new gmaps.Polyline({
                path,
                geodesic: true,
                strokeColor: '#123D2B',
                strokeOpacity: 0.9,
                strokeWeight: 5,
                map,
              });
            } else {
              drawFallbackPolyline();
            }
          },
        );
      } catch {
        drawFallbackPolyline();
      }

      setGoogleMapStatus('ready');
    };

    if (window.google?.maps) {
      initGoogleMap();
      return () => {
        cancelled = true;
      };
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-bn-gmaps="true"]',
    );
    if (existingScript) {
      existingScript.addEventListener('load', initGoogleMap);
      return () => {
        cancelled = true;
        existingScript.removeEventListener('load', initGoogleMap);
      };
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      effectiveApiKey,
    )}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.dataset.bnGmaps = 'true';
    script.onload = initGoogleMap;
    script.onerror = () => {
      if (!cancelled) setGoogleMapStatus('fallback');
    };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [effectiveApiKey, geoProfile, activeRequest?.hospitalName]);

  // Smooth live courier simulation loop
  useEffect(() => {
    if (!isPlaying) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const timer = window.setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.008 * speedMultiplier;
        return next >= 1 ? 0.08 : next;
      });
    }, 120);

    return () => window.clearInterval(timer);
  }, [isPlaying, speedMultiplier]);

  // Sync live courier position to Google Map marker if active
  const currentCoords = useMemo(
    () => interpolatePolyline(routePathRef.current.length ? routePathRef.current : geoProfile.waypoints, progress),
    [geoProfile.waypoints, progress],
  );

  useEffect(() => {
    if (googleMapStatus === 'ready' && courierMarkerRef.current) {
      courierMarkerRef.current.setPosition(currentCoords);
    }
  }, [currentCoords, googleMapStatus]);

  if (!activeRequest) return null;

  const selectOrder = (id: string) => {
    setInternalSelectedId(id);
    onSelectRequest?.(id);
  };

  const remainingDistanceKm = Math.max(
    0.1,
    Number((geoProfile.distanceKm * (1 - progress)).toFixed(1)),
  );
  const remainingEtaMins = Math.max(
    1,
    Math.round(activeRequest.etaMinutes * (1 - progress * 0.85)),
  );
  const progressPct = Math.round(progress * 100);

  const handleSaveSessionKey = () => {
    const trimmed = draftKey.trim();
    if (typeof window !== 'undefined') {
      if (trimmed) {
        window.sessionStorage.setItem(MAPS_KEY_STORAGE, trimmed);
      } else {
        window.sessionStorage.removeItem(MAPS_KEY_STORAGE);
      }
    }
    setSessionMapsKey(trimmed);
    setKeyInputOpen(false);
  };

  return (
    <section className="clinical-card overflow-hidden rounded-2xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--bn-border)] bg-[var(--bn-surface-elevated)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bn-primary)] text-white shadow-xs shrink-0">
            <Navigation className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-semibold text-[var(--bn-text)]">
                Live Cold-Chain Dispatch &amp; Route Map
              </h3>
              <span className="rounded-full border border-[var(--bn-border)] bg-white px-2.5 py-0.5 font-mono-tabular text-[10px] font-semibold text-[var(--bn-primary)]">
                {googleMapStatus === 'ready'
                  ? 'GOOGLE MAPS API LIVE'
                  : 'INTERACTIVE CORRIDOR PREVIEW · DEMO'}
              </span>
            </div>
            <p className="text-xs text-[var(--bn-muted)]">
              Track exact courier position from Blood Bank Vault to Hospital Ward · DEMO TELEMETRY
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="clinical-btn inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[var(--bn-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--bn-text)] hover:bg-[var(--bn-soft-bg)]"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 text-[var(--bn-primary)]" aria-hidden="true" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-[var(--bn-primary)]" aria-hidden="true" />
                Simulate
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSpeedMultiplier((s) => (s === 1 ? 2 : 1))}
            className="clinical-btn inline-flex min-h-[34px] items-center rounded-lg border border-[var(--bn-border)] bg-white px-2.5 py-1.5 font-mono-tabular text-xs font-semibold text-[var(--bn-primary)] hover:bg-[var(--bn-soft-bg)]"
          >
            {speedMultiplier}x
          </button>
          <button
            type="button"
            onClick={() => setProgress(0.1)}
            aria-label="Replay courier route"
            className="clinical-btn inline-flex min-h-[34px] items-center justify-center rounded-lg border border-[var(--bn-border)] bg-white px-2.5 py-1.5 text-xs text-[var(--bn-muted)] hover:text-[var(--bn-text)]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setKeyInputOpen((o) => !o)}
            className="clinical-btn inline-flex min-h-[34px] items-center gap-1.5 rounded-lg bg-[var(--bn-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--bn-secondary)]"
          >
            <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
            {effectiveApiKey ? 'Google Maps Key' : 'Connect Google Maps API'}
          </button>
        </div>
      </div>

      {/* Optional Google Maps API Key Configuration Drawer */}
      {keyInputOpen ? (
        <div className="border-b border-[var(--bn-border)] bg-[var(--bn-accent-soft)] px-5 py-3.5 text-xs">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <p className="font-semibold text-[var(--bn-text)]">
                Google Maps JavaScript API Key
              </p>
              <p className="text-[var(--bn-muted)]">
                Set <code className="font-mono-tabular">VITE_GOOGLE_MAPS_API_KEY</code> in{' '}
                <code className="font-mono-tabular">.env</code> or paste a referrer-restricted key
                for this browser session to render live Google Maps tiles &amp; Directions routing.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="password"
                value={draftKey}
                onChange={(e) => setDraftKey(e.target.value)}
                placeholder="AIzaSy... (session only)"
                aria-label="Google Maps API Key"
                className="h-9 w-56 rounded-lg border border-[var(--bn-border)] bg-white px-3 font-mono-tabular text-xs text-[var(--bn-text)] focus:border-[var(--bn-primary)] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveSessionKey}
                className="clinical-btn h-9 rounded-lg bg-[var(--bn-primary)] px-3.5 text-xs font-semibold text-white hover:bg-[var(--bn-secondary)]"
              >
                Apply Key
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Active Order Switcher List */}
        <div className="border-b border-[var(--bn-border)] bg-white p-4 lg:col-span-4 lg:border-b-0 lg:border-r space-y-2.5 max-h-[430px] overflow-y-auto">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--bn-muted)]">
            Active Orders ({requests.length})
          </p>
          {requests.map((req) => {
            const selected = req.id === activeRequest.id;
            return (
              <button
                key={req.id}
                type="button"
                onClick={() => selectOrder(req.id)}
                className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                  selected
                    ? 'border-[var(--bn-primary)] bg-[var(--bn-soft-bg)] shadow-xs'
                    : 'border-[var(--bn-border)] bg-white hover:border-[var(--bn-border-hover)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-tabular text-xs font-semibold text-[var(--bn-primary)]">
                    {req.id}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                      req.urgency === 'CRITICAL'
                        ? 'bg-[#C93440]/10 text-[#C93440]'
                        : req.urgency === 'HIGH'
                          ? 'bg-[#B45309]/10 text-[#B45309]'
                          : 'bg-[var(--bn-primary)]/10 text-[var(--bn-primary)]'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-semibold text-[var(--bn-text)] truncate">
                  {req.hospitalName}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--bn-muted)] truncate">
                  From: {req.matchedBank}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono-tabular text-[var(--bn-muted)]">
                  <span>
                    {req.bloodGroup} · {req.units}u {BLOOD_COMPONENT_LABELS[req.component]}
                  </span>
                  <span className="text-[var(--bn-text)] font-semibold">
                    {req.city} · {req.etaMinutes}m
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Google Map Viewport + Live Telemetry */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="relative h-[320px] sm:h-[360px] w-full bg-[#EAF1EC] overflow-hidden">
            {/* Live Google Map Canvas (shown when API key is valid & ready) */}
            <div
              ref={mapContainerRef}
              className={`h-full w-full ${googleMapStatus === 'ready' ? 'block' : 'hidden'}`}
            />

            {/* Interactive Corridor Route Preview Canvas (Active when no Google Maps key or fallback) */}
            {googleMapStatus !== 'ready' ? (
              <div className="relative h-full w-full bg-gradient-to-br from-[#EEF4F0] via-[#F6F9F7] to-[#E5EEE8] p-5">
                {/* Architectural City Street Grid Backdrop */}
                <svg
                  viewBox="0 0 800 380"
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="xMidYMid slice"
                  aria-hidden="true"
                >
                  <defs>
                    <pattern
                      id="city-grid"
                      width="48"
                      height="48"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 48 0 L 0 0 0 48"
                        fill="none"
                        stroke="#C9D8CC"
                        strokeWidth="0.8"
                        strokeOpacity="0.65"
                      />
                    </pattern>
                    <linearGradient id="route-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0E3224" />
                      <stop offset="100%" stopColor="#C93440" />
                    </linearGradient>
                  </defs>
                  <rect width="800" height="380" fill="url(#city-grid)" />

                  {/* Arterial Roads */}
                  <path
                    d="M 0 290 Q 260 220 440 185 T 800 95"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="12"
                    strokeOpacity="0.85"
                  />
                  <path
                    d="M 110 380 Q 250 240 390 190 T 680 0"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="9"
                    strokeOpacity="0.7"
                  />

                  {/* Route Track Shadow */}
                  <path
                    d="M 150 255 C 290 250, 390 120, 645 125"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {/* Dashed Planned Corridor */}
                  <path
                    d="M 150 255 C 290 250, 390 120, 645 125"
                    fill="none"
                    stroke="#9EB5A5"
                    strokeWidth="4"
                    strokeDasharray="8 8"
                    strokeLinecap="round"
                  />
                  {/* Active Completed Route Progress */}
                  <path
                    d="M 150 255 C 290 250, 390 120, 645 125"
                    fill="none"
                    stroke="url(#route-grad)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    pathLength={100}
                    strokeDasharray={`${progressPct} 100`}
                  />

                  {/* Origin Pin (Blood Bank) */}
                  <g transform="translate(150, 255)">
                    <circle r="18" fill="#0E3224" fillOpacity="0.14" />
                    <circle r="10" fill="#0E3224" stroke="#FFFFFF" strokeWidth="2.5" />
                  </g>

                  {/* Destination Pin (Hospital) */}
                  <g transform="translate(645, 125)">
                    <circle r="20" fill="#C93440" fillOpacity="0.16" />
                    <circle r="11" fill="#C93440" stroke="#FFFFFF" strokeWidth="2.5" />
                  </g>
                </svg>

                {/* Origin & Destination Floating Labels */}
                <div className="relative z-10 flex h-full flex-col justify-between pointer-events-none">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="glass-surface rounded-xl px-3.5 py-2 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--bn-primary)]">
                        Courier En Route · {activeRequest.city}
                      </p>
                      <p className="mt-0.5 font-mono-tabular text-xs font-semibold text-[var(--bn-text)]">
                        {currentCoords.lat.toFixed(4)}° N, {currentCoords.lng.toFixed(4)}° E
                      </p>
                    </div>

                    <div className="glass-surface rounded-xl px-3.5 py-2 text-right shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#C93440]">
                        Destination Hospital
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-[var(--bn-text)]">
                        {activeRequest.hospitalName}
                      </p>
                      <p className="text-[11px] text-[var(--bn-muted)]">
                        {activeRequest.department}
                      </p>
                    </div>
                  </div>

                  {/* Animated Live Courier Vehicle Pill */}
                  <div className="relative h-24 w-full">
                    <motion.div
                      animate={{
                        left: `${18 + progress * 64}%`,
                        top: `${62 - Math.sin(progress * Math.PI) * 34}%`,
                      }}
                      transition={{ duration: 0.12, ease: 'linear' }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                    >
                      <div className="flex items-center gap-1.5 rounded-full bg-[var(--bn-primary)] px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg ring-4 ring-white/90">
                        <Truck className="h-3.5 w-3.5 text-[#FDE68A]" aria-hidden="true" />
                        <span className="font-mono-tabular">{progressPct}%</span>
                      </div>
                    </motion.div>
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div className="glass-surface rounded-xl px-3.5 py-2 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--bn-secondary)]">
                        Origin Blood Bank Vault
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-[var(--bn-text)]">
                        {geoProfile.originName}
                      </p>
                    </div>

                    <div className="glass-surface rounded-xl px-3 py-1.5 text-[11px] text-[var(--bn-muted)]">
                      Route Preview · Connect Google Maps API key for live map tiles
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Bottom Live Telemetry & ETA Progress Bar */}
          <div className="border-t border-[var(--bn-border)] bg-white p-4 sm:px-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-5 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--bn-primary)]" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] text-[var(--bn-muted)]">Est. Arrival</p>
                    <p className="font-mono-tabular font-semibold text-[var(--bn-text)]">
                      {remainingEtaMins} mins ({remainingDistanceKm} km)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-[#0284C7]" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] text-[var(--bn-muted)]">Cold-Chain Box</p>
                    <p className="font-mono-tabular font-semibold text-[var(--bn-text)]">
                      3.2°C · Sealed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#C93440]" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] text-[var(--bn-muted)]">Payload</p>
                    <p className="font-mono-tabular font-semibold text-[var(--bn-text)]">
                      {activeRequest.bloodGroup} · {activeRequest.units}u{' '}
                      {BLOOD_COMPONENT_LABELS[activeRequest.component]}
                    </p>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bn-soft-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--bn-primary)]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--bn-secondary)]" aria-hidden="true" />
                {progressPct >= 95
                  ? 'Arriving at Hospital Receiving Bay'
                  : progressPct >= 50
                    ? 'In Corridor Transit'
                    : 'Cleared Cold Vault Dispatch'}
              </div>
            </div>

            {/* Smooth Route Progress Track */}
            <div className="space-y-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bn-soft-bg)] border border-[var(--bn-border)]">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, var(--bn-primary) 0%, #C93440 100%)',
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono-tabular text-[var(--bn-muted)]">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {geoProfile.originName}
                </span>
                <span>{progressPct}% Complete</span>
                <span>{activeRequest.hospitalName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
