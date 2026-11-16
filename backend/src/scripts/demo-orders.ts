import { AppDataSource } from "../config/data-source.js";
import { Order } from "../entities/Order.js";
import { OrderItem } from "../entities/OrderItem.js";
import { Payment } from "../entities/Payment.js";
import type { Product } from "../entities/Product.js";
import type { User } from "../entities/User.js";

/**
 * Demo delivery locations covering every province, so the admin dashboard's
 * nationwide sales chart has data in each region after seeding.
 */
const orderRegions = [
  { district: "Kathmandu", province: "Bagmati", city: "Kathmandu" },
  { district: "Lalitpur", province: "Bagmati", city: "Lalitpur" },
  { district: "Morang", province: "Koshi", city: "Biratnagar" },
  { district: "Sunsari", province: "Koshi", city: "Itahari" },
  { district: "Dhanusha", province: "Madhesh", city: "Janakpur" },
  { district: "Bara", province: "Madhesh", city: "Kalaiya" },
  { district: "Kaski", province: "Gandaki", city: "Pokhara" },
  { district: "Chitwan", province: "Bagmati", city: "Bharatpur" },
  { district: "Rupandehi", province: "Lumbini", city: "Butwal" },
  { district: "Dang", province: "Lumbini", city: "Ghorahi" },
  { district: "Surkhet", province: "Karnali", city: "Birendranagar" },
  { district: "Jumla", province: "Karnali", city: "Jumla" },
  { district: "Kailali", province: "Sudurpashchim", city: "Dhangadhi" },
  { district: "Kanchanpur", province: "Sudurpashchim", city: "Mahendranagar" },
] as const;

interface DemoOrderInput {
  customer: User;
  product: Product;
  quantity: number;
  region: (typeof orderRegions)[number];
  orderStatus: Order["status"];
  paymentStatus: Order["paymentStatus"];
  paymentRecordStatus: Payment["status"];
  paymentMethod: Order["paymentMethod"];
}

export function buildDemoOrders(users: User[], products: Product[]): DemoOrderInput[] {
  const customers = users.filter((user) => user.role === "CUSTOMER");

  if (customers.length === 0) {
    throw new Error("Demo orders need at least one CUSTOMER account.");
  }

  if (products.length === 0) {
    throw new Error("Demo orders need at least one product.");
  }

  const demoOrders: DemoOrderInput[] = [];

  // Two paid orders per province, spread across all seven provinces.
  orderRegions.forEach((region, index) => {
    demoOrders.push({
      customer: customers[index % customers.length],
      product: products[(index * 11 + 2) % products.length],
      quantity: (index % 3) + 1,
      region,
      orderStatus: index % 4 === 0 ? "FULFILLED" : "CONFIRMED",
      paymentStatus: "COMPLETED",
      paymentRecordStatus: "COMPLETED",
      paymentMethod: index % 2 === 0 ? "STRIPE" : "COD",
    });
  });

  // A couple of orders still awaiting payment.
  [orderRegions[0], orderRegions[6]].forEach((region, index) => {
    demoOrders.push({
      customer: customers[(index + 2) % customers.length],
      product: products[(index * 9 + 5) % products.length],
      quantity: 1,
      region,
      orderStatus: "PENDING",
      paymentStatus: "PENDING",
      paymentRecordStatus: "PENDING",
      paymentMethod: index % 2 === 0 ? "COD" : "STRIPE",
    });
  });

  // One cancelled order that must never count as a sale.
  demoOrders.push({
    customer: customers[(customers.length - 1) % customers.length],
    product: products[products.length - 1],
    quantity: 1,
    region: orderRegions[11],
    orderStatus: "CANCELLED",
    paymentStatus: "FAILED",
    paymentRecordStatus: "FAILED",
    paymentMethod: "STRIPE",
  });

  return demoOrders;
}

/**
 * Creates the demo order history. Callers decide whether they want to keep the
 * existing database (order-only seeding) or start from a clean slate (full seed).
 */
export async function insertDemoOrders(
  users: User[],
  products: Product[],
): Promise<Order[]> {
  const orderRepository = AppDataSource.getRepository(Order);
  const orderItemRepository = AppDataSource.getRepository(OrderItem);
  const paymentRepository = AppDataSource.getRepository(Payment);

  const demoOrders = buildDemoOrders(users, products);
  const savedOrders: Order[] = [];

  for (const [index, demoOrder] of demoOrders.entries()) {
    const unitPriceMinorUnits = Math.round(Number(demoOrder.product.price) * 100);
    const subtotalMinorUnits = unitPriceMinorUnits * demoOrder.quantity;
    const totalMinorUnits = subtotalMinorUnits;
    const formatMinorUnits = (minorUnits: number) => (minorUnits / 100).toFixed(2);

    const order = await orderRepository.save(
      orderRepository.create({
        userId: demoOrder.customer.id,
        status: demoOrder.orderStatus,
        paymentMethod: demoOrder.paymentMethod,
        paymentStatus: demoOrder.paymentStatus,
        subtotal: formatMinorUnits(subtotalMinorUnits),
        shippingFee: formatMinorUnits(0),
        total: formatMinorUnits(totalMinorUnits),
        shippingAddress: {
          recipientName: `${demoOrder.customer.firstName} ${demoOrder.customer.lastName}`.trim(),
          phone: `98000000${String(index + 1).padStart(2, "0")}`,
          line1: `${index + 1} Demo Marg`,
          line2: null,
          city: demoOrder.region.city,
          district: demoOrder.region.district,
          province: demoOrder.region.province,
        },
      }),
    );
    savedOrders.push(order);

    await orderItemRepository.save(
      orderItemRepository.create({
        orderId: order.id,
        productId: demoOrder.product.id,
        quantity: demoOrder.quantity,
        unitPriceAtPurchase: formatMinorUnits(unitPriceMinorUnits),
        productName: demoOrder.product.name,
        productImageUrl: demoOrder.product.imageUrl ?? undefined,
        lineTotal: formatMinorUnits(subtotalMinorUnits),
      }),
    );

    await paymentRepository.save(
      paymentRepository.create({
        orderId: order.id,
        amount: formatMinorUnits(totalMinorUnits),
        currency: "NPR",
        paymentProvider: demoOrder.paymentMethod,
        status: demoOrder.paymentRecordStatus,
        transactionId:
          demoOrder.paymentMethod === "STRIPE" ? `demo_stripe_${index + 1}` : undefined,
        gatewayResponse: JSON.stringify({
          seeded: true,
          paymentStatus: demoOrder.paymentRecordStatus,
        }),
      }),
    );
  }

  return savedOrders;
}

/**
 * Prevents the order-only seed from adding a second identical batch on re-run.
 */
export async function hasDemoOrders(): Promise<boolean> {
  const rows = (await AppDataSource.query(
    "SELECT COUNT(*) AS demoOrders FROM `payments` WHERE gateway_response LIKE '%\"seeded\":true%'",
  )) as Array<{ demoOrders: string | number | null }>;

  return Number(rows[0]?.demoOrders ?? 0) > 0;
}
