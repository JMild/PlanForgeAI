import { useMemo, useState } from "react";
import { useGroupData } from "@/src/hooks/useGroupData";
import { Group, Permission, Screen, User } from "@/src/types";
import { Plus, Users, Shield, Search, ChevronLeft, ChevronRight } from "lucide-react";
import SearchInput from "@/src/components/shared/input/SearchInput";
import { AddButton } from "@/src/components/shared/button/ActionButtons";

type Props = {
  groups: Group[];
  users: User[];
  screens: Screen[];
  permissions: Permission[];
  currentGroupId: number | null;
  setCurrentGroupId: (id: number) => void;
  onToggleGroupActive: (id: number) => void;
  onAddGroup: () => void;
  onAddMember: (uid: number, gid: number) => void;
  onRemoveMember: (uid: number) => void;
  onGrantAll: (gid: number, flag: boolean) => void;
  onTogglePerm: (
    gid: number,
    code: string,
    key: keyof Permission,
    value: boolean
  ) => void;
};

const StatusBadge = ({ active }: { active: boolean }) => (
  <span
    className={
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border " +
      (active
        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
        : "bg-rose-50 text-rose-700 border-rose-300")
    }
  >
    {active ? "Active" : "Inactive"}
  </span>
);

export default function GroupsView({
  groups,
  users,
  screens,
  permissions,
  currentGroupId,
  setCurrentGroupId,
  onToggleGroupActive,
  onAddGroup,
  onAddMember,
  onRemoveMember,
  onGrantAll,
  onTogglePerm,
}: Props) {
  const { currentGroup: g, members, candidates, memberCount } = useGroupData(
    groups,
    users,
    currentGroupId
  );

  // Search + filter groups (left panel)
  const [q, setQ] = useState("");
  const filteredGroups = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return groups;
    return groups.filter(
      (x) =>
        x.group_name.toLowerCase().includes(kw) ||
        (x.description || "").toLowerCase().includes(kw)
    );
  }, [groups, q]);

  // Prev/Next shortcuts (like the chevrons in screenshot)
  const cycleGroup = (dir: -1 | 1) => {
    if (!groups.length) return;
    const idx = Math.max(
      0,
      groups.findIndex((gg) => gg.group_id === g?.group_id)
    );
    const next = groups[(idx + dir + groups.length) % groups.length];
    setCurrentGroupId(next.group_id);
  };

  const handleAddMember = () => {
    const el = document.getElementById("addMemberSelect") as HTMLSelectElement | null;
    const uid = Number(el?.value);
    if (uid && g) onAddMember(uid, g.group_id);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
      {/* LEFT: Group list */}
      <aside className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Groups &amp; Permissions
              </h3>
            </div>
            <div className="flex items-center gap-1 pb-2">
              <AddButton onClick={onAddGroup} label='New Group'/>
            </div>
          </div>

          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="ค้นหากลุ่ม…"
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredGroups.length === 0 && (
            <div className="px-2 py-6 text-center text-sm text-slate-500">
              ไม่พบกลุ่มที่ค้นหา
            </div>
          )}

          <ul className="space-y-2">
            {filteredGroups.map((grp) => {
              const active = grp.group_id === g?.group_id;
              return (
                <li key={grp.group_id}>
                  <button
                    onClick={() => setCurrentGroupId(grp.group_id)}
                    className={[
                      "w-full rounded-lg border px-3 py-2 text-left transition",
                      "flex items-start justify-between gap-3",
                      active
                        ? "border-sky-300 bg-sky-50 ring-1 ring-sky-200"
                        : "border-slate-200 bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-900">
                        {grp.group_name}{" "}
                        <span className="text-xs font-normal text-slate-500">
                          ({memberCount(grp.group_id)})
                        </span>
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {grp.description || ""}
                      </div>
                    </div>
                    <StatusBadge active={!!grp.is_active} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* RIGHT: Group detail */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-slate-900">
              {g?.group_name ?? "Select a group"}
            </div>
            <div className="text-xs text-slate-500">{g?.description ?? "—"}</div>
          </div>

          <div className="flex items-center gap-3">
            {g && <StatusBadge active={!!g.is_active} />}

            <label className="inline-flex select-none items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700">
              <span className="text-xs text-slate-500">Active</span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-sky-600"
                checked={!!g?.is_active}
                onChange={() => g && onToggleGroupActive(g.group_id)}
              />
            </label>
          </div>
        </div>

        {!g ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <Shield className="h-8 w-8 text-slate-400" />
            <div className="text-sm font-medium text-slate-700">ยังไม่ได้เลือกกลุ่ม</div>
            <div className="text-xs text-slate-500">
              เลือกกลุ่มจากฝั่งซ้ายเพื่อจัดการสมาชิกและสิทธิ์
            </div>
          </div>
        ) : (
          <>
            {/* Members */}
            <div className="mb-6 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                <Users className="h-4 w-4 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-900">Members</h4>
              </div>

              <div className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  {members.map((u) => (
                    <span
                      key={u.user_id}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm text-slate-700"
                    >
                      <img
                        src={
                          u.profile_image_url ||
                          `https://i.pravatar.cc/100?u=${u.username}`
                        }
                        className="h-5 w-5 rounded-full border border-slate-200 object-cover"
                        alt={u.username}
                      />
                      {u.username}
                      <button
                        className="rounded-full p-1 text-slate-500 hover:bg-white hover:text-slate-700"
                        onClick={() => onRemoveMember(u.user_id)}
                        aria-label="Remove"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </span>
                  ))}

                  {members.length === 0 && (
                    <span className="text-xs text-slate-500/80">(no members)</span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select
                    id="addMemberSelect"
                    className="w-full sm:w-72 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    onChange={(e) => {
                      const uid = Number(e.target.value);
                      if (uid && g) onAddMember(uid, g.group_id);
                    }}
                    value=""
                  >
                    <option value="">— Select user —</option>
                    {candidates.map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.username} — {u.full_name || ""}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleAddMember}
                    className="inline-flex items-center rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  >
                    Add to Group
                  </button>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="rounded-lg border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-500" />
                  <h4 className="text-sm font-semibold text-slate-900">Permissions</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                    onClick={() => onGrantAll(g.group_id, true)}
                  >
                    Grant ALL
                  </button>
                  <button
                    className="inline-flex items-center rounded-md border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-800 hover:bg-rose-100"
                    onClick={() => onGrantAll(g.group_id, false)}
                  >
                    Revoke ALL
                  </button>
                </div>
              </div>

              {/* grid + horizontal scroll only here */}
              <div className="overflow-x-auto">
              <div className="min-w-[760px] grid grid-cols-[1.5fr_repeat(4,120px)] items-center gap-2 px-4 py-2 bg-slate-100">
                {["Screen", "View", "Add", "Edit", "Delete"].map((t) => (
                  <div
                    key={t}
                    className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    {t}
                  </div>
                ))}
              </div>
                <div>
                  {screens.map((s, idx) => {
                    const p = permissions.find((x) => x.group_id === g!.group_id && x.screen_code === s.code) || {
                      permission_id: -1,
                      group_id: g!.group_id,
                      screen_code: s.code,
                      can_view: false,
                      can_add: false,
                      can_edit: false,
                      can_delete: false,
                    };
                    return (
                      <div
                        key={s.code}
                        className={`min-w-[760px] grid grid-cols-[1.5fr_repeat(4,120px)] items-center gap-2 px-4 py-2 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100`}
                      >
                        <div className="px-2 py-2">
                          <b className="text-slate-900">{s.code}</b>{" "}
                          <span className="text-xs text-slate-500">— {s.name}</span>
                        </div>
                        {(["can_view", "can_add", "can_edit", "can_delete"] as (keyof Permission)[]).map((k) => (
                          <label
                            key={k}
                            className="flex items-center justify-center rounded-lg   px-2 py-2 cursor-pointer hover:bg-slate-100"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-sky-600"
                              checked={!!p[k]}
                              onChange={(e) => onTogglePerm(g!.group_id, s.code, k, e.target.checked)}
                            />
                          </label>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </>
        )}
      </section>
    </div>
  );
}
