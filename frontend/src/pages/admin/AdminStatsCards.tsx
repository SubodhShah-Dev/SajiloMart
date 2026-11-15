import { Store, ShieldAlert, ShieldCheck, Ban } from "lucide-react";
import { Card, CardContent } from "../../components/ui";

interface AdminStatsCardsProps {
  total: number;
  pending: number;
  verified: number;
  suspended: number;
}

export const AdminStatsCards = ({
  total,
  pending,
  verified,
  suspended,
}: AdminStatsCardsProps) => {
  const stats = [
    {
      label: "Total Stores",
      value: total,
      icon: Store,
      iconBg: "bg-primary-light",
      iconColor: "text-primary",
      valueColor: "text-text-primary",
    },
    {
      label: "Pending Verification",
      value: pending,
      icon: ShieldAlert,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      valueColor: "text-warning",
    },
    {
      label: "Verified Stores",
      value: verified,
      icon: ShieldCheck,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      valueColor: "text-success",
    },
    {
      label: "Suspended Stores",
      value: suspended,
      icon: Ban,
      iconBg: "bg-danger/10",
      iconColor: "text-accent",
      valueColor: "text-accent",
    },
  ];

  return (
    <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4 sm:mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} variant="outlined">
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold mt-1 md:mt-2 md:text-3xl ${stat.valueColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 sm:p-3 rounded-lg ${stat.iconBg} ${stat.iconColor}`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};