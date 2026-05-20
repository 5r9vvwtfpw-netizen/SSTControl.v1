import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getQueryFn } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BadgeCheck, CalendarCheck2 } from "lucide-react";

const SESSION_KEY = "sst_subscription_notice_shown";

const COMPANY_ROLES = new Set(["superusuario", "admin"]);

export function SubscriptionValidityDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const shownRef = useRef(false);

  const isCompanyUser = !!user && COMPANY_ROLES.has(user.role ?? "");

  const { data, isSuccess } = useQuery<{
    subscription?: { status?: string; currentPeriodEnd?: string };
  }>({
    queryKey: ["/api/billing/my-subscription"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isCompanyUser,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!isCompanyUser || !isSuccess || shownRef.current) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const sub = data?.subscription;
    if (!sub || sub.status !== "active" || !sub.currentPeriodEnd) return;

    shownRef.current = true;
    sessionStorage.setItem(SESSION_KEY, "1");
    setOpen(true);
  }, [isCompanyUser, isSuccess, data]);

  if (!open || !data?.subscription?.currentPeriodEnd) return null;

  const endDate = new Date(data.subscription.currentPeriodEnd);
  const formattedDate = endDate.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md" data-testid="dialog-subscription-validity">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <BadgeCheck className="h-6 w-6 text-emerald-600 flex-shrink-0" />
            Licencia SST Colombia activa
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 pt-1">
              <p className="text-base text-foreground leading-relaxed">
                Su suscripción al sistema{" "}
                <span className="font-semibold">SST Colombia</span> se encuentra
                activa y tiene validez hasta el:
              </p>
              <div className="flex items-center gap-3 rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 px-4 py-3">
                <CalendarCheck2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span
                  className="font-semibold text-emerald-800 dark:text-emerald-200 text-base"
                  data-testid="text-license-valid-until"
                >
                  {capitalizedDate}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Durante este período tiene acceso completo a todas las
                funcionalidades del sistema según los estándares de la
                Resolución 0312/2019.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button
            onClick={() => setOpen(false)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="button-close-subscription-notice"
          >
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
