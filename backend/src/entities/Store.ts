import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, Unique, Index, OneToMany, BeforeUpdate } from "typeorm";
import { User } from "./User.js";
import { Product } from "./Product.js";

@Entity("stores")
@Unique("UQ_stores_owner_id", ["ownerId"])
@Unique("UQ_stores_slug", ["slug"])
@Index("IDX_stores_status", ["status"])
@Index("IDX_stores_is_removed", ["isRemoved"])
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
