import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
  Unique,
} from "typeorm";
import { Product } from "./Product.js";

@Entity("inventory")
@Unique(["productId"])
@Check("CHK_inventory_stock_valid", "reserved_stock <= total_stock")
export class Inventory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "product_id", type: "varchar", length: 36 })
  productId!: string;

  @OneToOne(() => Product, (product) => product.inventory, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @Column({ name: "total_stock", type: "int", default: 0, unsigned: true })
  totalStock!: number;

  @Column({ name: "reserved_stock", type: "int", default: 0, unsigned: true })
  reservedStock!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
