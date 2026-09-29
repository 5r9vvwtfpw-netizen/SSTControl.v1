export interface BillingRevenueTransaction {
  subscriptionId: string | null;
  amount: number | string;
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

  for (const transaction of transactions) {
    const date = new Date(transaction.createdAt);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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