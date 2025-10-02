import { create } from 'zustand';

export type AuditLog = {
  id: string;
  timestamp: string;
  user: string;
  module: string;
  action: string;
  details: string;
};

type AuditStore = {
  logs: AuditLog[];
  loading: boolean;
  filter: { user?: string; module?: string; action?: string; from?: string; to?: string };
  selectedLog?: AuditLog;
  setFilter: (filter: Partial<AuditStore['filter']>) => void;
  setLogs: (logs: AuditLog[]) => void;
  selectLog: (log?: AuditLog) => void;
  fetchLogs: () => Promise<void>;
};

export const useAuditStore = create<AuditStore>((set, get) => ({
  logs: [],
  loading: false,
  filter: {},
  selectedLog: undefined,
  setFilter: (filter) => set({ filter: { ...get().filter, ...filter } }),
  setLogs: (logs) => set({ logs }),
  selectLog: (log) => set({ selectedLog: log }),
  fetchLogs: async () => {
    set({ loading: true });
    const { filter } = get();
    const params = new URLSearchParams(filter as any).toString();
    const res = await fetch(`/api/audit?${params}`);
    const data: AuditLog[] = await res.json();
    set({ logs: data, loading: false });
  },
}));
