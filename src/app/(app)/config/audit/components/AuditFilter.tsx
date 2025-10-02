import { useAuditStore } from "@/src/store/useAuditStore";


export const AuditFilter = () => {
  const { filter, setFilter, fetchLogs } = useAuditStore();

  return (
    <div className="flex gap-2 mb-4">
      <input
        placeholder="User"
        value={filter.user || ''}
        onChange={(e) => setFilter({ user: e.target.value })}
      />
      <input
        placeholder="Module"
        value={filter.module || ''}
        onChange={(e) => setFilter({ module: e.target.value })}
      />
      <input
        type="date"
        placeholder="From"
        value={filter.from || ''}
        onChange={(e) => setFilter({ from: e.target.value })}
      />
      <input
        type="date"
        placeholder="To"
        value={filter.to || ''}
        onChange={(e) => setFilter({ to: e.target.value })}
      />
      <button onClick={fetchLogs}>Search</button>
    </div>
  );
};
