import { useAuth0 } from "@auth0/auth0-react";
import { JWT_ROLE } from "utils/constants";
import { MobileSlide } from "./types";
import slides from "./slides";

function isWarehouseVolunteer(roles: string | string[]): boolean {
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.some((r) => r.includes("warehouse_volunteer"));
}

function isFreeShopVolunteer(roles: string | string[]): boolean {
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.some((r) => r.includes("free_shop_volunteer"));
}

function isCoordinatorOrAbove(roles: string | string[]): boolean {
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.some(
    (r) => r.includes("coordinator") || r === "administrator" || r === "boxtribute_god",
  );
}

/**
 * Returns the mobile walkthrough slides visible to the current user based on their roles.
 * - Slides with no requiredRole are visible to everyone.
 * - Slides with requiredRole="warehouse_volunteer" are visible to warehouse volunteers and
 *   coordinators/above.
 * - Slides with requiredRole="free_shop_volunteer" are visible to free-shop volunteers and
 *   coordinators/above.
 * - Coordinators and above see all slides.
 */
export function useVisibleSlides(): MobileSlide[] {
  const { user } = useAuth0();
  const roles: string | string[] = user?.[JWT_ROLE] ?? [];

  const isCoordinator = isCoordinatorOrAbove(roles);
  const isWarehouse = isWarehouseVolunteer(roles);
  const isFreeShop = isFreeShopVolunteer(roles);

  return slides.filter((slide) => {
    if (!slide.requiredRole) return true;
    if (isCoordinator) return true;
    if (slide.requiredRole === "warehouse_volunteer" && isWarehouse) return true;
    if (slide.requiredRole === "free_shop_volunteer" && isFreeShop) return true;
    return false;
  });
}
