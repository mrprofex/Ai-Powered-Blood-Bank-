import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Droplets,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
} from 'lucide-react';
import {
  BLOOD_GROUPS,
  type BloodGroup,
} from '../../../shared/constants/bloodNetwork.ts';
import type { BloodInventoryRecord } from '../../../shared/types/network.ts';
import { FALLBACK_DEMO_SUMMARY } from '../data/demoPortalData.ts';
import { fetchBloodAvailability } from '../services/networkApi.ts';
import type { AppPage } from '../types/navigation.ts';
import {
  ClinicalDisclaimerNotice,
  RiskStatusIndicator,
} from '../components/ui/UiPrimitives.tsx';

const COMPATIBILITY_GUIDE: Record<
  BloodGroup,
  { receiveFrom: BloodGroup[]; donateTo: BloodGroup[] }
> = {
  'O-': { receiveFrom: ['O-'], donateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] },
  'O+': { receiveFrom: ['O-', 'O+'], donateTo: ['O+', 'A+', 'B+', 'AB+'] },
  'A-': { receiveFrom: ['O-', 'A-'], donateTo: ['A-', 'A+', 'AB-', 'AB+'] },
  'A+': { receiveFrom: ['O-', 'O+', 'A-', 'A+'], donateTo: ['A+', 'AB+'] },
  'B-': { receiveFrom: ['O-', 'B-'], donateTo: ['B-', 'B+', 'AB-', 'AB+'] },
  'B+': { receiveFrom: ['O-', 'O+', 'B-', 'B+'], donateTo: ['B+', 'AB+'] },
  'AB-': { receiveFrom: ['O-', 'A-', 'B-', 'AB-'], donateTo: ['AB-', 'AB+'] },
  'AB+': { receiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], donateTo: ['AB+'] },
};

export function PublicDashboardView({
  onNavigate,
}: {
  onNavigate: (page: AppPage) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#DCE3DC] pb-5">
        <div>
          <p className="text-xs font-semibold text-[#1D593E]">
            Public Read-Only Portal · DEMO DATA
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-[#17231C]">
            Public Blood Availability Finder
          </h2>
          <p className="mt-1 text-sm text-[#55655C]">
            Search simulated blood group availability, locate nearby licensed blood banks, and review emergency helplines.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('availability')}
          className="clinical-btn inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#123D2B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D593E] whitespace-nowrap shrink-0"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Search Blood Availability
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="clinical-card rounded-xl p-5">
          <p className="text-xs text-[#55655C]">Tracked Blood Banks · DEMO DATA</p>
          <p className="mt-1.5 font-mono-tabular text-2xl font-semibold text-[#123D2B]">
            {FALLBACK_DEMO_SUMMARY.kpis.registeredBloodBanks}
          </p>
          <p className="mt-1 text-xs text-[#55655C]">Across 8 Indian state clusters</p>
        </div>
        <div className="clinical-card rounded-xl p-5">
          <p className="text-xs text-[#55655C]">Simulated Total Units · DEMO DATA</p>
          <p className="mt-1.5 font-mono-tabular text-2xl font-semibold text-[#17231C]">
            {FALLBACK_DEMO_SUMMARY.kpis.availableBloodUnits.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-xs font-medium text-[#1D593E]">Read-only public overview</p>
        </div>
        <div className="clinical-card rounded-xl p-5 border-[#C93440]/25">
          <p className="text-xs text-[#55655C]">Groups on Critical Watch · DEMO DATA</p>
          <p className="mt-1.5 font-mono-tabular text-2xl font-semibold text-[#C93440]">
            O- · B-
          </p>
          <p className="mt-1 text-xs text-[#55655C]">Verify directly with facility desk</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => onNavigate('public-group-search')}
          className="clinical-card clinical-card-interactive rounded-xl p-5 text-left"
        >
          <Droplets className="h-5 w-5 text-[#123D2B]" aria-hidden="true" />
          <h3 className="mt-3 font-display text-sm font-semibold text-[#17231C]">
            Blood Group Search
          </h3>
          <p className="mt-1 text-xs text-[#55655C]">
            Filter all 8 ABO/Rh groups and view informational RBC compatibility reference.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#123D2B]">
            Open Group Search <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('public-nearby-banks')}
          className="clinical-card clinical-card-interactive rounded-xl p-5 text-left"
        >
          <MapPin className="h-5 w-5 text-[#123D2B]" aria-hidden="true" />
          <h3 className="mt-3 font-display text-sm font-semibold text-[#17231C]">
            Nearby Blood Banks
          </h3>
          <p className="mt-1 text-xs text-[#55655C]">
            Browse licensed regional blood bank contacts across metropolitan hubs.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#123D2B]">
            Explore Directory <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('public-emergency-info')}
          className="clinical-card clinical-card-interactive rounded-xl p-5 text-left"
        >
          <ShieldAlert className="h-5 w-5 text-[#C93440]" aria-hidden="true" />
          <h3 className="mt-3 font-display text-sm font-semibold text-[#17231C]">
            Emergency Information
          </h3>
          <p className="mt-1 text-xs text-[#55655C]">
            National emergency helplines, e-RaktKosh guidance, and transfusion safety notices.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#C93440]">
            View Emergency Guide <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </button>
      </section>

      <ClinicalDisclaimerNotice variant="light" />
    </div>
  );
}

