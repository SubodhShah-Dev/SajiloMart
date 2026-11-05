import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
  Index,
  Check,
} from "typeorm";
import { User } from "./User.js";
import { Product } from "./Product.js";

@Entity("reviews")
@Unique(["userId", "productId"])
@Index(["productId", "status", "createdAt"])
@Check("CHK_reviews_rating_range", "rating BETWEEN 1 AND 5")
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "varchar", length: 36 })
  userId!: string;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "product_id", type: "varchar", length: 36 })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @Column({ type: "tinyint", unsigned: true })
  rating!: number;

  @Column({ type: "text", nullable: true })
  comment!: string | null;

  @Column({
    type: "enum",
    enum: ["PUBLISHED", "HIDDEN"],
    default: "PUBLISHED",
  })
  status!: "PUBLISHED" | "HIDDEN";

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
