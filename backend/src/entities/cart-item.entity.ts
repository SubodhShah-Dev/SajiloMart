import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { Cart } from "./cart.entity.js";
import { Product } from "./product.entity.js";

@Entity("cart_items")
@Unique(["cartId", "productId"]) // Ensures a product only appears once per cart row (quantity is updated instead)
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "cart_id", type: "char", length: 36 })
  cartId!: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "cart_id" })
  cart!: Cart;

  @Column({ name: "product_id", type: "char", length: 36 })
  productId!: string;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @Column({ type: "int" })
  quantity!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
