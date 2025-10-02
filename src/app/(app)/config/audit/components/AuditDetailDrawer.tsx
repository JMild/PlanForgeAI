import { useState } from "react";

export const AuditDetailDrawer = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="mb-4 bg-gray-200 px-3 py-2 rounded"
      >
        {open ? "Close Details" : "Open Details (Mock)"}
      </button>

      {open && (
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-bold mb-2">Audit Detail (Mock)</h2>
          <p><b>User:</b> admin</p>
          <p><b>Module:</b> Orders</p>
          <p><b>Action:</b> Create</p>
          <p><b>Timestamp:</b> 2025-10-01T10:00</p>
          <p><b>Details:</b> This is a mock audit log detail.</p>
        </div>
      )}
    </>
  );
};
