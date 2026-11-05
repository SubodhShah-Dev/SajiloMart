import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Index,
} from "typeorm";
import { Inventory } from "./Inventory.js";
import { OrderItem } from "./OrderItem.js";
import { WishlistItem } from "./WishlistItem.js";
import { Review } from "./Review.js";

@Entity("products")
@Index(["category", "isActive"])
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

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

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
}
