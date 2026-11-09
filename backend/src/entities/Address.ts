import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeUpdate,
} from "typeorm";
import { User } from "./User.js";
import { District } from "./District.js";

@Entity("addresses")
@Index("IDX_address_user_id", ["userId"])
@Index("IDX_address_district_id", ["districtId"])
@Index("IDX_address_is_removed", ["isRemoved"])
@Index("IDX_address_user_id_is_removed", ["userId", "isRemoved"])
export class Address {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "varchar", length: 36 })
  userId!: string;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "varchar", length: 50, default: "Home" })
  label!: string;

  @Column({ name: "recipient_name", type: "varchar", length: 100 })
  recipientName!: string;

  @Column({ type: "varchar", length: 20 })
  phone!: string;

  @Column({ type: "varchar", length: 255 })
  line1!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  line2?: string;

  @Column({ type: "varchar", length: 100 })
  city!: string;

  @Column({ name: "district_id", type: "varchar", length: 36 })
  districtId!: string;

  @ManyToOne(() => District, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "district_id" })
  district!: District;

  @Column({ name: "is_default", type: "boolean", default: false })
  isDefault!: boolean;

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
