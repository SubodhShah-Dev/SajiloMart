import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  BeforeUpdate,
} from "typeorm";
import { User } from "./User.js";

@Entity("refresh_sessions")
@Index("IDX_refresh_sessions_user_id", ["userId"])
@Index("IDX_refresh_sessions_is_removed", ["isRemoved"])
@Index("IDX_refresh_sessions_user_id_is_removed", ["userId", "isRemoved"])
@Unique(["tokenHash"])
export class RefreshSession {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "varchar", length: 36 })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "token_hash", type: "char", length: 64 })
  tokenHash!: string;

  @Column({ name: "expires_at", type: "datetime", precision: 6 })
  expiresAt!: Date;

  @Column({
    name: "revoked_at",
    type: "datetime",
    precision: 6,
    nullable: true,
  })
  revokedAt!: Date | null;

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
