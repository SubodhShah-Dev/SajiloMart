import { AppDataSource } from "../config/data-source.js";
import { Product } from "../entities/Product.js";
import { Review } from "../entities/Review.js";
import type { ProductQueryInput } from "../validation/product.schema.js";

const productRepository = AppDataSource.getRepository(Product);
const reviewRepository = AppDataSource.getRepository(Review);

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

export interface PaginatedProducts {
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RatingStats {
  rating: number;
  reviewCount: number;
}

function ratingSubquery(): string {
  return `(
    SELECT COALESCE(AVG(review_rating.rating), 0)
    FROM reviews review_rating
    WHERE review_rating.product_id = product.id
      AND review_rating.status = 'PUBLISHED'
      AND review_rating.is_removed = 0
  )`;
}

export async function loadRatingStats(
  productIds: string[],
): Promise<Map<string, RatingStats>> {
  const stats = new Map<string, RatingStats>();

  if (productIds.length === 0) {
    return stats;
  }

  const rows = await reviewRepository
    .createQueryBuilder("review")
    .select("review.productId", "productId")
    .addSelect("AVG(review.rating)", "rating")
    .addSelect("COUNT(review.id)", "reviewCount")
    .where("review.productId IN (:...productIds)", { productIds })
    .andWhere("review.status = :status", { status: "PUBLISHED" })
    .andWhere("review.isRemoved = :isRemoved", { isRemoved: false })
    .groupBy("review.productId")
    .getRawMany<{
      productId: string;
      rating: string | number | null;
      reviewCount: string | number;
    }>();

  for (const row of rows) {
    stats.set(row.productId, {
      rating: Number(Number(row.rating ?? 0).toFixed(1)),
      reviewCount: Number(row.reviewCount ?? 0),
    });
  }

  return stats;
}

export function serializeProduct(
  product: Product,
  stats: Map<string, RatingStats>,
): ProductResponse {
  const productStats = stats.get(product.id);

  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    price: Number(product.price),
    image: product.imageUrl ?? product.thumbnailUrl ?? "",
    category: product.category,
    rating: productStats?.rating ?? 0,
    reviewCount: productStats?.reviewCount ?? 0,
    inStock: product.inventory
      ? product.inventory.totalStock > product.inventory.reservedStock
      : false,
  };
}

export async function getProducts(
  filters: ProductQueryInput,
): Promise<PaginatedProducts> {
  const { category, search, priceMin, priceMax, minRating, inStockOnly, sort } =
    filters;
  const { page, limit } = filters;

  const queryBuilder = productRepository
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.inventory", "inventory")
    .where("product.isRemoved = :isRemoved", { isRemoved: false });

  if (category) {
    queryBuilder.andWhere("product.category = :category", { category });
  }

  if (search) {
    queryBuilder.andWhere(
      "(product.name LIKE :search OR product.description LIKE :search)",
      { search: `%${search}%` },
    );
  }

  if (priceMin !== undefined) {
    queryBuilder.andWhere("product.price >= :priceMin", { priceMin });
  }

  if (priceMax !== undefined) {
    queryBuilder.andWhere("product.price <= :priceMax", { priceMax });
  }

  if (minRating !== undefined) {
    queryBuilder.andWhere(`${ratingSubquery()} >= :minRating`, { minRating });
  }

  if (inStockOnly) {
    queryBuilder
      .andWhere("inventory.totalStock > inventory.reservedStock")
      .andWhere("inventory.isRemoved = :inventoryRemoved", {
        inventoryRemoved: false,
      });
  }

  switch (sort) {
    case "price_asc":
      queryBuilder.orderBy("product.price", "ASC");
      break;
    case "price_desc":
      queryBuilder.orderBy("product.price", "DESC");
      break;
    case "rating":
      queryBuilder
        .orderBy(ratingSubquery(), "DESC")
        .addOrderBy("product.createdAt", "DESC");
      break;
    case "bestselling":
      queryBuilder.orderBy("product.createdAt", "DESC");
      break;
    case "newest":
    default:
      queryBuilder.orderBy("product.createdAt", "DESC");
      break;
  }

  const [products, total] = await queryBuilder
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  const stats = await loadRatingStats(products.map((product) => product.id));

  return {
    products: products.map((product) => serializeProduct(product, stats)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductById(
  id: string,
): Promise<ProductResponse | null> {
  const product = await productRepository.findOne({
    where: { id, isRemoved: false },
    relations: { inventory: true },
  });

  if (!product) {
    return null;
  }

  const stats = await loadRatingStats([product.id]);

  return serializeProduct(product, stats);
}
