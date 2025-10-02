"use client";

import React from "react";
import clsx from "clsx";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Dropdown from "./input/Dropdown";

export type Column<T> = {
headerClassName: (key: string, col: Column<T>) => string | undefined;
  key: string;
  header: string;
  className?: string;
  render: (row: T, index: number) => React.ReactNode;
};

type PaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizes?: number[];
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  className?: string;
  pagination?: PaginationProps;
  emptyText?: string;
  title?: React.ReactNode;
};

export default function CommonTable<T extends Record<string, unknown>>({
  columns,
  data,
  className = "",
  pagination,
  emptyText = "No data",
  title = "Table",
}: Props<T>) {
  const hasPagination =
    !!pagination &&
    typeof pagination.total === "number" &&
    typeof pagination.page === "number" &&
    typeof pagination.pageSize === "number" &&
    typeof pagination.onPageChange === "function";

  const total = hasPagination ? pagination!.total : data.length;
  const page = hasPagination ? pagination!.page : 1;
  const pageSize = hasPagination ? pagination!.pageSize : data.length || 10;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(total, page * pageSize);

  const pageWindow = getPageWindow(page, pageCount, 5);

  return (
    <div
      className={clsx(
        "relative overflow-x-auto shadow-sm sm:rounded-xl border border-slate-200 dark:border-slate-700",
        className
      )}
    >
      {/* Header */}
      <div className="px-6 pt-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-xl">
        {title && (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {title}
          </div>
        )}
      </div>

      {/* Table */}
      <table className="min-w-[600px] w-full text-sm text-left rtl:text-right text-slate-600 dark:text-slate-300 border-collapse">
        <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                className={clsx(
                  "px-6 py-3 font-semibold border-b border-slate-200 dark:border-slate-700",
                  col.headerClassName
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr className="bg-white dark:bg-slate-900">
              <td
                className="px-6 py-10 text-center text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700"
                colSpan={columns.length}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={clsx(
                      "px-6 py-4 border-b border-slate-100 dark:border-slate-700",
                      col.className
                    )}
                  >
                    {col.render ? col.render(row, i) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {hasPagination && (
        <nav
          className="flex items-center flex-col gap-3 md:flex-row md:justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-slate-900/40 rounded-b-xl"
          aria-label="Table navigation"
        >
          {/* Left: summary + rows per page */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {start}-{end}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {total}
              </span>
            </span>

            {pagination?.onPageSizeChange && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Rows per page
                </span>
                <Dropdown
                  value={String(pageSize)}
                  onChange={(val) => pagination.onPageSizeChange?.(Number(val))}
                  options={(pagination.pageSizes ?? [10, 20, 50]).map((size) => ({
                    label: String(size),
                    value: String(size),
                  }))}
                />
              </div>
            )}
          </div>

          {/* Right: pagination controls */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <span className="md:hidden text-sm text-slate-500 dark:text-slate-400">
              Page <b className="text-slate-900 dark:text-white">{page}</b> / {pageCount}
            </span>

            <div className="inline-flex items-center rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm">
              <PaginationButton
                onClick={() => pagination.onPageChange(Math.max(1, page - 1))}
                disabled={page <= 1}
                first
              >
                <ChevronLeft className="w-4 h-4" />
              </PaginationButton>

              {pageWindow.map((p, idx) =>
                p === "…" ? (
                  <PaginationButton key={`ellipsis-${idx}`} disabled>
                    …
                  </PaginationButton>
                ) : (
                  <PaginationButton
                    key={p}
                    active={p === page}
                    onClick={() => pagination.onPageChange(p)}
                  >
                    {p}
                  </PaginationButton>
                )
              )}

              <PaginationButton
                onClick={() => pagination.onPageChange(Math.min(pageCount, page + 1))}
                disabled={page >= pageCount}
                last
              >
                <ChevronRight className="w-4 h-4" />
              </PaginationButton>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

/* ---------- Helpers ---------- */

function getPageWindow(current: number, totalPages: number, windowSize = 5): (number | "…")[] {
  if (totalPages <= windowSize) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(totalPages, start + windowSize - 1);

  if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);

  const pages: (number | "…")[] = [];
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("…");
  }
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("…");
    pages.push(totalPages);
  }
  return pages;
}

/* ---------- Pagination Button ---------- */
function PaginationButton({
  children,
  onClick,
  disabled,
  active,
  first,
  last,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean

  first?: boolean;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "h-8 px-3 text-sm transition-colors focus:outline-none",
        "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300",
        "hover:bg-slate-100 dark:hover:bg-slate-700",
        !first && "border-l border-slate-300 dark:border-slate-700",
        first && "rounded-l-2xl",
        last && "rounded-r-2xl",
        active &&
          "bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white font-semibold",
        disabled && "opacity-60 cursor-not-allowed hover:bg-inherit"
      )}
    >
      {children}
    </button>
  );
}
