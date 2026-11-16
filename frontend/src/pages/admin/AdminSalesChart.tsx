import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";
import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui";
import type { AdminProvinceSales } from "../../services/api";

interface AdminSalesChartProps {
  data: AdminProvinceSales[];
  totalRevenue: number;
  loading?: boolean;
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatMoney = (value: number) => `Rs ${numberFormatter.format(value)}`;

const formatCompactMoney = (value: number) => {
  if (value >= 1_000_000) {
    return `Rs ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `Rs ${(value / 1_000).toFixed(1)}k`;
  }
  return `Rs ${value}`;
};

const renderTooltip = ({
  active,
  payload,
}: TooltipContentProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0]?.payload as AdminProvinceSales | undefined;

  if (!point) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-text-primary">{point.province}</p>
      <p className="text-sm text-text-secondary">Sales: {formatMoney(point.revenue)}</p>
      <p className="text-sm text-text-secondary">
        Orders: {numberFormatter.format(point.orders)}
      </p>
    </div>
  );
};

export const AdminSalesChart = ({
  data,
  totalRevenue,
  loading = false,
}: AdminSalesChartProps) => {
  const hasSales = totalRevenue > 0;

  return (
    <Card variant="outlined" className="mb-4 sm:mb-6">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2 sm:pb-4">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden="true" />
            Nationwide Sales
          </CardTitle>
          <p className="mt-1 text-xs text-text-secondary">
            Paid orders across all seven provinces
          </p>
        </div>
        {hasSales && (
          <Badge variant="primary" size="sm">
            {formatMoney(totalRevenue)} total
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {loading && !hasSales ? (
          <div className="flex h-80 items-center justify-center px-6">
            <div className="w-full max-w-xl animate-pulse space-y-4" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-6 rounded bg-border/60"
                  style={{ width: `${90 - index * 12}%` }}
                />
              ))}
            </div>
          </div>
        ) : !hasSales ? (
          <div className="flex h-80 w-full items-center justify-center px-6">
            <div className="max-w-sm text-center">
              <BarChart3 className="mx-auto mb-3 h-10 w-10 text-border" aria-hidden="true" />
              <p className="font-medium text-text-primary">No sales yet</p>
              <p className="mt-1 text-sm text-text-secondary">
                Revenue from paid orders across Nepal will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div
            className="h-80 w-full"
            role="img"
            aria-label="Bar chart showing paid sales revenue by province across Nepal"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="var(--color-border)"
                />
                <XAxis
                  type="number"
                  tickFormatter={formatCompactMoney}
                  tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--color-border)" }}
                  tickLine={false}
                  width={80}
                />
                <YAxis
                  type="category"
                  dataKey="province"
                  width={100}
                  tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={renderTooltip}
                  cursor={{ fill: "var(--color-surface-hover)" }}
                />
                <Bar
                  dataKey="revenue"
                  name="Sales"
                  fill="var(--color-primary)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
