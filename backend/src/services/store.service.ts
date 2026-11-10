import type { EntityManager } from "typeorm";
import { AppDataSource } from "../config/data-source.js";
import { Product } from "../entities/Product.js";
import { Store } from "../entities/Store.js";
import { User } from "../entities/User.js";
import { AppError } from "../errors/AppError.js";
import type {
  CreateStoreInput,
  UpdateStoreInput,
  AdminVerifyStoreInput,
  AdminRejectStoreInput,
  AdminSuspendStoreInput,
} from "../validation/store.schema.js";
import { env } from "../config/env.js";

const storeRepository = AppDataSource.getRepository(Store);
const productRepository = AppDataSource.getRepository(Product);

interface StoreSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  category: string | undefined;
  phone: string | undefined;
  status: "PENDING" | "APPROVED" | "SUSPENDED";
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  listingLimit: number | null;
  productCount: number;
  createdAt: Date;
  verifiedAt: Date | null;
  suspensionReason: string | null;
}

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 170);

  return base;
}

async function ensureUniqueSlug(baseSlug: string, manager: EntityManager, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await manager.findOne(Store, {
      where: { slug },
      select: { id: true },
    });

    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

function toStoreSummary(store: Store, productCount: number): StoreSummary {
  return {
    id: store.id,
    name: store.name,
    slug: store.slug ?? "",
    description: store.description ?? null,
    logoUrl: store.logoUrl ?? null,
    category: store.category ?? undefined,
    phone: store.phone ?? undefined,
    status: store.status,
    verificationStatus: store.verificationStatus,
    listingLimit: store.listingLimit,
    productCount,
    createdAt: store.createdAt,
    verifiedAt: store.verifiedAt ?? null,
    suspensionReason: store.suspensionReason ?? null,
  };
}

export async function createStore(
  userId: string,
  input: CreateStoreInput,
): Promise<StoreSummary> {
  return AppDataSource.transaction(async (manager: EntityManager) => {
    // Check if user already has a store
    const existingStore = await manager.findOne(Store, {
      where: { ownerId: userId, isRemoved: false },
      select: { id: true },
    });

    if (existingStore) {
      throw new AppError("You already have a store", 409);
    }

    // Generate unique slug
    const baseSlug = generateSlug(input.name);
    const slug = await ensureUniqueSlug(baseSlug, manager);

    // Get user to update role
    const user = await manager.findOne(User, {
      where: { id: userId, isRemoved: false },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Create store with APPROVED status, UNVERIFIED verification
    const store = manager.create(Store, {
      ownerId: userId,
      name: input.name,
      slug,
      description: input.description,
      category: input.category,
      phone: input.phone ?? undefined,
      returnPolicy: input.returnPolicy ?? undefined,
      shippingPolicy: input.shippingPolicy ?? undefined,
      logoUrl: input.logoUrl ?? undefined,
      status: "APPROVED",
      verificationStatus: "UNVERIFIED",
      listingLimit: env.sellerUnverifiedListingLimit,
      isRemoved: false,
    });

    await manager.save(store);

    // Upgrade user role to VENDOR
    user.role = "VENDOR";
    await manager.save(user);

    return toStoreSummary(store, 0);
  });
}

export async function getStoreByOwner(userId: string): Promise<StoreSummary | null> {
  const store = await storeRepository.findOne({
    where: { ownerId: userId, isRemoved: false },
    relations: { products: true },
  });

  if (!store) {
    return null;
  }

  const productCount = store.products.filter((p) => !p.isRemoved).length;
  return toStoreSummary(store, productCount);
}

export async function updateStore(
  userId: string,
  input: UpdateStoreInput,
): Promise<StoreSummary> {
  return AppDataSource.transaction(async (manager: EntityManager) => {
    const store = await manager.findOne(Store, {
      where: { ownerId: userId, isRemoved: false },
    });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    if (store.status === "SUSPENDED") {
      throw new AppError("Cannot edit a suspended store", 403);
    }

    if (input.name !== undefined) {
      const baseSlug = generateSlug(input.name);
      store.slug = await ensureUniqueSlug(baseSlug, manager, store.id);
      store.name = input.name;
    }

    if (input.description !== undefined) store.description = input.description;
    if (input.category !== undefined) store.category = input.category;
    if (input.phone !== undefined) store.phone = input.phone.trim() === "" ? undefined : input.phone;
    if (input.returnPolicy !== undefined) store.returnPolicy = input.returnPolicy.trim() === "" ? undefined : input.returnPolicy;
    if (input.shippingPolicy !== undefined) store.shippingPolicy = input.shippingPolicy.trim() === "" ? undefined : input.shippingPolicy;
    if (input.logoUrl !== undefined) store.logoUrl = input.logoUrl.trim() === "" ? null : input.logoUrl;

    await manager.save(store);

    const productCount = await productRepository.count({
      where: { storeId: store.id, isRemoved: false },
    });

    return toStoreSummary(store, productCount);
  });
}

export async function requestVerification(
  userId: string,
): Promise<StoreSummary> {
  return AppDataSource.transaction(async (manager: EntityManager) => {
    const store = await manager.findOne(Store, {
      where: { ownerId: userId, isRemoved: false },
    });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    if (store.verificationStatus === "PENDING" || store.verificationStatus === "VERIFIED") {
      // Idempotent - already requested or verified
      const productCount = await productRepository.count({
        where: { storeId: store.id, isRemoved: false },
      });
      return toStoreSummary(store, productCount);
    }

    if (store.status === "SUSPENDED") {
      throw new AppError("Cannot request verification for a suspended store", 403);
    }

    store.verificationStatus = "PENDING";
    store.verificationRequestedAt = new Date();
    await manager.save(store);

    const productCount = await productRepository.count({
      where: { storeId: store.id, isRemoved: false },
    });

    return toStoreSummary(store, productCount);
  });
}

export async function listStoresForAdmin(
  filters: {
    page: number;
    limit: number;
    status?: string;
    verificationStatus?: string;
    search?: string;
  },
): Promise<{
  stores: (StoreSummary & { owner: { name: string; username: string; email: string } })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { page, limit, status, verificationStatus, search } = filters;

  const queryBuilder = storeRepository
    .createQueryBuilder("store")
    .leftJoinAndSelect("store.owner", "owner")
    .leftJoinAndSelect("store.products", "product", "product.isRemoved = false")
    .where("store.isRemoved = :isRemoved", { isRemoved: false });

  if (status) {
    queryBuilder.andWhere("store.status = :status", { status });
  }

  if (verificationStatus) {
    queryBuilder.andWhere("store.verificationStatus = :verificationStatus", { verificationStatus });
  }

  if (search) {
    queryBuilder.andWhere(
      "(store.name LIKE :search OR owner.firstName LIKE :search OR owner.lastName LIKE :search OR owner.email LIKE :search)",
      { search: `%${search}%` },
    );
  }

  queryBuilder.orderBy("store.createdAt", "DESC");

  const [stores, total] = await queryBuilder
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  return {
    stores: stores.map((store) => ({
      ...toStoreSummary(store, store.products.length),
      owner: {
        name: `${store.owner.firstName} ${store.owner.lastName}`.trim(),
        username: store.owner.userName,
        email: store.owner.email,
      },
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function adminSuspendStore(
  storeId: string,
  input: AdminSuspendStoreInput,
): Promise<StoreSummary> {
  return AppDataSource.transaction(async (manager: EntityManager) => {
    const result = await manager.query(
      `UPDATE \`stores\` SET \`status\` = 'SUSPENDED', \`suspension_reason\` = ?, \`suspended_at\` = NOW(6) WHERE \`id\` = ? AND \`status\` != 'SUSPENDED'`,
      [input.reason, storeId],
    );

    if (result.affectedRows === 0) {
      throw new AppError("Store not found or already suspended", 404);
    }

    const store = await manager.findOne(Store, { where: { id: storeId } });
    if (!store) {
      throw new AppError("Store not found", 404);
    }

    const productCount = await productRepository.count({
      where: { storeId: store.id, isRemoved: false },
    });

    return toStoreSummary(store, productCount);
  });
}

export async function adminUnsuspendStore(
  storeId: string,
): Promise<StoreSummary> {
  return AppDataSource.transaction(async (manager: EntityManager) => {
    const result = await manager.query(
      `UPDATE \`stores\` SET \`status\` = 'APPROVED', \`suspension_reason\` = NULL, \`suspended_at\` = NULL WHERE \`id\` = ? AND \`status\` = 'SUSPENDED'`,
      [storeId],
    );

    if (result.affectedRows === 0) {
      throw new AppError("Store not found or not suspended", 404);
    }

    const store = await manager.findOne(Store, { where: { id: storeId } });
    if (!store) {
      throw new AppError("Store not found", 404);
    }

    const productCount = await productRepository.count({
      where: { storeId: store.id, isRemoved: false },
    });

    return toStoreSummary(store, productCount);
  });
}

export async function adminVerifyStore(
  storeId: string,
  adminId: string,
  input: AdminVerifyStoreInput,
): Promise<StoreSummary> {
  return AppDataSource.transaction(async (manager: EntityManager) => {
    const listingLimit = input.listingLimit ?? null;

    const result = await manager.query(
      `UPDATE \`stores\` SET \`verification_status\` = 'VERIFIED', \`listing_limit\` = ?, \`verified_at\` = NOW(6), \`verified_by\` = ? WHERE \`id\` = ? AND \`verification_status\` != 'VERIFIED'`,
      [listingLimit, adminId, storeId],
    );

    if (result.affectedRows === 0) {
      throw new AppError("Store not found or already verified", 404);
    }

    const store = await manager.findOne(Store, { where: { id: storeId } });
    if (!store) {
      throw new AppError("Store not found", 404);
    }

    const productCount = await productRepository.count({
      where: { storeId: store.id, isRemoved: false },
    });

    return toStoreSummary(store, productCount);
  });
}

export async function adminRejectStore(
  storeId: string,
  _input: AdminRejectStoreInput,
): Promise<StoreSummary> {
  return AppDataSource.transaction(async (manager: EntityManager) => {
    const result = await manager.query(
      `UPDATE \`stores\` SET \`verification_status\` = 'REJECTED' WHERE \`id\` = ? AND \`verification_status\` NOT IN ('VERIFIED', 'REJECTED')`,
      [storeId],
    );

    if (result.affectedRows === 0) {
      throw new AppError("Store not found or cannot be rejected", 404);
    }

    const store = await manager.findOne(Store, { where: { id: storeId } });
    if (!store) {
      throw new AppError("Store not found", 404);
    }

    const productCount = await productRepository.count({
      where: { storeId: store.id, isRemoved: false },
    });

    return toStoreSummary(store, productCount);
  });
}