import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface SubscriptionStatus {
  isActive: boolean;
  isBlocked: boolean;
  isTrial: boolean;
  trialEndsAt: string | null;
  subscriptionStatus: string;
  blockedReason: string | null;
  daysRemaining: number | null;
}

interface UserWithSubscription {
  id: string;
  username: string;
  email: string;
  role: string;
  companyId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
}

const EXCLUDED_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/checkout",
  "/pricing",
  "/landing",
  "/mi-suscripcion",
];

export function useSubscriptionCheck() {
  const [location] = useLocation();

  const { data: user, isLoading } = useQuery<UserWithSubscription>({
    queryKey: ["/api/user"],
    retry: false,
  });

  const isExcludedPath = EXCLUDED_PATHS.some((path) => 
    location === path || location.startsWith(path + "/") || location.startsWith("/checkout")
  );

  const exemptRoles = ['superadmin', 'soporte', 'lso_externo'];
  const isExemptRole = user?.role ? exemptRoles.includes(user.role) : false;

  const shouldBlock = !isLoading && 
    !isExcludedPath && 
    !isExemptRole &&
    user?.subscriptionStatus?.isBlocked === true;

  const subscriptionStatus = user?.subscriptionStatus;

  return {
    isLoading,
    shouldBlock,
    subscriptionStatus,
    user,
    isExcludedPath,
  };
}

export default useSubscriptionCheck;
