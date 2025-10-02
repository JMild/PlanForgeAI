export default function MaterialCard({
  name,
  required,
  available,
  status,
  color,
}: {
  name: string;
  required: string;
  available: string;
  status: string;
  color: "success" | "warning" | "danger";
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
      <div>
        <div className="font-medium text-gray-900">{name}</div>
        <div className="text-sm text-gray-600">Required: {required}</div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-medium text-${color}`}>Available: {available}</div>
        <div className="text-xs text-gray-500">{status}</div>
      </div>
    </div>
  );
}