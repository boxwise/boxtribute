export function isWarehouseVolunteer(roles: string | string[]): boolean {
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.some((r) => r.includes("warehouse_volunteer"));
}

export function isFreeShopVolunteer(roles: string | string[]): boolean {
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.some((r) => r.includes("free_shop_volunteer"));
}

export function isCoordinatorOrAbove(roles: string | string[]): boolean {
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.some(
    (r) => r.includes("coordinator") || r === "administrator" || r === "boxtribute_god",
  );
}
