import { useAuth0 } from "@auth0/auth0-react";

interface IUseAuthorizationProps {
  minBeta?: number;
}

export function useAuthorization({ minBeta }: IUseAuthorizationProps) {
  const { user } = useAuth0();

  // Check if user has a beta flag higher than the minimum
  const isAuthorized =
    user && parseInt(user["https://www.boxtribute.com/beta_user"] ?? "0", 10) >= (minBeta ?? 0);

  // Check if user has all the required permissions
  //   const isAuthorized = requiredPermissions.every(permission =>
  //     userPermissions.includes(permission)
  //   );

  return isAuthorized;
}
