type DonutSlice = {
  label: string;
  color: string;
  value: number;
};

type DonutChartProps = {
  title: string;
  slices: DonutSlice[];
  total: number;
  formatTotal: (value: number) => string;
  formatValue: (value: number) => string;
};

const RADIUS = 15.9155; // circumference = 100, simplifies stroke-dasharray math
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DonutChart({
  title,
  slices,
  total,
  formatTotal,
  formatValue,
}: DonutChartProps) {
  if (total <= 0) {
    return null;
  }

  const nonZeroSlices = slices.filter((slice) => slice.value > 0);

  let offset = 0;
  const arcs = nonZeroSlices.map((slice) => {
      const fraction = slice.value / total;
      const dash = fraction * CIRCUMFERENCE;
      const arc = (
        <circle
          key={slice.color + slice.label}
          cx="21"
          cy="21"
          r={RADIUS}
          fill="none"
          stroke={slice.color}
          strokeWidth="6"
          strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
          strokeDashoffset={-offset}
        />
      );
      offset += dash;
      return arc;
    });

  const ariaLabel = `${title} : ${nonZeroSlices
    .map(
      (slice) =>
        `${slice.label} ${formatValue(slice.value)} (${((slice.value / total) * 100).toFixed(1)}%)`,
    )
    .join(", ")}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox="0 0 42 42"
        className="w-20 h-20 -rotate-90"
        role="img"
        aria-label={ariaLabel}
      >
        {arcs}
      </svg>
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-900">
          {formatTotal(total)}
        </div>
        <div className="text-xs text-gray-500">{title}</div>
      </div>
      <ul className="w-full space-y-1">
        {nonZeroSlices.map((slice) => (
          <li
            key={slice.color + slice.label}
            className="flex items-center gap-1.5 text-[11px] leading-tight"
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="flex-1 text-gray-600 truncate" title={slice.label}>
              {slice.label}
            </span>
            <span className="text-gray-900 font-medium flex-shrink-0">
              {formatValue(slice.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
