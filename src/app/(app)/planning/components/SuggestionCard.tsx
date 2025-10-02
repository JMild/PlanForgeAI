export default function SuggestionCard({
  icon,
  color,
  title,
  text,
}: {
  icon: string;
  color: "success" | "warning" | "primary";
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center">
        <span className={`mr-2 text-lg text-${color}`}>{icon}</span>
        <div className="font-medium text-gray-900">{title}</div>
      </div>
      <p className="mb-3 text-sm text-gray-600">{text}</p>
      <div className="flex space-x-2">
        <button className={`rounded bg-${color} px-3 py-1 text-xs text-white hover:opacity-90`}>
          Apply
        </button>
        <button className="rounded bg-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-300">
          Details
        </button>
      </div>
    </div>
  );
}