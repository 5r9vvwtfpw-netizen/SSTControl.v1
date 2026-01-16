import { useAuth } from "./use-auth";
import { hasPermission, hasOnlySelfViewPermission, canWrite as canWritePermission, type Permission } from "@shared/permissions";

export function usePermissions() {
  const { user } = useAuth();

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const hasOnlySelfView = (resource: string): boolean => {
    if (!user) return false;
    return hasOnlySelfViewPermission(user.role, resource);
  };

  const canWrite = (resource: string): boolean => {
    if (!user) return false;
    return canWritePermission(user.role, resource);
  };

  const isWorker = (): boolean => {
    return user?.role === 'trabajador';
  };

  return {
    checkPermission,
    hasOnlySelfView,
    canWrite,
    isWorker,
    user,
  };
}
