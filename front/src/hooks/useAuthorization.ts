import { useAuth0 } from "@auth0/auth0-react";
import { JWT_ROLE, JWT_ABP, JWT_BETA } from "utils/constants";

/**
 * requiredAbps: [abp1, abp2] => user must have abp1 AND abp2
 * 
 * @todo Do users have such ABP structure? 
 * requiredAbps: [[abp1, apb2], abp3] => user must have (abp1 OR abp2) AND abp3
 */
export type AuthorizeProps = {
  requiredAbps?: string[];
  minBeta?: number;
}

export function useAuthorization() {
  const { user } = useAuth0();

  const authorize = ({ requiredAbps, minBeta }: AuthorizeProps) =>
    user &&
    (user[JWT_ROLE].includes("xereca") ||
      ((requiredAbps?.every((abp) => user[JWT_ABP].includes(abp),
      ) ?? true) && parseInt(user[JWT_BETA], 10) >= (minBeta ?? 0)));

  return authorize;
}
