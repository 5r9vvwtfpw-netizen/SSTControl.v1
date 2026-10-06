export interface BillingRevenueTransaction {
  subscriptionId: string | null;
  amount: number | string;
  paidAt?: Date | string | null;
  createdAt: Date | string;
}

export interface MonthlyBillingRevenue {
  month: string;
  revenue: number;
  subscriptions: number;
}

export function aggregateBillingRevenueByMonth(
  transactions: BillingRevenueTransaction[],
): MonthlyBillingRevenue[] {
  const monthlyData: Record<string, { revenue: number; subscriptions: Set<string> }> = {};
  const monthFormatter = new Intl.DateTimeFormat("en", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
  });

  for (const transaction of transactions) {
    // Use the provider-confirmed payment time; creation time is only a fallback
    // for older gateway records that predate paidAt tracking.
    const date = new Date(transaction.paidAt || transaction.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    const dateParts = monthFormatter.formatToParts(date);
    const year = dateParts.find(part => part.type === "year")?.value;
    const monthNumber = dateParts.find(part => part.type === "month")?.value;
    if (!year || !monthNumber) continue;
    const month = `${year}-${monthNumber}`;
    const data = monthlyData[month] ??= { revenue: 0, subscriptions: new Set<string>() };
    data.revenue += Number(transaction.amount);
    if (transaction.subscriptionId) data.subscriptions.add(transaction.subscriptionId);
  }

  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      revenue: data.revenue,
      subscriptions: data.subscriptions.size,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}