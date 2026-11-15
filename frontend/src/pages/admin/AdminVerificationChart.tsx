import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui";

interface AdminVerificationChartProps {
  data: {
    name: string;
    count: number;
    fill: string;
  }[];
}

export const AdminVerificationChart = ({ data }: AdminVerificationChartProps) => {
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <Card variant="outlined">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            Stores by Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-80 w-full flex items-center justify-center">
            <p className="text-text-secondary">No data to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          Stores by Verification Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-80 w-full" role="img" aria-label="Bar chart showing stores by verification status">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--text-secondary))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--text-secondary))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--surface))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ color: "hsl(var(--text-primary))" }}
                formatter={(value) => [Number(value) || 0, "Stores"]}
              />
              <Legend
                wrapperStyle={{ paddingTop: "8px" }}
                iconType="circle"
                formatter={(value: string) => value}
              />
              <Bar
                dataKey="count"
                name="Stores"
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};