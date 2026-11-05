import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "./product.entity.js";

@Entity("inventory")
export class Inventory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "product_id", type: "char", length: 36, unique: true })
  productId!: string;

  @OneToOne(() => Product, (product) => product.inventory, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @Column({ name: "total_stock", type: "int", default: 0 })
  totalStock!: number;

  @Column({ name: "reserved_stock", type: "int", default: 0 })
  reservedStock!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
