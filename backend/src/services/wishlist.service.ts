import type { EntityManager } from "typeorm";
import { AppDataSource } from "../config/data-source.js";
import { Product } from "../entities/Product.js";
import { WishlistItem } from "../entities/WishlistItem.js";
import { AppError } from "../errors/AppError.js";
import type { ProductResponse } from "./product.service.js";
import { loadRatingStats, serializeProduct } from "./product.service.js";

export interface WishlistResponse {
  items: ProductResponse[];
}

function isProductVisible(item: WishlistItem): boolean {
  const product = item.product;

  if (!product || product.isRemoved) {
    return false;
  }

  const store = product.store;

  return Boolean(store) && !store.isRemoved && store.status === "APPROVED";
}

async function loadItems(
  manager: EntityManager,
  userId: string,
): Promise<WishlistItem[]> {
  return manager.find(WishlistItem, {
    where: { userId, isRemoved: false },
    relations: { product: { store: true, inventory: true } },
    order: { createdAt: "DESC" },
  });
}

async function toWishlistResponse(
  items: WishlistItem[],
): Promise<WishlistResponse> {
  const visibleItems = items.filter(
    (item) => !item.isRemoved && isProductVisible(item),
  );
  const stats = await loadRatingStats(
    visibleItems.map((item) => item.productId),
  );

  return {
    items: visibleItems.map((item) => serializeProduct(item.product, stats)),
  };
}

export async function getWishlist(userId: string): Promise<WishlistResponse> {
  const items = await loadItems(AppDataSource.manager, userId);

  return toWishlistResponse(items);
}

export async function addWishlistItem(
  userId: string,
  productId: string,
): Promise<WishlistResponse> {
  return AppDataSource.transaction(async (manager) => {
    const product = await manager.findOne(Product, {
      where: { id: productId, isRemoved: false },
      relations: { store: true },
    });

    if (
      !product ||
      !product.store ||
      product.store.isRemoved ||
      product.store.status !== "APPROVED"
    ) {
      throw new AppError("Product not found", 404);
    }

    const existing = await manager.findOne(WishlistItem, {
      where: { userId, productId },
    });

    if (existing) {
      if (existing.isRemoved) {
        existing.isRemoved = false;
        existing.deletedAt = null;
        await manager.save(existing);
      }
    } else {
      const item = manager.create(WishlistItem, {
        userId,
        productId,
        isRemoved: false,
      });
      await manager.save(item);
    }

    const items = await loadItems(manager, userId);

    return toWishlistResponse(items);
  });
}

export async function removeWishlistItem(
  userId: string,
  productId: string,
): Promise<WishlistResponse> {
  return AppDataSource.transaction(async (manager) => {
    const item = await manager.findOne(WishlistItem, {
      where: { userId, productId, isRemoved: false },
    });

    if (item) {
      item.isRemoved = true;
      item.deletedAt = new Date();
      await manager.save(item);
    }

    const items = await loadItems(manager, userId);

    return toWishlistResponse(items);
  });
}

export async function clearWishlist(userId: string): Promise<WishlistResponse> {
  return AppDataSource.transaction(async (manager) => {
    const items = await manager.find(WishlistItem, {
      where: { userId, isRemoved: false },
    });

    for (const item of items) {
      item.isRemoved = true;
      item.deletedAt = new Date();
      await manager.save(item);
    }

    return { items: [] };
  });
}
