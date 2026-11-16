import { AppDataSource } from "../config/data-source.js";

/**
 * The seven provinces of Nepal. The sales chart always reports every province,
 * including ones with no paid orders yet, so the dashboard represents the whole
 * country rather than only the regions that already sold something.
 */
export const NEPAL_PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
] as const;

export interface SalesSummary {
  totalRevenue: number;
  paidOrders: number;
  averageOrderValue: number;
  pendingPayments: number;
}

export interface ProvinceSales {
  province: string;
  revenue: number;
  orders: number;
}

export interface SalesAnalytics {
  summary: SalesSummary;
  byProvince: ProvinceSales[];
  unknownProvince: {
    revenue: number;
    orders: number;
  };
}

export interface StoreCounts {
  total: number;
  pendingVerification: number;
  verified: number;
  suspended: number;
}

export interface AdminOverview {
  sales: SalesAnalytics;
  stores: StoreCounts;
}

interface SalesTotalsRow {
  totalRevenue: string | number | null;
  paidOrders: string | number | null;
}

interface PendingPaymentsRow {
  pendingPayments: string | number | null;
}

interface ProvinceSalesRow {
  province: string | null;
  revenue: string | number | null;
  orders: string | number | null;
}

interface StoreCountsRow {
  total: string | number | null;
  pendingVerification: string | number | null;
  verified: string | number | null;
  suspended: string | number | null;
}

/**
 * A sale is a completed payment on an order that has not been cancelled or
 * soft-deleted. This deliberately excludes pending COD cash and unpaid card
 * orders, which are not revenue yet.
 */
const SALES_FILTER =
  "is_removed = 0 AND status <> 'CANCELLED' AND payment_status = 'COMPLETED'";

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

async function getSalesAnalytics(): Promise<SalesAnalytics> {
  const [totalsRows, pendingRows, provinceRows] = await Promise.all([
    AppDataSource.query(
      `SELECT COALESCE(SUM(total), 0) AS totalRevenue, COUNT(*) AS paidOrders
       FROM \`orders\`
       WHERE ${SALES_FILTER}`,
    ) as Promise<SalesTotalsRow[]>,
    AppDataSource.query(
      `SELECT COUNT(*) AS pendingPayments
       FROM \`orders\`
       WHERE is_removed = 0 AND status <> 'CANCELLED' AND payment_status = 'PENDING'`,
    ) as Promise<PendingPaymentsRow[]>,
    AppDataSource.query(
      `SELECT
         JSON_UNQUOTE(JSON_EXTRACT(shipping_address, '$.province')) AS province,
         COALESCE(SUM(total), 0) AS revenue,
         COUNT(*) AS orders
       FROM \`orders\`
       WHERE ${SALES_FILTER}
       GROUP BY province`,
    ) as Promise<ProvinceSalesRow[]>,
  ]);

  const totalRevenue = roundMoney(toNumber(totalsRows[0]?.totalRevenue));
  const paidOrders = toNumber(totalsRows[0]?.paidOrders);
  const pendingPayments = toNumber(pendingRows[0]?.pendingPayments);

  const provinceBuckets = new Map<string, ProvinceSales>(
    NEPAL_PROVINCES.map((province) => [
      province.toLowerCase(),
      { province, revenue: 0, orders: 0 },
    ]),
  );

  const unknownProvince = { revenue: 0, orders: 0 };

  for (const row of provinceRows) {
    const key = (row.province ?? "").trim().toLowerCase();
    const bucket = provinceBuckets.get(key);

    if (bucket) {
      bucket.revenue = roundMoney(bucket.revenue + toNumber(row.revenue));
      bucket.orders += toNumber(row.orders);
    } else {
      unknownProvince.revenue = roundMoney(
        unknownProvince.revenue + toNumber(row.revenue),
      );
      unknownProvince.orders += toNumber(row.orders);
    }
  }

  return {
    summary: {
      totalRevenue,
      paidOrders,
      averageOrderValue:
        paidOrders > 0 ? roundMoney(totalRevenue / paidOrders) : 0,
      pendingPayments,
    },
    byProvince: NEPAL_PROVINCES.map(
      (province) => provinceBuckets.get(province.toLowerCase())!,
    ),
    unknownProvince,
  };
}

async function getStoreCounts(): Promise<StoreCounts> {
  const rows = (await AppDataSource.query(
    `SELECT
       COUNT(*) AS total,
       COALESCE(SUM(CASE WHEN verification_status = 'PENDING' THEN 1 ELSE 0 END), 0) AS pendingVerification,
       COALESCE(SUM(CASE WHEN verification_status = 'VERIFIED' THEN 1 ELSE 0 END), 0) AS verified,
       COALESCE(SUM(CASE WHEN status = 'SUSPENDED' THEN 1 ELSE 0 END), 0) AS suspended
     FROM \`stores\`
     WHERE is_removed = 0`,
  )) as StoreCountsRow[];

  const row = rows[0];

  return {
    total: toNumber(row?.total),
    pendingVerification: toNumber(row?.pendingVerification),
    verified: toNumber(row?.verified),
    suspended: toNumber(row?.suspended),
  };
}

/**
 * Admin dashboard metrics: platform-wide sales and store counts. Computed in
 * SQL so the numbers never depend on the currently paged store rows.
 */
export async function getAdminOverview(): Promise<AdminOverview> {
  const [sales, stores] = await Promise.all([
    getSalesAnalytics(),
    getStoreCounts(),
  ]);

  return { sales, stores };
}
