import React from "react";
import EmptyState from "../EmptyState";
import Loading from "../../Loading";

type Column<T> = {
  key: keyof T | string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (item: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: readonly Column<T>[];
  data: readonly T[];
  rowKey?: (item: T) => string | number;
  isLoading?: boolean; 
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  isLoading = false, 
}: DataTableProps<T>) {
  const alignClasses: Record<NonNullable<Column<T>["align"]>, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    // max-w-7xl mx-auto 
    <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key.toString()}
                  className={`px-6 py-3 text-xs font-medium text-white/70 uppercase tracking-wider ${
                    alignClasses[col.align ?? "left"]
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length}>
                  <Loading />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState />
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={rowKey ? rowKey(row) : i} className="hover:bg-white/5">
                  {columns.map((col) => (
                    <td
                      key={col.key.toString()}
                      className={`px-6 py-4 text-sm ${
                        alignClasses[col.align ?? "left"]
                      }`}
                    >
                      {col.render
                        ? col.render(row)
                        : (row[col.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
