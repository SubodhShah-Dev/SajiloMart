import type { EntityManager } from "typeorm";
import { AppDataSource } from "../config/data-source.js";
import { Cart } from "../entities/Cart.js";
import { CartItem } from "../entities/CartItem.js";
import { Product } from "../entities/Product.js";
import { Inventory } from "../entities/Inventory.js";
import { AppError } from "../errors/AppError.js";

const cartRepository = AppDataSource.getRepository(Cart);

export interface CartItemResponse {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    originalPrice: number | null;
    image: string | null;
    category: string;
    rating: number;
    reviewCount: number;
    isFlashDeal: boolean;
    flashDealEndTime: Date | null;
    badge: string | null;
  };
}

export interface CartResponse {
  id: string;
  items: CartItemResponse[];
  subtotal: number;
  itemCount: number;
}

function toCartItemResponse(item: CartItem): CartItemResponse {
  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      description: item.product.description ?? null,
      price: Number(item.product.price),
      originalPrice: null,
      image: item.product.imageUrl ?? null,
      category: item.product.category,
      rating: 0,
      reviewCount: 0,
      isFlashDeal: false,
      flashDealEndTime: null,
      badge: null,
    },
  };
}

function toCartResponse(cart: Cart): CartResponse {
  const activeItems = cart.items.filter((item) => !item.isRemoved);
  const items = activeItems.map(toCartItemResponse);
  const subtotal = activeItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );
  const itemCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cart.id,
    items,
    subtotal,
    itemCount,
  };
}

async function getOrCreateCart(manager: EntityManager, userId: string): Promise<Cart> {
  let cart = await manager.findOne(Cart, {
    where: { userId, isRemoved: false },
    relations: { items: { product: true } },
  });

  if (!cart) {
    cart = manager.create(Cart, { userId, items: [], isRemoved: false });
    await manager.save(cart);
    cart = await manager.findOne(Cart, {
      where: { id: cart.id },
      relations: { items: { product: true } },
    }) as Cart;
  } else if (!cart.items) {
    cart.items = await manager.find(CartItem, {
      where: { cartId: cart.id, isRemoved: false },
      relations: { product: true },
    });
  }

  return cart;
}

async function getProductStock(manager: EntityManager, productId: string): Promise<number> {
  const inventory = await manager.findOne(Inventory, {
    where: { productId, isRemoved: false },
  });
  return inventory?.totalStock ?? 0;
}

export async function getCart(userId: string): Promise<CartResponse> {
  const cart = await cartRepository.findOne({
    where: { userId, isRemoved: false },
    relations: { items: { product: true } },
  });

  if (!cart) {
    return { id: "", items: [], subtotal: 0, itemCount: 0 };
  }

  return toCartResponse(cart);
}

