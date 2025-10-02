import { create } from 'zustand';

type AuditLog = {
  id: string;
  user: string;
  action: string;
  timestamp: string;
};

type AuditFilter = {
  to: string;
  from: string;
  module: string;
  user: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
};

type AuditStore = {
  logs: AuditLog[];
  loading: boolean;
  filter: AuditFilter;
  selectedLog?: AuditLog;
  setFilter: (filter: Partial<AuditFilter>) => void;
  setLogs: (logs: AuditLog[]) => void;
  selectLog: (log: AuditLog) => void;
  fetchLogs: () => Promise<void>;
};

export const useAuditStore = create<AuditStore>((set, get) => ({
  logs: [],
  loading: false,
  filter: {
    to: '',
    from: '',
    module: '',
    user: ''
  },
  selectedLog: undefined,
  setFilter: (filter) => set({ filter: { ...get().filter, ...filter } }),
  setLogs: (logs) => set({ logs }),
  selectLog: (log) => set({ selectedLog: log }),
  fetchLogs: async () => {
    set({ loading: true });
    const { filter } = get();

    const params = new URLSearchParams(
      Object.entries(filter).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const res = await fetch(`/api/audit?${params}`);
    const data: AuditLog[] = await res.json();
    set({ logs: data, loading: false });
  },
}));
