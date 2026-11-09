import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
  Unique,
  Index,
  BeforeUpdate,
} from "typeorm";
import { Order } from "./Order.js";
import { Product } from "./Product.js";

@Entity("order_items")
@Unique(["orderId", "productId"])
@Check("CHK_order_items_quantity_positive", "quantity > 0")
@Check("CHK_order_items_unit_price_non_negative", "unit_price_at_purchase >= 0")
@Check("CHK_order_items_line_total_non_negative", "line_total >= 0")
@Index("IDX_order_item_is_removed", ["isRemoved"])
@Index("IDX_order_item_order_id_is_removed", ["orderId", "isRemoved"])
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "order_id", type: "varchar", length: 36 })
  orderId!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order!: Order;

  @Column({ name: "product_id", type: "varchar", length: 36 })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @Column({ type: "int", unsigned: true })
  quantity!: number;

  @Column({
    name: "unit_price_at_purchase",
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  unitPriceAtPurchase!: string;

  @Column({ name: "product_name", type: "varchar", length: 255 })
  productName!: string;

  @Column({
    name: "product_image_url",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  productImageUrl?: string;

  @Column({ name: "line_total", type: "decimal", precision: 12, scale: 2 })
  lineTotal!: string;

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
