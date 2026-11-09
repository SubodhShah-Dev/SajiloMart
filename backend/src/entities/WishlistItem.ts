import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
  BeforeUpdate,
} from "typeorm";
import { User } from "./User.js";
import { Product } from "./Product.js";

@Entity("wishlist_items")
@Unique(["userId", "productId"])
@Index("IDX_wishlist_item_is_removed", ["isRemoved"])
@Index("IDX_wishlist_item_user_id_is_removed", ["userId", "isRemoved"])
export class WishlistItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "varchar", length: 36 })
  userId!: string;

  @ManyToOne(() => User, (user) => user.wishlistItems, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "product_id", type: "varchar", length: 36 })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.wishlistItems, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "product_id" })
  product!: Product;

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
