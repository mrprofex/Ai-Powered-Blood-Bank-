import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BloodGroupSummaryItem } from '../../../../shared/types/network.ts';
import { DEMO_CONSUMPTION_TREND } from '../../data/demoPortalData.ts';

function getBarFill(riskLevel: BloodGroupSummaryItem['riskLevel']): string {
  // Crimson strictly for CRITICAL shortages, muted amber for MODERATE watch, Dark Forest Green for healthy supply
  if (riskLevel === 'CRITICAL') return '#C93440';
  if (riskLevel === 'MODERATE') return '#B45309';
  return '#1D593E';
}

export function BloodGroupInventoryChart({
  data,
}: {
  data: BloodGroupSummaryItem[];
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DCE3DC" vertical={false} />
          <XAxis
            dataKey="bloodGroup"
            tick={{ fill: '#55655C', fontSize: 12, fontWeight: 500 }}
            axisLine={{ stroke: '#DCE3DC' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#55655C', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            cursor={{ fill: 'rgba(242, 245, 241, 0.85)' }}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#DCE3DC',
              borderRadius: '8px',
              color: '#17231C',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(18, 61, 43, 0.08)',
            }}
            formatter={(value: unknown, name: unknown) => {
              const label =
                name === 'availableUnits'
                  ? 'Available Units (Demo)'
                  : 'Safety Threshold (Demo)';
              return [Number(value).toLocaleString('en-IN'), label];
            }}
          />
          <Bar
            dataKey="availableUnits"
            name="availableUnits"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          >
            {data.map((entry) => (
              <Cell key={entry.bloodGroup} fill={getBarFill(entry.riskLevel)} />
            ))}
          </Bar>
          <Bar
            dataKey="minimumThreshold"
            name="minimumThreshold"
            fill="#C7D4C9"
            radius={[4, 4, 0, 0]}
            maxBarSize={14}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ShortageTrendDemoChart() {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={DEMO_CONSUMPTION_TREND}
          margin={{ top: 10, right: 8, left: 0, bottom: 4 }}
        >
          <defs>
            <linearGradient id="demoStockFillForest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#123D2B" stopOpacity={0.14} />
              <stop offset="95%" stopColor="#123D2B" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="demoDemandFillSage" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1D593E" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#1D593E" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#DCE3DC" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: '#55655C', fontSize: 11 }}
            axisLine={{ stroke: '#DCE3DC' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#55655C', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#DCE3DC',
              borderRadius: '8px',
              color: '#17231C',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(18, 61, 43, 0.08)',
            }}
            formatter={(value: unknown, name: unknown) => [
              `${Number(value).toLocaleString('en-IN')} units`,
              name === 'availableUnits'
                ? 'Network Stock (Demo)'
                : 'Daily Utilization (Demo)',
            ]}
          />
          <Area
            type="monotone"
            dataKey="availableUnits"
            stroke="#123D2B"
            strokeWidth={1.85}
            fill="url(#demoStockFillForest)"
          />
          <Area
            type="monotone"
            dataKey="demandUnits"
            stroke="#1D593E"
            strokeWidth={2}
            strokeDasharray="4 3"
            fill="url(#demoDemandFillSage)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const DEMO_COMPONENT_SHARE = [
  { name: 'PRBC', value: 8920, color: '#123D2B' },
  { name: 'Whole Blood', value: 4610, color: '#1D593E' },
  { name: 'FFP', value: 3180, color: '#6C8476' },
  { name: 'Platelets', value: 1710, color: '#C93440' },
];

export function ComponentMixDonutChart() {
  const total = DEMO_COMPONENT_SHARE.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={DEMO_COMPONENT_SHARE}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={78}
              paddingAngle={3}
              stroke="#FFFFFF"
              strokeWidth={2}
            >
              {DEMO_COMPONENT_SHARE.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#DCE3DC',
                borderRadius: '8px',
                color: '#17231C',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(18, 61, 43, 0.08)',
              }}
              formatter={(value: unknown) => [`${Number(value).toLocaleString('en-IN')} units`, 'Demo Stock']}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono-tabular text-base font-semibold text-[#17231C]">
            {total.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-[#55655C]">Total Units</span>
        </div>
      </div>

      <div className="w-full flex-1 space-y-2.5">
        {DEMO_COMPONENT_SHARE.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="text-[#55655C]">{item.name}</span>
            </div>
            <span className="font-mono-tabular font-semibold text-[#17231C]">
              {item.value.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RadialKpiRing({
  percentage,
  label,
  tone = 'primary',
}: {
  percentage: number;
  label: string;
  tone?: 'primary' | 'secondary' | 'orange' | 'charcoal' | 'red' | 'green';
}) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const strokeColor =
    tone === 'red'
      ? '#C93440'
      : tone === 'charcoal'
        ? '#17231C'
        : tone === 'secondary' || tone === 'green'
          ? '#1D593E'
          : '#123D2B';

  return (
    <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56" aria-hidden="true">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="#DCE3DC"
          strokeWidth="4.5"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute font-mono-tabular text-[11px] font-semibold text-[#17231C]">
        {label}
      </span>
    </div>
  );
}
