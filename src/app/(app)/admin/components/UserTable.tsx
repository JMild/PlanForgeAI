import StatusBadge from "@/src/components/shared/StatusBadge";
import IconButton from "@/src/components/shared/button/IconButton";
import { Group, Permission, Screen, User } from "@/src/types";
import { Edit3, Trash2 } from "lucide-react";

type Props = {
  users: User[];
  groups: Group[];
  onEdit: (u: User) => void;
  onToggleActive: (user_id: number) => void;
  onChangeGroup: (user_id: number, group_id: number) => void;
};

export default function UserTable({
  users,
  groups,
  onEdit,
  onToggleActive,
  onChangeGroup,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              User
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Department
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Email
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Group
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Status
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-40">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {users.map((u) => (
            <tr key={u.user_id} className="hover:bg-slate-50">
              {/* User */}
              <td className="px-4 py-2">
                <div className="flex items-center gap-3">
                  <img
                    className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                    src={u.profile_image_url || `https://i.pravatar.cc/100?u=${u.username}`}
                    alt={u.username}
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {u.username} <span className="text-slate-500">— {u.full_name}</span>
                    </div>
                    <div className="text-xs text-slate-500">{u.employee_code}</div>
                  </div>
                </div>
              </td>

              {/* Department */}
              <td className="px-4 py-2 text-sm text-slate-700">{u.department || "-"}</td>

              {/* Email */}
              <td className="px-4 py-2 text-sm text-slate-700">{u.email || "-"}</td>

              {/* Group */}
              <td className="px-4 py-2 text-sm text-slate-700">{u.group_name || "-"}</td>      

              {/* Status */}
              <td className="px-4 py-2">
                {/* <Badge active={!!u.is_active} /> */}
                <StatusBadge label="Default" type="blue" />
              </td>

              {/* Actions */}
              <td className="px-4 py-2">
                <div className="flex gap-2">
                  <IconButton tooltip="Edit" onClick={() => onEdit(u)}>
                    <Edit3 size={16} />
                  </IconButton>
                  <IconButton
                    variant="warn"
                    tooltip="Toggle Active"
                    onClick={() => onToggleActive(u.user_id)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-slate-500 text-sm">
                No users
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
