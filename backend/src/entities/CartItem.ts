import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Check,
} from "typeorm";
import { Cart } from "./Cart.js";
import { Product } from "./Product.js";

@Entity("cart_items")
@Check("CHK_cart_item_quantity", "quantity > 0")
@Unique(["cartId", "productId"])
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "cart_id", type: "varchar", length: 36 })
  cartId!: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "cart_id" })
  cart!: Cart;

  @Column({ name: "product_id", type: "varchar", length: 36 })
  productId!: string;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @Column({ type: "int", unsigned: true })
  quantity!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
