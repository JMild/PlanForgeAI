import { useMemo } from "react";
import { Group, Permission, Screen, User } from "@/src/types";

export function useGroupData(
  groups: Group[],
  users: User[],
  currentGroupId: number | null
) {
  const currentGroup = useMemo(
    () => groups.find((x) => x.group_id === currentGroupId) || null,
    [groups, currentGroupId]
  );

  const members = useMemo(
    () => (users ?? []).filter((u) => u.user_group_id === currentGroup?.group_id),
    [users, currentGroup]
  );

  const candidates = useMemo(
    () => (users ?? []).filter((u) => u.user_group_id !== currentGroup?.group_id),
    [users, currentGroup]
  );

  const memberCount = (gid: number) =>
    (users ?? []).filter((u) => u.user_group_id === gid).length;

  return {
    currentGroup,
    members,
    candidates,
    memberCount,
  };
}