export async function addItem(userId: string, productId: string, quantity: number): Promise<CartResponse> {
  return AppDataSource.transaction(async (manager) => {
    const product = await manager.findOne(Product, {
      where: { id: productId, isRemoved: false },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const totalStock = await getProductStock(manager, productId);
    if (totalStock < quantity) {
      throw new AppError("Insufficient stock", 400);
    }

    const cart = await getOrCreateCart(manager, userId);

    let cartItem = cart.items.find(
      (item) => item.productId === productId && !item.isRemoved,
    );

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;
      if (totalStock < newQuantity) {
        throw new AppError("Insufficient stock", 400);
      }
      cartItem.quantity = newQuantity;
      await manager.save(cartItem);
    } else {
      cartItem = manager.create(CartItem, {
        cartId: cart.id,
        productId,
        quantity,
        isRemoved: false,
      });
      await manager.save(cartItem);
      cart.items.push(cartItem);
    }

    const updatedCart = await manager.findOne(Cart, {
      where: { id: cart.id },
      relations: { items: { product: true } },
    });

    return toCartResponse(updatedCart as Cart);
  });
}

export async function updateQty(userId: string, productId: string, quantity: number): Promise<CartResponse> {
  return AppDataSource.transaction(async (manager) => {
    const cart = await getOrCreateCart(manager, userId);

    const cartItem = cart.items.find(
      (item) => item.productId === productId && !item.isRemoved,
    );

    if (!cartItem) {
      throw new AppError("Item not found in cart", 404);
    }

    const product = await manager.findOne(Product, {
      where: { id: productId, isRemoved: false },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const totalStock = await getProductStock(manager, productId);
    if (totalStock < quantity) {
      throw new AppError("Insufficient stock", 400);
    }

    cartItem.quantity = quantity;
    await manager.save(cartItem);

    const updatedCart = await manager.findOne(Cart, {
      where: { id: cart.id },
      relations: { items: { product: true } },
    });

    return toCartResponse(updatedCart as Cart);
  });
}

export async function removeItem(userId: string, productId: string): Promise<CartResponse> {
  return AppDataSource.transaction(async (manager) => {
    const cart = await manager.findOne(Cart, {
      where: { userId, isRemoved: false },
      relations: { items: { product: true } },
    });

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const cartItem = cart.items.find(
      (item) => item.productId === productId && !item.isRemoved,
    );

    if (!cartItem) {
      throw new AppError("Item not found in cart", 404);
    }

    cartItem.isRemoved = true;
    cartItem.deletedAt = new Date();
    await manager.save(cartItem);

    const updatedCart = await manager.findOne(Cart, {
      where: { id: cart.id },
      relations: { items: { product: true } },
    });

    return toCartResponse(updatedCart as Cart);
  });
}

export async function clearCart(userId: string): Promise<CartResponse> {
  return AppDataSource.transaction(async (manager) => {
    const cart = await manager.findOne(Cart, {
      where: { userId, isRemoved: false },
      relations: { items: true },
    });

    if (!cart) {
      return { id: "", items: [], subtotal: 0, itemCount: 0 };
    }

    for (const item of cart.items) {
      if (!item.isRemoved) {
        item.isRemoved = true;
        item.deletedAt = new Date();
        await manager.save(item);
      }
    }

    return { id: cart.id, items: [], subtotal: 0, itemCount: 0 };
  });
}

export interface AnonymousCartItem {
  productId: string;
  quantity: number;
}

export async function mergeCarts(anonymousItems: AnonymousCartItem[], userId: string): Promise<CartResponse> {
  if (!anonymousItems || anonymousItems.length === 0) {
    return getCart(userId);
  }

  return AppDataSource.transaction(async (manager) => {
    const cart = await getOrCreateCart(manager, userId);

    for (const anonItem of anonymousItems) {
      const product = await manager.findOne(Product, {
        where: { id: anonItem.productId, isRemoved: false },
      });

      if (!product) {
        continue;
      }

      const existingItem = cart.items.find(
        (item) => item.productId === anonItem.productId && !item.isRemoved,
      );

      const totalStock = await getProductStock(manager, anonItem.productId);
      const newQuantity = (existingItem?.quantity ?? 0) + anonItem.quantity;

      if (totalStock < newQuantity) {
        const availableQty = totalStock - (existingItem?.quantity ?? 0);
        if (availableQty <= 0) {
          continue;
        }
        if (existingItem) {
          existingItem.quantity = totalStock;
          await manager.save(existingItem);
        } else {
          const newItem = manager.create(CartItem, {
            cartId: cart.id,
            productId: anonItem.productId,
            quantity: availableQty,
            isRemoved: false,
          });
          await manager.save(newItem);
          cart.items.push(newItem);
        }
      } else if (existingItem) {
        existingItem.quantity = newQuantity;
        await manager.save(existingItem);
      } else {
        const newItem = manager.create(CartItem, {
          cartId: cart.id,
          productId: anonItem.productId,
          quantity: anonItem.quantity,
          isRemoved: false,
        });
        await manager.save(newItem);
        cart.items.push(newItem);
      }
    }

    const updatedCart = await manager.findOne(Cart, {
      where: { id: cart.id },
      relations: { items: { product: true } },
    });

    return toCartResponse(updatedCart as Cart);
  });
}