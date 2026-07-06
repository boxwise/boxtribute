export function isWarehouseVolunteer(roles: string[]): boolean {
  return roles.some((r) => r.includes("warehouse_volunteer"));
}

export function isFreeShopVolunteer(roles: string[]): boolean {
  return roles.some((r) => r.includes("free_shop_volunteer"));
}

export function isCoordinatorOrAbove(roles: string[]): boolean {
  return roles.some(
    (r) => r.includes("coordinator") || r === "administrator" || r === "boxtribute_god",
  );
}
