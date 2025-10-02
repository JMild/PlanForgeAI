import React, { useState, useMemo } from "react";
import { Edit3, Trash2 } from "react-feather";

type Column<T> = {
  label: string;
  key: keyof T | string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
};

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  emptyText?: string;
  pagination?: boolean;
  pageSize?: number;
  searchableKeys?: (keyof T)[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

const IconButton = ({
  children,
  tooltip,
  variant,
  onClick,
}: {
  children: React.ReactNode;
  tooltip?: string;
  variant?: "warn" | "default";
  onClick: () => void;
}) => {
  const baseClasses =
    "p-1 rounded hover:bg-gray-200 transition-colors cursor-pointer";
  const warnClasses = "text-red-600 hover:bg-red-100";
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`${baseClasses} ${variant === "warn" ? warnClasses : ""}`}
      type="button"
    >
      {children}
    </button>
  );
};

export function TableComponent<T>({
  columns,
  data,
  actions,
  emptyText = "ไม่พบข้อมูล",
  pagination = true,
  pageSize = 10,
  searchableKeys,
  onEdit,
  onDelete,
}: TableProps<T>) {
  // search input state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // filter data by searchTerm and searchableKeys
  const filteredData = useMemo(() => {
    if (!searchTerm.trim() || !searchableKeys?.length) return data;
    const q = searchTerm.trim().toLowerCase();
    return data.filter((item) =>
      searchableKeys.some((key) => {
        const val = (item as any)[key];
        if (typeof val === "string" || typeof val === "number") {
          return String(val).toLowerCase().includes(q);
        }
        return false;
      })
    );
  }, [data, searchTerm, searchableKeys]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  // current page data slice
  const pagedData = pagination
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;

  // Pagination controls
  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // Reset page when data/search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, data]);

  return (
    <div className="bg-white rounded-md shadow p-4">
      {/* Search box */}
      {searchableKeys && searchableKeys.length > 0 && (
        <div className="mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหา..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-2 border">
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-2 border w-[120px] text-center">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-4 text-center text-slate-400 border"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              pagedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 transition-colors even:bg-white odd:bg-gray-50"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-2 border align-middle">
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-2 border text-center align-middle">
                      <div className="flex justify-center gap-2">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Showing */}
      {pagination && totalItems > 0 && (
        <div className="flex justify-between items-center mt-3 text-gray-600 text-sm">
          <span>
            Showing {start} to {end} of {totalItems} entries
          </span>
          <ul className="inline-flex space-x-1">
            <li>
              <button
                disabled={currentPage === 1}
                onClick={() => changePage(currentPage - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-200"
              >
                Previous
              </button>
            </li>

            {/* show pages: simple logic to show max 5 pages */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (pageNum) =>
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
              )
              .map((pageNum, idx, arr) => {
                // Insert dots
                if (
                  idx > 0 &&
                  pageNum - arr[idx - 1] !== 1
                ) {
                  return (
                    <React.Fragment key={"dots-" + pageNum}>
                      <li className="px-2 py-1 select-none">...</li>
                      <li key={pageNum}>
                        <button
                          onClick={() => changePage(pageNum)}
                          className={`px-3 py-1 border rounded hover:bg-gray-200 ${
                            pageNum === currentPage ? "bg-blue-500 text-white" : ""
                          }`}
                        >
                          {pageNum}
                        </button>
                      </li>
                    </React.Fragment>
                  );
                }
                return (
                  <li key={pageNum}>
                    <button
                      onClick={() => changePage(pageNum)}
                      className={`px-3 py-1 border rounded hover:bg-gray-200 ${
                        pageNum === currentPage ? "bg-blue-500 text-white" : ""
                      }`}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              })}

            <li>
              <button
                disabled={currentPage === totalPages}
                onClick={() => changePage(currentPage + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-200"
              >
                Next
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
