import { useAuth0 } from "@auth0/auth0-react";

interface IAuthorizeProps {
  // requiredAbps: [abp1, abp2] => user must have abp1 AND abp2
  // requiredAbps: [[abp1, apb2], abp3] => user must have (abp1 OR abp2) AND abp3
  requiredAbps?: (string | string[])[];
  minBeta?: number;
}

export function useAuthorization() {
  const { user } = useAuth0();

  const authorize = ({ requiredAbps, minBeta }: IAuthorizeProps) =>
    user &&
    (user["https://www.boxtribute.com/roles"].includes("boxtribute_god") ||
      ((requiredAbps?.every((abp) =>
        Array.isArray(abp)
          ? abp.some((innerAbp) => user["https://www.boxtribute.com/actions"].includes(innerAbp))
          : user["https://www.boxtribute.com/actions"].includes(abp),
      ) ??
        true) &&
        parseInt(user["https://www.boxtribute.com/beta_user"], 10) >= (minBeta ?? 0)));
  return authorize;
}
