import { AppDataSource } from "../config/data-source.js";
import { Product } from "../entities/Product.js";
import { Store } from "../entities/Store.js";
import { Inventory } from "../entities/Inventory.js";
import type { EntityManager } from "typeorm";
import { AppError } from "../errors/AppError.js";
import type {
  CreateProductInput,
  UpdateProductInput,
  SellerProductQueryInput,
} from "../validation/product-seller.schema.js";
import type { PaginatedProducts } from "./product.service.js";
import { serializeProduct, loadRatingStats } from "./product.service.js";

const productRepository = AppDataSource.getRepository(Product);
const storeRepository = AppDataSource.getRepository(Store);

interface VendorProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  totalStock: number;
  reservedStock: number;
  status: "active" | "removed";
}

function serializeVendorProduct(
  product: Product,
  stats: Map<string, { rating: number; reviewCount: number }>,
): VendorProductResponse {
  const base = serializeProduct(product, stats);
  return {
    ...base,
    totalStock: product.inventory?.totalStock ?? 0,
    reservedStock: product.inventory?.reservedStock ?? 0,
    status: product.isRemoved ? "removed" : "active",
  };
}

export async function createProduct(
  vendorId: string,
  input: CreateProductInput,
): Promise<Product> {
  return AppDataSource.transaction(async (manager: EntityManager) => {
    const store = await manager.findOne(Store, {
      where: { ownerId: vendorId, isRemoved: false },
    });

    if (!store) {
      throw new AppError("Store not found. Complete onboarding first.", 404);
    }

    if (store.status !== "APPROVED") {
      throw new AppError("Store must be approved to add products.", 403);
    }

    // Enforce listing limit for unverified stores
    if (store.listingLimit !== null) {
      const activeProductCount = await manager.count(Product, {
        where: { storeId: store.id, isRemoved: false },
      });

      if (activeProductCount >= store.listingLimit) {
        throw new AppError(
          "You've reached your listing limit. Complete verification to add more.",
          403,
        );
      }
    }

    const product = manager.create(Product);
    product.name = input.name;
    product.description = input.description ?? "";
    product.price = input.price.toFixed(2);
    product.category = input.category;
    product.storeId = store.id;
    product.imageUrl = input.imageUrl ?? undefined;
    product.thumbnailUrl = input.thumbnailUrl ?? undefined;
    product.isRemoved = false;

    const savedProduct = await manager.save(product);

    const inventory = manager.create(Inventory, {
      productId: savedProduct.id,
      totalStock: input.totalStock,
      reservedStock: 0,
      isRemoved: false,
    });

    await manager.save(inventory);

    return savedProduct;
  });
}

export async function getVendorProducts(
  vendorId: string,
  filters: SellerProductQueryInput,
): Promise<PaginatedProducts> {
  const { page, limit, status } = filters;

  const store = await storeRepository.findOne({
    where: { ownerId: vendorId, isRemoved: false },
    select: { id: true },
  });

  if (!store) {
    throw new AppError("Store not found", 404);
  }

  const queryBuilder = productRepository
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.inventory", "inventory")
    .where("product.storeId = :storeId", { storeId: store.id });

  if (status === "active") {
    queryBuilder.andWhere("product.isRemoved = :isRemoved", { isRemoved: false });
  } else if (status === "removed") {
    queryBuilder.andWhere("product.isRemoved = :isRemoved", { isRemoved: true });
  } else if (status === "draft") {
    queryBuilder
      .andWhere("product.isRemoved = :isRemoved", { isRemoved: false })
      .andWhere("inventory.totalStock = :stock", { stock: 0 });
  }

  queryBuilder.orderBy("product.createdAt", "DESC");

  const [products, total] = await queryBuilder
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  const stats = await loadRatingStats(products.map((p) => p.id));

  return {
    products: products.map((product) => serializeVendorProduct(product, stats)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getVendorProductById(
  vendorId: string,
  productId: string,
): Promise<Product | null> {
  const store = await storeRepository.findOne({
    where: { ownerId: vendorId, isRemoved: false },
    select: { id: true },
  });

  if (!store) {
    return null;
  }

  return productRepository.findOne({
    where: { id: productId, storeId: store.id },
    relations: { inventory: true },
  });
}

export async function updateProduct(
  vendorId: string,
  productId: string,
  input: UpdateProductInput,
): Promise<Product> {
  return AppDataSource.transaction(async (manager: EntityManager) => {
    const store = await manager.findOne(Store, {
      where: { ownerId: vendorId, isRemoved: false },
      select: { id: true },
    });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    const product = await manager.findOne(Product, {
      where: { id: productId, storeId: store.id },
      relations: { inventory: true },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (input.name !== undefined) product.name = input.name;
    if (input.description !== undefined) product.description = input.description;
    if (input.price !== undefined) product.price = input.price.toFixed(2);
    if (input.category !== undefined) product.category = input.category;
    if (input.imageUrl !== undefined) product.imageUrl = input.imageUrl ?? undefined;
    if (input.thumbnailUrl !== undefined) product.thumbnailUrl = input.thumbnailUrl ?? undefined;

    await manager.save(product);

    if (input.totalStock !== undefined && product.inventory) {
      product.inventory.totalStock = input.totalStock;
      await manager.save(product.inventory);
    }

    return product;
  });
}

export async function deleteProduct(
  vendorId: string,
  productId: string,
): Promise<void> {
  const store = await storeRepository.findOne({
    where: { ownerId: vendorId, isRemoved: false },
    select: { id: true },
  });

  if (!store) {
    throw new AppError("Store not found", 404);
  }

  const product = await productRepository.findOne({
    where: { id: productId, storeId: store.id },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  product.isRemoved = true;
  product.deletedAt = new Date();
  await productRepository.save(product);
}