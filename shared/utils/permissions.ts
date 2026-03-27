import { type UserRole, type Permission, RolePermissions } from "../constants/roles";

/** Check if a role has a specific permission */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return RolePermissions[role]?.includes(permission) ?? false;
}

/** Check if a role is at least as powerful as another */
export function isRoleAtLeast(role: UserRole, minimumRole: UserRole): boolean {
  const hierarchy: UserRole[] = ["Customer", "Admin"];
  return hierarchy.indexOf(role) >= hierarchy.indexOf(minimumRole);
}
