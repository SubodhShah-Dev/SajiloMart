import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  BeforeUpdate,
} from "typeorm";
import { Order } from "./Order.js";
import { WishlistItem } from "./WishlistItem.js";
import { Review } from "./Review.js";
import { Address } from "./Address.js";

@Entity("users")
@Index("IDX_user_is_removed", ["isRemoved"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "first_name", type: "varchar", length: 50 })
  firstName!: string;

  @Column({ name: "last_name", type: "varchar", length: 50 })
  lastName!: string;

  @Column({ name: "user_name", type: "varchar", length: 100, unique: true })
  userName!: string;

  @Column({ type: "varchar", unique: true, length: 255 })
  email!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({
    type: "enum",
    enum: ["CUSTOMER", "VENDOR", "ADMIN"],
    default: "CUSTOMER",
  })
  role!: "CUSTOMER" | "VENDOR" | "ADMIN";

  @Column({
    type: "enum",
    enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
    default: "ACTIVE",
  })
  status!: "ACTIVE" | "INACTIVE" | "SUSPENDED";

  @Column({ name: "is_removed", type: "boolean", default: false })
  isRemoved!: boolean;

  @Column({ name: "deleted_at", type: "datetime", precision: 6, nullable: true })
  deletedAt!: Date | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone?: string;

  @OneToMany(() => Address, (address) => address.user)
  addresses!: Address[];

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @OneToMany(() => WishlistItem, (wishlistItem) => wishlistItem.user)
  wishlistItems!: WishlistItem[];

  @OneToMany(() => Review, (review) => review.user)
  reviews!: Review[];

  @Column({
    name: "profile_image_url",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  profileImageUrl?: string;

  @BeforeUpdate()
  setDeletedAt(): void {
    if (this.isRemoved && this.deletedAt === null) {
      this.deletedAt = new Date();
    } else if (!this.isRemoved) {
      this.deletedAt = null;
    }
  }

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
