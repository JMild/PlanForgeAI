type Line = "A" | "B" | "C";

type Slot = {
  id: string;
  label: string;        // e.g. "14:30 - 18:00"
  kind?: "maintenance" | "info" | "open"; // visual only
  orderId?: string;     // occupied by which order
};

export default function DropSlot({
  line,
  slot,
  onDragOver,
  onDrop,
}: {
  line: Line;
  slot: Slot;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (line: Line, slotId: string) => void;
}) {
  // ให้ขนาดกล่องเท่ากันเสมอ
  const base =
    "h-[120px] w-full rounded-lg p-4 flex items-center justify-center text-gray-500 border-2 border-dashed transition-colors";

  if (slot.kind === "maintenance") {
    const isA = line === "A" && slot.id === "A-maint";
    const styles = isA
      ? "border-warning/50 bg-warning/5"
      : "border-danger/50 bg-danger/5";
    return (
      <div className={`${base} ${styles}`} aria-disabled>
        <div className="text-center">
          <div className={`font-medium ${isA ? "text-warning" : "text-danger"}`}>
            {isA ? "Maintenance" : "Issue / Downtime"}
          </div>
          <div className="text-gray-600">{slot.label}</div>
        </div>
      </div>
    );
  }

  if (slot.kind === "info") {
    return (
      <div className={`${base} border-gray-300`}>
        <div className="text-center">
          <div className="font-medium text-success">
            {line === "A" ? "Current: WO-2024-001" : "Current"}
          </div>
          <div className="text-gray-600">
            {line === "A"
              ? "Product A • 750/1000 pcs • Est. Complete: 14:30"
              : line === "B"
              ? "Product B • 320/800 pcs • Behind: -2 hrs"
              : "Waiting repair"}
          </div>
        </div>
      </div>
    );
  }

  const occupied = !!slot.orderId;

  return (
    <div
      onDragOver={onDragOver}
      onDrop={() => onDrop(line, slot.id)}
      className={`${base} border-gray-300 hover:border-primary hover:bg-primary/5`}
    >
      {!occupied ? (
        <div className="text-center">
          <div className="text-sm text-gray-400">📋 Drop order here</div>
          <div className="text-xs text-gray-400">{slot.label}</div>
        </div>
      ) : (
        <div className="text-center">
          <div className="font-medium text-primary">{slot.orderId}</div>
          <div className="text-gray-600">{slot.label}</div>
        </div>
      )}
    </div>
  );
}
