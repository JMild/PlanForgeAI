type StatusBadgeProps = {
  status: string;
  type?: "order" | "machine" | "default";
};

const badgeStyles: Record<string, string> = {
  // Order statuses
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  released: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",

  // Machine statuses
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  down: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  standby: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const className =
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
  const colorClass = badgeStyles[status] || "bg-slate-200 text-slate-800";

  return (
    <span className={`${className} ${colorClass}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
