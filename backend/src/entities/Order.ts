import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Index,
  Check,
} from "typeorm";
import { User } from "./User.js";
import { OrderItem } from "./OrderItem.js";
import { Payment } from "./Payment.js";

@Entity("orders")
@Index("IDX_order_user_id", ["userId", "createdAt"])
@Index("IDX_order_status", ["status"])
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "varchar", length: 36 })
  userId!: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({
    type: "enum",
    enum: ["PENDING", "CONFIRMED", "PARTIAL", "FULFILLED", "CANCELLED"],
    default: "PENDING",
  })
  status!: "PENDING" | "CONFIRMED" | "PARTIAL" | "FULFILLED" | "CANCELLED";

  @OneToOne(() => Payment, (payment) => payment.order, { cascade: true })
  payment!: Payment;

  @Column({ name: "payment_method", type: "enum", enum: ["COD", "STRIPE"] })
  paymentMethod!: "COD" | "STRIPE";

  @Column({
    name: "payment_status",
    type: "enum",
    enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
    default: "PENDING",
  })
  paymentStatus!: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

  @Column({ type: "decimal", precision: 12, scale: 2 })
  subtotal!: string;

  @Column({
    name: "shipping_fee",
    type: "decimal",
    precision: 12,
    scale: 2,
    default: "0.00",
  })
  shippingFee!: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  total!: string;

  @Column({ type: "json", name: "shipping_address" })
  shippingAddress!: Record<string, unknown>;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items!: OrderItem[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
