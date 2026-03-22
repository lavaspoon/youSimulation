import { useId, useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/**
 * @param {{ active: boolean, payload: object[] }} props
 */
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const v = payload[0]?.value;
  return (
    <div className="agent-recharts-tooltip">
      <div className="agent-recharts-tooltip__period">
        {row?.monthLabel ?? row?.label}
      </div>
      <div className="agent-recharts-tooltip__value">
        선정 <strong>{v}</strong>건
      </div>
      <div className="agent-recharts-tooltip__hint">클릭하여 내역 보기</div>
    </div>
  );
}

/**
 * @param {{
 *   data: { month: number, count: number, label: string, monthLabel: string }[],
 *   selectedMonth: number | null,
 *   onMonthClick: (month: number) => void,
 * }} props
 */
export default function AgentMonthlyLineChart({
  data,
  selectedMonth,
  onMonthClick,
}) {
  const reactId = useId();
  const gradId = useMemo(
    () => `agentChartFill-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`,
    [reactId]
  );

  const maxC = Math.max(...data.map((d) => d.count), 0);
  const yMax = maxC <= 2 ? 3 : Math.ceil(maxC * 1.15) || 1;

  const renderDot = (props) => {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null || !payload) return null;
    const sel = selectedMonth === payload.month;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={sel ? 6 : 4}
        fill={sel ? '#0071e3' : '#ffffff'}
        stroke="#0071e3"
        strokeWidth={sel ? 2.5 : 2}
        style={{ cursor: 'pointer' }}
        className="agent-recharts-dot"
        onClick={(e) => {
          e.stopPropagation();
          onMonthClick(payload.month);
        }}
        tabIndex={-1}
        aria-hidden="true"
      />
    );
  };

  return (
    <div className="agent-recharts-wrap">
      <ResponsiveContainer width="100%" height={248}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 32, left: -12, bottom: 14 }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0071e3" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#0071e3" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="#ececf0"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            type="number"
            domain={[1, 12]}
            ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
            tickFormatter={(m) => `${m}월`}
            tick={{ fontSize: 10, fill: '#86868b', fontWeight: 500 }}
            tickMargin={10}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, yMax]}
            allowDecimals={false}
            width={34}
            tick={{ fontSize: 11, fill: '#86868b' }}
            axisLine={false}
            tickLine={false}
            tickMargin={4}
          />
          <Tooltip
            content={ChartTooltip}
            cursor={{ stroke: '#d2d2d7', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="선정"
            stroke="#0071e3"
            strokeWidth={2.5}
            fill={`url(#${gradId})`}
            dot={renderDot}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
