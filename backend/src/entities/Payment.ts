import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Index,
} from "typeorm";
import { Order } from "./Order.js";

@Entity("payments")
@Index(["status"])
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "order_id", type: "varchar", length: 36 })
  orderId!: string;

  @OneToOne(() => Order, (order) => order.payment, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "order_id" })
  order!: Order;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  amount!: string;

  @Column({ type: "varchar", length: 3, default: "NPR" })
  currency!: string;

  @Column({
    type: "enum",
    enum: ["STRIPE", "COD"],
    name: "payment_provider",
  })
  paymentProvider!: "STRIPE" | "COD";

  @Column({
    type: "enum",
    enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
    default: "PENDING",
  })
  status!: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

  @Column({
    name: "transaction_id",
    type: "varchar",
    length: 255,
    nullable: true,
    unique: true,
  })
  transactionId?: string; // Reference ID returned by the payment provider (e.g., Stripe PaymentIntent ID)

  @Column({ name: "gateway_response", type: "text", nullable: true })
  gatewayResponse?: string; // Raw JSON string of the webhook payload for auditing

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
