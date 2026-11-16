import { Wallet, ShoppingBag, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "../../components/ui";
import type { AdminSalesSummary } from "../../services/api";

interface AdminSalesCardsProps {
  summary: AdminSalesSummary | null;
  loading?: boolean;
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatMoney = (value: number) => `Rs ${numberFormatter.format(value)}`;

export const AdminSalesCards = ({ summary, loading = false }: AdminSalesCardsProps) => {
  const cards = [
    {
      label: "Total Sales",
      value: summary ? formatMoney(summary.totalRevenue) : null,
      icon: Wallet,
      iconBg: "bg-primary-light",
      iconColor: "text-primary",
      valueColor: "text-text-primary",
    },
    {
      label: "Paid Orders",
      value: summary ? numberFormatter.format(summary.paidOrders) : null,
      icon: ShoppingBag,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      valueColor: "text-success",
    },
    {
      label: "Avg. Order Value",
      value: summary ? formatMoney(summary.averageOrderValue) : null,
      icon: TrendingUp,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      valueColor: "text-text-primary",
    },
    {
      label: "Pending Payments",
      value: summary ? numberFormatter.format(summary.pendingPayments) : null,
      icon: Clock,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      valueColor: "text-warning",
    },
  ];

  return (
    <section
      aria-label="Sales overview"
      aria-busy={loading}
      className="mb-4 grid grid-cols-1 gap-4 sm:mb-6 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} variant="outlined">
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {card.label}
                  </p>
                  {card.value === null && loading ? (
                    <span
                      className="mt-2 block h-7 w-24 animate-pulse rounded bg-border/60 sm:h-8"
                      aria-hidden="true"
                    />
                  ) : (
                    <p
                      className={`mt-1 break-words text-xl font-bold sm:text-2xl md:mt-2 md:text-3xl ${card.valueColor}`}
                    >
                      {card.value ?? "—"}
                    </p>
                  )}
                </div>
                <div className={`shrink-0 rounded-lg p-2.5 sm:p-3 ${card.iconBg} ${card.iconColor}`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
};
