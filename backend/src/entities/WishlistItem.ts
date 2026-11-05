import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from "typeorm";
import { User } from "./User.js";
import { Product } from "./Product.js";

@Entity("wishlist_items")
@Unique(["userId", "productId"])
export class WishlistItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "varchar", length: 36 })
  userId!: string;

  @ManyToOne(() => User, (user) => user.wishlistItems, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "product_id", type: "varchar", length: 36 })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.wishlistItems, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
