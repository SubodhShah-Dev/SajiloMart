import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Order } from "./order.entity.js";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_name", type: "varchar", length: 100 })
  userName!: string;

  @Column({ type: "varchar", unique: true, length: 255 })
  email!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({
    type: "enum",
    enum: ["CUSTOMER", "ADMIN", "VENDOR"],
    default: "CUSTOMER",
  })
  role!: "CUSTOMER" | "ADMIN" | "VENDOR";

  @Column({
    type: "enum",
    enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
    default: "ACTIVE",
  })
  status!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone?: string;

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