export function BloodGroupSearchView() {
  const [selected, setSelected] = useState<BloodGroup>('O-');
  const [records, setRecords] = useState<BloodInventoryRecord[]>([]);

  useEffect(() => {
    let active = true;
    fetchBloodAvailability({ bloodGroup: selected, limit: 12 })
      .then((res) => {
        if (active) setRecords(res.records);
      })
      .catch(() => {
        if (active) setRecords([]);
      });
    return () => {
      active = false;
    };
  }, [selected]);

  const guide = COMPATIBILITY_GUIDE[selected];

  return (
    <div className="space-y-6">
      <section className="clinical-card rounded-xl p-5 space-y-4">
        <div>
          <h2 className="font-display text-base font-semibold text-[#17231C]">
            Blood Group Availability &amp; Informational Reference
          </h2>
          <p className="text-xs text-[#55655C]">
            DEMO DATA · Select a blood group to inspect simulated units and general RBC compatibility reference
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => setSelected(bg)}
              className={`clinical-btn min-h-[42px] rounded-lg border font-mono-tabular text-sm font-semibold transition-colors ${
                selected === bg
                  ? 'border-[#123D2B] bg-[#123D2B] text-white'
                  : 'border-[#DCE3DC] bg-[#F2F5F1] text-[#17231C] hover:bg-[#E7EEE8]'
              }`}
            >
              {bg}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-[#DCE3DC] pt-4 text-xs">
          <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-4">
            <p className="font-semibold text-[#17231C]">
              Informational RBC Receive Reference ({selected})
            </p>
            <p className="mt-1.5 font-mono-tabular text-sm font-semibold text-[#123D2B]">
              {guide.receiveFrom.join(' · ')}
            </p>
            <p className="mt-1 text-[#55655C]">
              Subject strictly to laboratory crossmatch by qualified medical personnel.
            </p>
          </div>
          <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-4">
            <p className="font-semibold text-[#17231C]">
              Informational RBC Donate Reference ({selected})
            </p>
            <p className="mt-1.5 font-mono-tabular text-sm font-semibold text-[#17231C]">
              {guide.donateTo.join(' · ')}
            </p>
            <p className="mt-1 text-[#55655C]">
              Standard NBTC donor eligibility &amp; screening rules apply.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {records.map((rec) => (
          <div key={rec.id} className="clinical-card rounded-xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#17231C]">{rec.facilityName}</p>
              <p className="mt-0.5 text-xs text-[#55655C]">
                {rec.city}, {rec.state} · {rec.component}
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1 font-mono-tabular text-xs text-[#55655C]">
                <Phone className="h-3 w-3" aria-hidden="true" />
                {rec.contactPhone}
              </p>
            </div>
            <div className="text-right shrink-0 space-y-1">
              <p className="font-mono-tabular text-lg font-bold text-[#17231C]">
                {rec.unitsAvailable}u
              </p>
              <RiskStatusIndicator level={rec.riskLevel} />
            </div>
          </div>
        ))}
      </section>

      <ClinicalDisclaimerNotice variant="light" />
    </div>
  );
}

export function NearbyBloodBanksView() {
  const [records, setRecords] = useState<BloodInventoryRecord[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');

  useEffect(() => {
    let active = true;
    fetchBloodAvailability({ limit: 30 })
      .then((res) => {
        if (active) setRecords(res.records);
      })
      .catch(() => {
        if (active) setRecords([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const corridorStats = useMemo(() => {
    const map = new Map<string, { state: string; facilities: number; units: number }>();
    for (const rec of records) {
      const existing = map.get(rec.state) ?? { state: rec.state, facilities: 0, units: 0 };
      existing.facilities += 1;
      existing.units += rec.unitsAvailable;
      map.set(rec.state, existing);
    }
    return Array.from(map.values()).slice(0, 4);
  }, [records]);

  const visibleRecords = selectedState
    ? records.filter((rec) => rec.state === selectedState)
    : records;

  return (
    <div className="space-y-6">
      <section className="clinical-card rounded-xl p-5 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-[#17231C]">
              Regional Blood Bank Directory · DEMO DATA
            </h2>
            <p className="text-xs text-[#55655C]">
              Filter simulated metropolitan blood hubs and contact desks by state corridor
            </p>
          </div>
          {selectedState ? (
            <button
              type="button"
              onClick={() => setSelectedState('')}
              className="text-xs font-semibold text-[#123D2B] hover:underline self-start"
            >
              Show All Corridors
            </button>
          ) : null}
        </div>

        {corridorStats.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {corridorStats.map((corridor) => {
              const active = selectedState === corridor.state;
              return (
                <button
                  key={corridor.state}
                  type="button"
                  onClick={() => setSelectedState(active ? '' : corridor.state)}
                  className={`rounded-lg border p-3.5 text-left transition-colors ${
                    active
                      ? 'border-[#123D2B] bg-[#123D2B] text-white'
                      : 'border-[#DCE3DC] bg-[#F2F5F1] text-[#17231C] hover:border-[#123D2B]/40'
                  }`}
                >
                  <p className="text-xs font-semibold">{corridor.state}</p>
                  <p className="mt-1 font-mono-tabular text-lg font-bold">
                    {corridor.units.toLocaleString('en-IN')}u
                  </p>
                  <p className={`text-[11px] ${active ? 'text-[#DCE6DF]' : 'text-[#55655C]'}`}>
                    {corridor.facilities} tracked entries
                  </p>
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleRecords.map((rec) => (
          <div key={rec.id} className="clinical-card clinical-card-interactive rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-[#1D593E]">DEMO DATA · Facility</p>
                <h3 className="mt-0.5 font-display text-sm font-semibold text-[#17231C]">
                  {rec.facilityName}
                </h3>
              </div>
              <span className="font-mono-tabular text-xs font-bold text-[#123D2B]">
                {rec.bloodGroup}
              </span>
            </div>
            <p className="inline-flex items-center gap-1 text-xs text-[#55655C]">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {rec.city}, {rec.state}
            </p>
            <div className="flex items-center justify-between border-t border-[#DCE3DC] pt-3 text-xs">
              <RiskStatusIndicator level={rec.riskLevel} />
              <span className="font-mono-tabular text-[#55655C]">{rec.contactPhone}</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export function EmergencyInformationView() {
  return (
    <div className="space-y-6">
      <section className="clinical-card rounded-xl p-6 space-y-5 border-[#C93440]/25">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C93440]/10 text-[#C93440] shrink-0">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-[#17231C]">
              Emergency Blood Coordination Guidance
            </h2>
            <p className="mt-1 text-xs text-[#55655C]">
              Important public safety and official national contact resources
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-xs">
          <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-4">
            <p className="font-mono-tabular text-lg font-bold text-[#C93440]">108 / 112</p>
            <p className="mt-1 font-semibold text-[#17231C]">Medical &amp; Trauma Ambulance</p>
            <p className="mt-1 text-[#55655C] leading-relaxed">
              Call immediately for acute trauma, emergency surgical transfer, or active hemorrhage.
            </p>
          </div>

          <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-4">
            <p className="font-mono-tabular text-lg font-bold text-[#123D2B]">104 / e-RaktKosh</p>
            <p className="mt-1 font-semibold text-[#17231C]">State Health &amp; Blood Helpline</p>
            <p className="mt-1 text-[#55655C] leading-relaxed">
              Verify live unit stock directly through authorized C-DAC e-RaktKosh blood centers.
            </p>
          </div>

          <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-4">
            <p className="font-mono-tabular text-lg font-bold text-[#17231C]">NBTC / NACO</p>
            <p className="mt-1 font-semibold text-[#17231C]">Laboratory Crossmatch Standard</p>
            <p className="mt-1 text-[#55655C] leading-relaxed">
              Every transfusion requires mandatory blood bank compatibility &amp; TTI screening.
            </p>
          </div>
        </div>
      </section>

      <ClinicalDisclaimerNotice variant="light" />
    </div>
  );
}
