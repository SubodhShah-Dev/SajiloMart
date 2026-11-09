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
  Index,
  BeforeUpdate,
} from "typeorm";
import { Product } from "./Product.js";

@Entity("inventory")
@Unique(["productId"])
@Check("CHK_inventory_stock_valid", "reserved_stock <= total_stock")
@Index("IDX_inventory_is_removed", ["isRemoved"])
@Index("IDX_inventory_product_id_is_removed", ["productId", "isRemoved"])
export class Inventory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "product_id", type: "varchar", length: 36 })
  productId!: string;

  @OneToOne(() => Product, (product) => product.inventory, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @Column({ name: "total_stock", type: "int", default: 0, unsigned: true })
  totalStock!: number;

  @Column({ name: "reserved_stock", type: "int", default: 0, unsigned: true })
  reservedStock!: number;

  @Column({ name: "is_removed", type: "boolean", default: false })
  isRemoved!: boolean;

  @Column({ name: "deleted_at", type: "datetime", precision: 6, nullable: true })
  deletedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @BeforeUpdate()
  setDeletedAt(): void {
    if (this.isRemoved && this.deletedAt === null) {
      this.deletedAt = new Date();
    } else if (!this.isRemoved) {
      this.deletedAt = null;
    }
  }
}
