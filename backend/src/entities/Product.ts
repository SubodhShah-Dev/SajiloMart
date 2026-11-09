import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
  Check,
  BeforeUpdate,
} from "typeorm";
import { Store } from "./Store.js";
import { Inventory } from "./Inventory.js";
import { OrderItem } from "./OrderItem.js";
import { WishlistItem } from "./WishlistItem.js";
import { Review } from "./Review.js";

@Entity("products")
@Index(["category", "isRemoved"])
@Index("IDX_product_is_removed", ["isRemoved"])
@Check("CHK_product_price_non_negative", "price >= 0")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", unique: true, length: 255, nullable: true })
  slug?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  price!: string;

  @Column({ type: "varchar", length: 100 })
  category!: string;

  @Column({ name: "store_id", type: "varchar", length: 36 })
  storeId!: string;

  @ManyToOne(() => Store, (store) => store.products)
  @JoinColumn({ name: "store_id" })
  store!: Store;

  @Column({ name: "is_removed", type: "boolean", default: false })
  isRemoved!: boolean;

  @Column({ name: "deleted_at", type: "datetime", precision: 6, nullable: true })
  deletedAt!: Date | null;

  @OneToOne(() => Inventory, (inventory) => inventory.product)
  inventory!: Inventory;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems!: OrderItem[];

  @OneToMany(() => WishlistItem, (wishlistItem) => wishlistItem.product)
  wishlistItems!: WishlistItem[];

  @OneToMany(() => Review, (review) => review.product)
  reviews!: Review[];

  @Column({ name: "image_url", type: "varchar", length: 500, nullable: true })
  imageUrl?: string;

  @Column({
    name: "thumbnail_url",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  thumbnailUrl?: string;

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
