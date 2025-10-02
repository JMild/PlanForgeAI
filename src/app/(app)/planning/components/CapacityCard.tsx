export default function CapacityCard({
  title,
  detail,
  percent,
  hint,
  color,
}: {
  title: string;
  detail: string;
  percent: number;
  hint: string;
  color: "success" | "warning" | "danger";
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
      <div>
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{detail}</div>
      </div>
      <div className="text-right">
        <div className={`text-lg font-bold text-${color}`}>{percent}%</div>
        <div className="text-xs text-gray-500">{hint}</div>
      </div>
    </div>
  );
}