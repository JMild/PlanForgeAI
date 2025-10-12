// components/shared/table/ExpandableDataTable.tsx
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import Loading from "../../Loading";
import EmptyState from "../EmptyState";

type Column<T> = {
  key: keyof T | string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (item: T) => React.ReactNode;
};

type ExpandableDataTableProps<T> = {
  columns: readonly Column<T>[];
  data: readonly T[];
  rowKey?: (item: T) => string | number;
  renderExpandedRow: (item: T) => React.ReactNode;
  isLoading?: boolean;
};

export function ExpandableDataTable<T extends object>({
  columns,
  data,
  rowKey,
  renderExpandedRow,
  isLoading = false,
}: ExpandableDataTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Record<string | number, boolean>>({});

  const toggleRow = (key: string | number) => {
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const alignClasses: Record<NonNullable<Column<T>["align"]>, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-white/70 uppercase tracking-wider" />
              {columns.map((col) => (
                <th
                  key={col.key.toString()}
                  className={`px-6 py-3 text-xs font-medium text-white/70 uppercase tracking-wider ${alignClasses[col.align ?? "left"]}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-10">
                  <Loading />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-10">
                  <EmptyState />
                </td>
              </tr>
            ) : (
              data.map((row, i) => {
                const key = rowKey ? rowKey(row) : i;
                const isExpanded = !!expandedRows[key];
                return (
                  <React.Fragment key={key}>
                    <tr className="hover:bg-white/5">
                      <td className="px-6 py-4 align-top">
                        <button
                          onClick={() => toggleRow(key)}
                          className="p-1 hover:bg-white/10 rounded"
                          aria-label={isExpanded ? "Collapse row" : "Expand row"}
                        >
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </td>
                      {columns.map((col) => (
                        <td
                          key={col.key.toString()}
                          className={`px-6 py-4 text-sm ${alignClasses[col.align ?? "left"]}`}
                        >
                          {col.render
                            ? col.render(row)
                            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (row as any)[col.key as keyof typeof row]}
                        </td>
                      ))}
                    </tr>
                    {isExpanded && (
                      <tr className="bg-white/[0.03]">
                        <td colSpan={columns.length + 1} className="px-6 py-4">
                          {renderExpandedRow(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
