import { useAuth0 } from "@auth0/auth0-react";
import { JWT_ROLE, JWT_ABP, JWT_BETA } from "utils/constants";

export type AuthorizeProps = {
  // requiredAbps: [abp1, abp2] => user must have abp1 AND abp2
  // requiredAbps: [[abp1, apb2], abp3] => user must have (abp1 OR abp2) AND abp3
  requiredAbps?: (string | string[])[];
  minBeta?: number;
}

export function useAuthorization() {
  const { user } = useAuth0();

  const authorize = ({ requiredAbps, minBeta }: AuthorizeProps) =>
    user &&
    (user[JWT_ROLE].includes("boxtribute_god") ||
      ((requiredAbps?.every((abp) =>
        Array.isArray(abp)
          ? abp.some((innerAbp) => user[JWT_ABP].includes(innerAbp))
          : user[JWT_ABP].includes(abp),
      ) ??
        true) &&
        parseInt(user[JWT_BETA], 10) >= (minBeta ?? 0)));
  return authorize;
}
