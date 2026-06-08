import { useAuth0 } from "@auth0/auth0-react";
import { JWT_ROLE } from "utils/constants";
import { WalkthroughPath } from "./paths/types";
import path1 from "./paths/path1";
import path2 from "./paths/path2";
import path3 from "./paths/path3";
import { isCoordinatorOrAbove, isWarehouseVolunteer } from "../roles";

/** Returns the walkthrough paths visible to the current user based on their roles. */
export function useVisiblePaths(): WalkthroughPath[] {
  const { user } = useAuth0();
  const roles: string | string[] = user?.[JWT_ROLE] ?? [];

  const showPath2 = !isWarehouseVolunteer(roles);
  const showPath3 = isCoordinatorOrAbove(roles);

  return [path1, ...(showPath2 ? [path2] : []), ...(showPath3 ? [path3] : [])];
}
