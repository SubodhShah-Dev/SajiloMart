export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  isFlashDeal?: boolean;
  flashDealEndTime?: string;
  badge?: "new" | "bestseller" | "limited" | "sale";
}

export interface BrowseFilters {
  categories: string[];
  priceMin: number | null;
  priceMax: number | null;
  minRating: number | null;
  inStockOnly: boolean;
  sort: "price_asc" | "price_desc" | "rating" | "newest" | "bestselling";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  productCount: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor?: string;
}

export const mockCategories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    slug: "electronics",
    icon: "📱",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop",
    productCount: 245,
  },
  {
    id: "fashion",
    name: "Fashion",
    slug: "fashion",
    icon: "👗",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop",
    productCount: 512,
  },
  {
    id: "home",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    icon: "🏠",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
    productCount: 328,
  },
  {
    id: "beauty",
    name: "Beauty",
    slug: "beauty",
    icon: "💄",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
    productCount: 189,
  },
  {
    id: "sports",
    name: "Sports",
    slug: "sports",
    icon: "⚽",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=400&fit=crop",
    productCount: 156,
  },
  {
    id: "books",
    name: "Books",
    slug: "books",
    icon: "📚",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop",
    productCount: 423,
  },
  {
    id: "toys",
    name: "Toys & Games",
    slug: "toys-games",
    icon: "🧸",
    image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop",
    productCount: 267,
  },
  {
    id: "automotive",
    name: "Automotive",
    slug: "automotive",
    icon: "🚗",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop",
    productCount: 98,
  },
];

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Noise-Canceling Headphones",
    description: "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
    price: 299.99,
    originalPrice: 399.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    category: "electronics",
    rating: 4.7,
    reviewCount: 1234,
    badge: "bestseller",
  },
  {
    id: "2",
    name: "Smart Watch Series 7",
    description: "Advanced health monitoring, GPS, and cellular connectivity in a sleek design.",
    price: 399.99,
    originalPrice: 449.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    category: "electronics",
    rating: 4.8,
    reviewCount: 892,
    isFlashDeal: true,
    flashDealEndTime: "2024-12-31T23:59:59Z",
    badge: "limited",
  },
  {
    id: "3",
    name: "Organic Cotton T-Shirt",
    description: "Comfortable and sustainable organic cotton t-shirt in multiple colors.",
    price: 29.99,
    originalPrice: 39.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    category: "fashion",
    rating: 4.5,
    reviewCount: 567,
    badge: "sale",
  },
  {
    id: "4",
    name: "Stainless Steel Water Bottle",
    description: "Insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours.",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    category: "home",
    rating: 4.6,
    reviewCount: 1123,
  },
  {
    id: "5",
    name: "Vitamin C Serum",
    description: "Brightening serum with 20% Vitamin C for radiant skin.",
    price: 34.99,
    originalPrice: 44.99,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    category: "beauty",
    rating: 4.7,
    reviewCount: 789,
    badge: "new",
  },
  {
    id: "6",
    name: "Yoga Mat Premium",
    description: "Non-slip, eco-friendly yoga mat with alignment markers.",
    price: 49.99,
    originalPrice: 64.99,
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop",
    category: "sports",
    rating: 4.8,
    reviewCount: 445,
    badge: "sale",
  },
  {
    id: "7",
    name: "Bestseller Novel Collection",
    description: "Set of 5 award-winning novels from top authors.",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1474932420083-8a36c3f0b9c4?w=400&h=400&fit=crop",
    category: "books",
    rating: 4.9,
    reviewCount: 2156,
    badge: "bestseller",
  },
  {
    id: "8",
    name: "LEGO Creator Expert Set",
    description: "Detailed building set for adults with 2000+ pieces.",
    price: 199.99,
    originalPrice: 249.99,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
    category: "toys",
    rating: 4.8,
    reviewCount: 334,
    isFlashDeal: true,
    flashDealEndTime: "2024-12-31T23:59:59Z",
    badge: "limited",
  },
  {
    id: "9",
    name: "Portable Bluetooth Speaker",
    description: "Waterproof speaker with 20-hour playtime and deep bass.",
    price: 79.99,
    originalPrice: 99.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    category: "electronics",
    rating: 4.6,
    reviewCount: 876,
    badge: "sale",
  },
  {
    id: "10",
    name: "Ceramic Coffee Mug Set",
    description: "Set of 4 handcrafted ceramic mugs, 12oz each.",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=400&fit=crop",
    category: "home",
    rating: 4.5,
    reviewCount: 234,
  },
  {
    id: "11",
    name: "Running Shoes Pro",
    description: "Lightweight running shoes with responsive cushioning.",
    price: 129.99,
    originalPrice: 159.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    category: "sports",
    rating: 4.7,
    reviewCount: 1567,
    badge: "bestseller",
  },
  {
    id: "12",
    name: "Skincare Routine Set",
    description: "Complete 5-step skincare routine for all skin types.",
    price: 89.99,
    originalPrice: 119.99,
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop",
    category: "beauty",
    rating: 4.6,
    reviewCount: 543,
    badge: "new",
  },
];

