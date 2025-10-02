import { useState, useMemo } from "react";

/**
 * Hook สำหรับจัดการ pagination (page, pageSize, และ slice ข้อมูล)
 * @param data - array ที่ต้องการ paginate
 * @param initialPageSize - จำนวน item ต่อหน้าเริ่มต้น (default = 10)
 */
export function usePagination<T>(data: T[], initialPageSize: number = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = useMemo(() => Math.ceil(data.length / pageSize), [data.length, pageSize]);

  // ข้อมูลที่อยู่ในหน้านั้นๆ
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, page, pageSize]);

  // reset page เมื่อ data หรือ pageSize เปลี่ยน
  const resetPage = () => setPage(1);

  return {
    pagedData,
    page,
    pageSize,
    total: data.length,
    totalPages,
    setPage,
    setPageSize,
    resetPage,
  };
}
