type BadgeNavigator = Navigator & {
  setAppBadge?: (contents?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

type BadgeRegistration = ServiceWorkerRegistration & {
  setAppBadge?: (contents?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

export async function syncAppBadge(count: number): Promise<boolean> {
  const normalizedCount = Math.max(0, Math.floor(count));
  const badgeNavigator = navigator as BadgeNavigator;
  let registration: BadgeRegistration | undefined;

  if ("serviceWorker" in navigator) {
    try {
      registration = await navigator.serviceWorker.ready as BadgeRegistration;
    } catch {
      registration = undefined;
    }
  }

  const operations: Promise<void>[] = [];
  if (normalizedCount > 0) {
    if (badgeNavigator.setAppBadge) operations.push(badgeNavigator.setAppBadge(normalizedCount));
    if (registration?.setAppBadge) operations.push(registration.setAppBadge(normalizedCount));
  } else {
    if (badgeNavigator.clearAppBadge) operations.push(badgeNavigator.clearAppBadge());
    if (registration?.clearAppBadge) operations.push(registration.clearAppBadge());
  }

  if (operations.length === 0) return false;
  const results = await Promise.allSettled(operations);
  return results.some((result) => result.status === "fulfilled");
}