import { useState } from "react";

export const AuditTable = () => {
  const [logs] = useState([
    { id: "1", timestamp: "2025-10-01T10:00", user: "admin", module: "Orders", action: "Create" },
    { id: "2", timestamp: "2025-10-01T11:00", user: "planner", module: "Planning", action: "Update" },
  ]);

  return (
    <table className="w-full border rounded mb-4">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-4 py-2">Timestamp</th>
          <th className="border px-4 py-2">User</th>
          <th className="border px-4 py-2">Module</th>
          <th className="border px-4 py-2">Action</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr key={log.id} className="hover:bg-gray-50 cursor-pointer">
            <td className="border px-4 py-2">{log.timestamp}</td>
            <td className="border px-4 py-2">{log.user}</td>
            <td className="border px-4 py-2">{log.module}</td>
            <td className="border px-4 py-2">{log.action}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
