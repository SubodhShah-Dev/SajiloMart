import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, Unique, Index, OneToMany, BeforeUpdate, ManyToOne } from "typeorm";
import { User } from "./User.js";
import { Product } from "./Product.js";

@Entity("stores")
@Unique("UQ_stores_owner_id", ["ownerId"])
@Unique("UQ_stores_slug", ["slug"])
@Index("IDX_stores_status", ["status"])
@Index("IDX_stores_is_removed", ["isRemoved"])
@Index("IDX_stores_verification_status", ["verificationStatus"])
export class Store {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "owner_id", type: "varchar", length: 36 })
  ownerId!: string;

  @OneToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "owner_id" })
  owner!: User;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "varchar", length: 180, nullable: true })
  slug?: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ name: "logo_url", type: "varchar", length: 500, nullable: true })
  logoUrl!: string | null;

  @Column({ type: "enum", enum: ["PENDING", "APPROVED", "SUSPENDED"], default: "PENDING" })
  status!: "PENDING" | "APPROVED" | "SUSPENDED";

  @Column({ name: "is_removed", type: "boolean", default: false })
  isRemoved!: boolean;

  @Column({ name: "deleted_at", type: "datetime", precision: 6, nullable: true })
  deletedAt!: Date | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  category?: string;

  @Column({ name: "return_policy", type: "text", nullable: true })
  returnPolicy?: string;

  @Column({ name: "shipping_policy", type: "text", nullable: true })
  shippingPolicy?: string;

  @Column({
    name: "verification_status",
    type: "enum",
    enum: ["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"],
    default: "UNVERIFIED",
  })
  verificationStatus!: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";

  @Column({ name: "listing_limit", type: "int", nullable: true })
  listingLimit!: number | null;

  @Column({ name: "verification_requested_at", type: "datetime", precision: 6, nullable: true })
  verificationRequestedAt!: Date | null;

  @Column({ name: "verified_at", type: "datetime", precision: 6, nullable: true })
  verifiedAt!: Date | null;

  @Column({ name: "verified_by", type: "varchar", length: 36, nullable: true })
  verifiedById!: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "verified_by" })
  verifiedBy!: User | null;

  @Column({ name: "suspension_reason", type: "varchar", length: 500, nullable: true })
  suspensionReason?: string;

  @Column({ name: "suspended_at", type: "datetime", precision: 6, nullable: true })
  suspendedAt!: Date | null;

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

  @OneToMany(() => Product, (p) => p.store)
  products!: Product[];
}
