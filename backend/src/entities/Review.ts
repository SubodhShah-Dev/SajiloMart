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
  Check,
  BeforeUpdate,
} from "typeorm";
import { User } from "./User.js";
import { Product } from "./Product.js";

@Entity("reviews")
@Unique(["userId", "productId"])
@Index(["productId", "status", "createdAt"])
@Index("IDX_review_is_removed", ["isRemoved"])
@Index("IDX_review_product_id_is_removed", ["productId", "isRemoved"])
@Check("CHK_reviews_rating_range", "rating BETWEEN 1 AND 5")
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "varchar", length: 36 })
  userId!: string;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "product_id", type: "varchar", length: 36 })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: "RESTRICT",
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