export const mockFlashDealProducts: Product[] = [
  {
    id: "fd-1",
    name: "4K Ultra HD Smart TV 55\"",
    description: "Smart TV with HDR, Dolby Vision, and built-in streaming apps.",
    price: 599.99,
    originalPrice: 799.99,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
    category: "electronics",
    rating: 4.7,
    reviewCount: 445,
    isFlashDeal: true,
    flashDealEndTime: "2024-12-31T23:59:59Z",
    badge: "limited",
  },
  {
    id: "fd-2",
    name: "Robot Vacuum Cleaner",
    description: "Smart mapping, auto-empty dock, and app control.",
    price: 349.99,
    originalPrice: 499.99,
    image: "https://images.unsplash.com/photo-1558317350-4f2c0c8a3d5b?w=400&h=400&fit=crop",
    category: "home",
    rating: 4.6,
    reviewCount: 334,
    isFlashDeal: true,
    flashDealEndTime: "2024-12-31T23:59:59Z",
    badge: "limited",
  },
  {
    id: "fd-3",
    name: "Wireless Earbuds Pro",
    description: "Active noise cancellation with transparency mode.",
    price: 179.99,
    originalPrice: 249.99,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    category: "electronics",
    rating: 4.8,
    reviewCount: 1123,
    isFlashDeal: true,
    flashDealEndTime: "2024-12-31T23:59:59Z",
    badge: "limited",
  },
  {
    id: "fd-4",
    name: "Air Fryer XL 6L",
    description: "Healthy cooking with 85% less fat, 10 presets.",
    price: 89.99,
    originalPrice: 129.99,
    image: "https://images.unsplash.com/photo-1580153406481-45334b50e2d2?w=400&h=400&fit=crop",
    category: "home",
    rating: 4.7,
    reviewCount: 789,
    isFlashDeal: true,
    flashDealEndTime: "2024-12-31T23:59:59Z",
    badge: "limited",
  },
];

export const mockBanners: Banner[] = [
  {
    id: "banner-1",
    title: "Winter Sale Up to 50% Off",
    subtitle: "Discover amazing deals on your favorite brands. Limited time only!",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop",
    ctaText: "Shop Now",
    ctaLink: "/deals",
    backgroundColor: "bg-primary",
  },
  {
    id: "banner-2",
    title: "New Season Collection",
    subtitle: "Fresh styles for the new season. Explore the latest trends.",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=400&fit=crop",
    ctaText: "Explore",
    ctaLink: "/new-arrivals",
    backgroundColor: "bg-secondary",
  },
  {
    id: "banner-3",
    title: "Free Shipping on Orders $50+",
    subtitle: "Enjoy free delivery on all orders over $50. No code needed.",
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1200&h=400&fit=crop",
    ctaText: "Learn More",
    ctaLink: "/shipping",
    backgroundColor: "bg-success/20",
  },
];

export const mockPromoBanners: Banner[] = [
  {
    id: "promo-1",
    title: "Electronics Sale",
    subtitle: "Up to 40% off laptops, phones & accessories",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=300&fit=crop",
    ctaText: "Shop Electronics",
    ctaLink: "/browse?category=electronics",
  },
  {
    id: "promo-2",
    title: "Fashion Trends",
    subtitle: "New arrivals every week. Free returns.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=300&fit=crop",
    ctaText: "Shop Fashion",
    ctaLink: "/browse?category=fashion",
  },
];

export function getProductsByCategory(categorySlug: string): Product[] {
  return mockProducts.filter((p) => p.category === categorySlug);
}

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id) || mockFlashDealProducts.find((p) => p.id === id);
}

export function getFlashDeals(): Product[] {
  return mockFlashDealProducts;
}

export function getFeaturedProducts(limit = 8): Product[] {
  return mockProducts.slice(0, limit);
}

export function getFilteredProducts(filters: BrowseFilters): Product[] {
  let products = [...mockProducts];

  // Filter by categories
  if (filters.categories.length > 0) {
    products = products.filter((p) => filters.categories.includes(p.category));
  }

  // Filter by price range
  if (filters.priceMin !== null) {
    products = products.filter((p) => p.price >= filters.priceMin!);
  }
  if (filters.priceMax !== null) {
    products = products.filter((p) => p.price <= filters.priceMax!);
  }

  // Filter by minimum rating
  if (filters.minRating !== null) {
    products = products.filter((p) => p.rating >= filters.minRating!);
  }

  // Filter by in-stock (mock: all products are in stock for now)
  // In a real app, you'd check inventory
  if (filters.inStockOnly) {
    // All products are considered in stock for this mock
  }

  // Sort products
  switch (filters.sort) {
    case "price_asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      products.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      // Assuming newer products are at the end of the array
      products.sort((a, b) => mockProducts.indexOf(b) - mockProducts.indexOf(a));
      break;
    case "bestselling":
      products.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
  }

  return products;
}