import { useAuth0 } from "@auth0/auth0-react";

interface IAuthorizeProps {
  requiredAbp?: string[];
  minBeta?: number;
}

export function useAuthorization() {
  const { user } = useAuth0();

  const authorize = ({ requiredAbp, minBeta }: IAuthorizeProps) =>
    user &&
    (user["https://www.boxtribute.com/roles"].includes("boxtribute_god") ||
      ((requiredAbp?.every((abp) => user["https://www.boxtribute.com/actions"].includes(abp)) ??
        true) &&
        parseInt(user["https://www.boxtribute.com/beta_user"], 10) >= (minBeta ?? 0)));

  return authorize;
}
