import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity.js";
import { OrderItem } from "./order-item.entity.js";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "char", length: 36 })
  userId!: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({
    type: "enum",
    enum: ["PENDING", "CONFIRMED", "PARTIAL", "FULFILLED", "CANCELLED"],
    default: "PENDING",
  })
  status!: string;

  @Column({ name: "payment_method", type: "enum", enum: ["COD", "STRIPE"] })
  paymentMethod!: "COD" | "STRIPE";

  @Column({
    name: "payment_status",
    type: "enum",
    enum: ["UNPAID", "PENDING", "PAID", "FAILED"],
    default: "UNPAID",
  })
  paymentStatus!: string;

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
