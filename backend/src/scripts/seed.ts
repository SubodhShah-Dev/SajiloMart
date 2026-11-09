import { AppDataSource } from "../config/data-source.js";
import { User } from "../entities/User.js";
import { Store } from "../entities/Store.js";
import { Product } from "../entities/Product.js";
import { Inventory } from "../entities/Inventory.js";
import { bcryptHash } from "../utils/hash.util.js";

const CATEGORIES = [
  "electronics",
  "fashion",
  "home",
  "beauty",
  "sports",
  "books",
  "toys",
  "automotive",
] as const;

const productsData: Array<{
  name: string;
  description: string;
  category: (typeof CATEGORIES)[number];
  price: string;
  imageUrl?: string;
  thumbnailUrl?: string;
}> = [
  // Electronics
  {
    name: "Wireless Bluetooth Headphones",
    description: "Noise-cancelling over-ear headphones with 30-hour battery life.",
    category: "electronics",
    price: "89.99",
    imageUrl: "https://example.com/images/headphones.jpg",
    thumbnailUrl: "https://example.com/thumbs/headphones.jpg",
  },
  {
    name: "Smartphone 128GB",
    description: "Latest model smartphone with OLED display and 5G support.",
    category: "electronics",
    price: "699.99",
    imageUrl: "https://example.com/images/smartphone.jpg",
    thumbnailUrl: "https://example.com/thumbs/smartphone.jpg",
  },
  {
    name: "Laptop 14 inch",
    description: "Lightweight laptop with 16GB RAM and 512GB SSD.",
    category: "electronics",
    price: "999.99",
    imageUrl: "https://example.com/images/laptop.jpg",
    thumbnailUrl: "https://example.com/thumbs/laptop.jpg",
  },
  {
    name: "Smart Watch",
    description: "Fitness tracker with heart rate monitoring and GPS.",
    category: "electronics",
    price: "199.99",
    imageUrl: "https://example.com/images/smartwatch.jpg",
    thumbnailUrl: "https://example.com/thumbs/smartwatch.jpg",
  },
  {
    name: "Wireless Earbuds",
    description: "True wireless earbuds with active noise cancellation.",
    category: "electronics",
    price: "129.99",
    imageUrl: "https://example.com/images/earbuds.jpg",
    thumbnailUrl: "https://example.com/thumbs/earbuds.jpg",
  },
  {
    name: "4K Monitor",
    description: "27-inch 4K UHD monitor with HDR support.",
    category: "electronics",
    price: "349.99",
    imageUrl: "https://example.com/images/monitor.jpg",
    thumbnailUrl: "https://example.com/thumbs/monitor.jpg",
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB backlit mechanical keyboard with blue switches.",
    category: "electronics",
    price: "119.99",
    imageUrl: "https://example.com/images/keyboard.jpg",
    thumbnailUrl: "https://example.com/thumbs/keyboard.jpg",
  },
  {
    name: "Gaming Mouse",
    description: "High-precision gaming mouse with programmable buttons.",
    category: "electronics",
    price: "59.99",
    imageUrl: "https://example.com/images/mouse.jpg",
    thumbnailUrl: "https://example.com/thumbs/mouse.jpg",
  },
  {
    name: "Portable Power Bank",
    description: "20000mAh power bank with fast charging support.",
    category: "electronics",
    price: "49.99",
    imageUrl: "https://example.com/images/powerbank.jpg",
    thumbnailUrl: "https://example.com/thumbs/powerbank.jpg",
  },
  {
    name: "USB-C Hub",
    description: "7-in-1 USB-C hub with HDMI and SD card reader.",
    category: "electronics",
    price: "39.99",
    imageUrl: "https://example.com/images/hub.jpg",
    thumbnailUrl: "https://example.com/thumbs/hub.jpg",
  },

  // Fashion
  {
    name: "Cotton T-Shirt",
    description: "Premium organic cotton t-shirt in multiple colors.",
    category: "fashion",
    price: "24.99",
    imageUrl: "https://example.com/images/tshirt.jpg",
    thumbnailUrl: "https://example.com/thumbs/tshirt.jpg",
  },
  {
    name: "Denim Jeans",
    description: "Classic fit denim jeans with stretch comfort.",
    category: "fashion",
    price: "59.99",
    imageUrl: "https://example.com/images/jeans.jpg",
    thumbnailUrl: "https://example.com/thumbs/jeans.jpg",
  },
  {
    name: "Leather Jacket",
    description: "Genuine leather jacket with vintage styling.",
    category: "fashion",
    price: "149.99",
    imageUrl: "https://example.com/images/jacket.jpg",
    thumbnailUrl: "https://example.com/thumbs/jacket.jpg",
  },
  {
    name: "Running Shoes",
    description: "Lightweight running shoes with cushioned sole.",
    category: "fashion",
    price: "89.99",
    imageUrl: "https://example.com/images/runningshoes.jpg",
    thumbnailUrl: "https://example.com/thumbs/runningshoes.jpg",
  },
  {
    name: "Summer Dress",
    description: "Flowy summer dress perfect for warm weather.",
    category: "fashion",
    price: "49.99",
    imageUrl: "https://example.com/images/dress.jpg",
    thumbnailUrl: "https://example.com/thumbs/dress.jpg",
  },
  {
    name: "Wool Sweater",
    description: "Warm merino wool sweater for winter.",
    category: "fashion",
    price: "79.99",
    imageUrl: "https://example.com/images/sweater.jpg",
    thumbnailUrl: "https://example.com/thumbs/sweater.jpg",
  },
  {
    name: "Silk Scarf",
    description: "Luxurious silk scarf with elegant print.",
    category: "fashion",
    price: "34.99",
    imageUrl: "https://example.com/images/scarf.jpg",
    thumbnailUrl: "https://example.com/thumbs/scarf.jpg",
  },
  {
    name: "Canvas Backpack",
    description: "Durable canvas backpack for daily use.",
    category: "fashion",
    price: "44.99",
    imageUrl: "https://example.com/images/backpack.jpg",
    thumbnailUrl: "https://example.com/thumbs/backpack.jpg",
  },
  {
    name: "Sunglasses",
    description: "UV-protection sunglasses with polarized lenses.",
    category: "fashion",
    price: "29.99",
    imageUrl: "https://example.com/images/sunglasses.jpg",
    thumbnailUrl: "https://example.com/thumbs/sunglasses.jpg",
  },
  {
    name: "Leather Belt",
    description: "Genuine leather belt with automatic buckle.",
    category: "fashion",
    price: "24.99",
    imageUrl: "https://example.com/images/belt.jpg",
    thumbnailUrl: "https://example.com/thumbs/belt.jpg",
  },

  // Home
  {
    name: "Coffee Maker",
    description: "Programmable drip coffee maker with thermal carafe.",
    category: "home",
    price: "79.99",
    imageUrl: "https://example.com/images/coffeemaker.jpg",
    thumbnailUrl: "https://example.com/thumbs/coffeemaker.jpg",
  },
  {
    name: "Bedding Set",
    description: "100% cotton bedding set with 4 pieces.",
    category: "home",
    price: "59.99",
    imageUrl: "https://example.com/images/bedding.jpg",
    thumbnailUrl: "https://example.com/thumbs/bedding.jpg",
  },
  {
    name: "Table Lamp",
    description: "Modern LED table lamp with adjustable brightness.",
    category: "home",
    price: "34.99",
    imageUrl: "https://example.com/images/lamp.jpg",
    thumbnailUrl: "https://example.com/thumbs/lamp.jpg",
  },
  {
    name: "Cookware Set",
    description: "Non-stick cookware set with 10 pieces.",
    category: "home",
    price: "129.99",
    imageUrl: "https://example.com/images/cookware.jpg",
    thumbnailUrl: "https://example.com/thumbs/cookware.jpg",
  },
  {
    name: "Wall Clock",
    description: "Modern minimalist wall clock with silent movement.",
    category: "home",
    price: "39.99",
    imageUrl: "https://example.com/images/clock.jpg",
    thumbnailUrl: "https://example.com/thumbs/clock.jpg",
  },
  {
    name: "Throw Pillows",
    description: "Set of 2 decorative throw pillows with removable covers.",
    category: "home",
    price: "29.99",
    imageUrl: "https://example.com/images/pillows.jpg",
    thumbnailUrl: "https://example.com/thumbs/pillows.jpg",
  },
  {
    name: "Air Purifier",
    description: "HEPA air purifier for rooms up to 300 sq ft.",
    category: "home",
    price: "149.99",
    imageUrl: "https://example.com/images/airpurifier.jpg",
    thumbnailUrl: "https://example.com/thumbs/airpurifier.jpg",
  },
  {
    name: "Storage Baskets",
    description: "Set of 3 woven storage baskets for organization.",
    category: "home",
    price: "34.99",
    imageUrl: "https://example.com/images/baskets.jpg",
    thumbnailUrl: "https://example.com/thumbs/baskets.jpg",
  },
  {
    name: "Kitchen Knife Set",
    description: "Professional kitchen knife set with wooden block.",
    category: "home",
    price: "89.99",
    imageUrl: "https://example.com/images/knifeset.jpg",
    thumbnailUrl: "https://example.com/thumbs/knifeset.jpg",
  },
  {
    name: "Area Rug",
    description: "Soft area rug for living room, multiple sizes available.",
    category: "home",
    price: "119.99",
    imageUrl: "https://example.com/images/rug.jpg",
    thumbnailUrl: "https://example.com/thumbs/rug.jpg",
  },

  // Beauty
  {
    name: "Moisturizer",
    description: "Hydrating face moisturizer with SPF 30.",
    category: "beauty",
    price: "24.99",
    imageUrl: "https://example.com/images/moisturizer.jpg",
    thumbnailUrl: "https://example.com/thumbs/moisturizer.jpg",
  },
  {
    name: "Lipstick Set",
    description: "Set of 5 matte lipsticks in various shades.",
    category: "beauty",
    price: "34.99",
    imageUrl: "https://example.com/images/lipstick.jpg",
    thumbnailUrl: "https://example.com/thumbs/lipstick.jpg",
  },
  {
    name: "Face Serum",
    description: "Vitamin C face serum for brightening and anti-aging.",
    category: "beauty",
    price: "44.99",
    imageUrl: "https://example.com/images/serum.jpg",
    thumbnailUrl: "https://example.com/thumbs/serum.jpg",
  },
  {
    name: "Mascara",
    description: "Waterproof mascara for voluminous lashes.",
    category: "beauty",
    price: "19.99",
    imageUrl: "https://example.com/images/mascara.jpg",
    thumbnailUrl: "https://example.com/thumbs/mascara.jpg",
  },
  {
    name: "Perfume",
    description: "Eau de parfum with floral and woody notes.",
    category: "beauty",
    price: "79.99",
    imageUrl: "https://example.com/images/perfume.jpg",
    thumbnailUrl: "https://example.com/thumbs/perfume.jpg",
  },
  {
    name: "Nail Polish Set",
    description: "Set of 6 nail polish colors with top coat.",
    category: "beauty",
    price: "29.99",
    imageUrl: "https://example.com/images/nailpolish.jpg",
    thumbnailUrl: "https://example.com/thumbs/nailpolish.jpg",
  },
  {
    name: "Makeup Brushes",
    description: "Professional makeup brush set with case.",
    category: "beauty",
    price: "39.99",
    imageUrl: "https://example.com/images/brushes.jpg",
    thumbnailUrl: "https://example.com/thumbs/brushes.jpg",
  },
  {
    name: "Body Lotion",
    description: "Moisturizing body lotion with shea butter.",
    category: "beauty",
    price: "14.99",
    imageUrl: "https://example.com/images/lotion.jpg",
    thumbnailUrl: "https://example.com/thumbs/lotion.jpg",
  },
  {
    name: "Cleansing Foam",
    description: "Gentle facial cleansing foam for daily use.",
    category: "beauty",
    price: "16.99",
    imageUrl: "https://example.com/images/cleanser.jpg",
    thumbnailUrl: "https://example.com/thumbs/cleanser.jpg",
  },
  {
    name: "Hair Dryer",
    description: "Professional hair dryer with ionic technology.",
    category: "beauty",
    price: "59.99",
    imageUrl: "https://example.com/images/hairdryer.jpg",
    thumbnailUrl: "https://example.com/thumbs/hairdryer.jpg",
  },

  // Sports
  {
    name: "Yoga Mat",
    description: "Non-slip yoga mat with carrying strap.",
    category: "sports",
    price: "29.99",
    imageUrl: "https://example.com/images/yogamat.jpg",
    thumbnailUrl: "https://example.com/thumbs/yogamat.jpg",
  },
  {
    name: "Dumbbell Set",
    description: "Adjustable dumbbell set, 5-25 lbs each.",
    category: "sports",
    price: "149.99",
    imageUrl: "https://example.com/images/dumbbells.jpg",
    thumbnailUrl: "https://example.com/thumbs/dumbbells.jpg",
  },
  {
    name: "Basketball",
    description: "Official size basketball with deep channel design.",
    category: "sports",
    price: "24.99",
    imageUrl: "https://example.com/images/basketball.jpg",
    thumbnailUrl: "https://example.com/thumbs/basketball.jpg",
  },
  {
    name: "Resistance Bands",
    description: "Set of 5 resistance bands with door anchor.",
    category: "sports",
    price: "19.99",
    imageUrl: "https://example.com/images/resistancebands.jpg",
    thumbnailUrl: "https://example.com/thumbs/resistancebands.jpg",
  },
  {
    name: "Tennis Racket",
    description: "Lightweight tennis racket for beginners.",
    category: "sports",
    price: "59.99",
    imageUrl: "https://example.com/images/tennisracket.jpg",
    thumbnailUrl: "https://example.com/thumbs/tennisracket.jpg",
  },
  {
    name: "Jump Rope",
    description: "Adjustable speed jump rope with ball bearings.",
    category: "sports",
    price: "14.99",
    imageUrl: "https://example.com/images/jumprope.jpg",
    thumbnailUrl: "https://example.com/thumbs/jumprope.jpg",
  },
  {
    name: "Water Bottle",
    description: "Insulated stainless steel water bottle, 32 oz.",
    category: "sports",
    price: "24.99",
    imageUrl: "https://example.com/images/waterbottle.jpg",
    thumbnailUrl: "https://example.com/thumbs/waterbottle.jpg",
  },
  {
    name: "Foam Roller",
    description: "High-density foam roller for muscle recovery.",
    category: "sports",
    price: "24.99",
    imageUrl: "https://example.com/images/foamroller.jpg",
    thumbnailUrl: "https://example.com/thumbs/foamroller.jpg",
  },
  {
    name: "Exercise Bike",
    description: "Stationary exercise bike with digital display.",
    category: "sports",
    price: "299.99",
    imageUrl: "https://example.com/images/exercisebike.jpg",
    thumbnailUrl: "https://example.com/thumbs/exercisebike.jpg",
  },
  {
    name: "Running Watch",
    description: "GPS running watch with heart rate monitor.",
    category: "sports",
    price: "179.99",
    imageUrl: "https://example.com/images/runningwatch.jpg",
    thumbnailUrl: "https://example.com/thumbs/runningwatch.jpg",
  },

  // Books
  {
    name: "Programming Guide",
    description: "Complete guide to modern web development.",
    category: "books",
    price: "39.99",
    imageUrl: "https://example.com/images/programming.jpg",
    thumbnailUrl: "https://example.com/thumbs/programming.jpg",
  },
  {
    name: "Cookbook",
    description: "Easy recipes for everyday cooking.",
    category: "books",
    price: "24.99",
    imageUrl: "https://example.com/images/cookbook.jpg",
    thumbnailUrl: "https://example.com/thumbs/cookbook.jpg",
  },
  {
    name: "Novel",
    description: "Bestselling fiction novel, hardcover edition.",
    category: "books",
    price: "19.99",
    imageUrl: "https://example.com/images/novel.jpg",
    thumbnailUrl: "https://example.com/thumbs/novel.jpg",
  },
  {
    name: "History Book",
    description: "Illustrated world history book.",
    category: "books",
    price: "29.99",
    imageUrl: "https://example.com/images/history.jpg",
    thumbnailUrl: "https://example.com/thumbs/history.jpg",
  },
  {
    name: "Self Help",
    description: "Guide to personal growth and productivity.",
    category: "books",
    price: "17.99",
    imageUrl: "https://example.com/images/selfhelp.jpg",
    thumbnailUrl: "https://example.com/thumbs/selfhelp.jpg",
  },
  {
    name: "Children's Book",
    description: "Illustrated children's story book.",
    category: "books",
    price: "14.99",
    imageUrl: "https://example.com/images/childrensbook.jpg",
    thumbnailUrl: "https://example.com/thumbs/childrensbook.jpg",
  },
  {
    name: "Science Textbook",
    description: "University-level physics textbook.",
    category: "books",
    price: "89.99",
    imageUrl: "https://example.com/images/science.jpg",
    thumbnailUrl: "https://example.com/thumbs/science.jpg",
  },
  {
    name: "Poetry Collection",
    description: "Selected poems from renowned authors.",
    category: "books",
    price: "16.99",
    imageUrl: "https://example.com/images/poetry.jpg",
    thumbnailUrl: "https://example.com/thumbs/poetry.jpg",
  },
  {
    name: "Travel Guide",
    description: "Comprehensive travel guide to Europe.",
    category: "books",
    price: "22.99",
    imageUrl: "https://example.com/images/travel.jpg",
    thumbnailUrl: "https://example.com/thumbs/travel.jpg",
  },
  {
    name: "Business Book",
    description: "Leadership and management strategies.",
    category: "books",
    price: "27.99",
    imageUrl: "https://example.com/images/business.jpg",
    thumbnailUrl: "https://example.com/thumbs/business.jpg",
  },

  // Toys
  {
    name: "Building Blocks",
    description: "Set of 100 colorful building blocks for kids.",
    category: "toys",
    price: "29.99",
    imageUrl: "https://example.com/images/blocks.jpg",
    thumbnailUrl: "https://example.com/thumbs/blocks.jpg",
  },
  {
    name: "Remote Control Car",
    description: "Fast RC car with rechargeable battery.",
    category: "toys",
    price: "49.99",
    imageUrl: "https://example.com/images/rc-car.jpg",
    thumbnailUrl: "https://example.com/thumbs/rc-car.jpg",
  },
  {
    name: "Board Game",
    description: "Family strategy board game for 2-4 players.",
    category: "toys",
    price: "34.99",
    imageUrl: "https://example.com/images/boardgame.jpg",
    thumbnailUrl: "https://example.com/thumbs/boardgame.jpg",
  },
  {
    name: "Dollhouse",
    description: "Wooden dollhouse with furniture set.",
    category: "toys",
    price: "79.99",
    imageUrl: "https://example.com/images/dollhouse.jpg",
    thumbnailUrl: "https://example.com/thumbs/dollhouse.jpg",
  },
  {
    name: "Puzzle Set",
    description: "500-piece jigsaw puzzle with landscape image.",
    category: "toys",
    price: "19.99",
    imageUrl: "https://example.com/images/puzzle.jpg",
    thumbnailUrl: "https://example.com/thumbs/puzzle.jpg",
  },
  {
    name: "Stuffed Animal",
    description: "Soft plush stuffed animal, multiple designs.",
    category: "toys",
    price: "24.99",
    imageUrl: "https://example.com/images/stuffed.jpg",
    thumbnailUrl: "https://example.com/thumbs/stuffed.jpg",
  },
  {
    name: "Art Set",
    description: "Complete drawing and painting set for kids.",
    category: "toys",
    price: "39.99",
    imageUrl: "https://example.com/images/artset.jpg",
    thumbnailUrl: "https://example.com/thumbs/artset.jpg",
  },
  {
    name: "Train Set",
    description: "Wooden train set with tracks and accessories.",
    category: "toys",
    price: "54.99",
    imageUrl: "https://example.com/images/trainset.jpg",
    thumbnailUrl: "https://example.com/thumbs/trainset.jpg",
  },
  {
    name: "Kids Scooter",
    description: "Three-wheel scooter for children ages 3+.",
    category: "toys",
    price: "44.99",
    imageUrl: "https://example.com/images/scooter.jpg",
    thumbnailUrl: "https://example.com/thumbs/scooter.jpg",
  },
  {
    name: "Science Kit",
    description: "STEM science experiment kit for curious minds.",
    category: "toys",
    price: "34.99",
    imageUrl: "https://example.com/images/sciencekit.jpg",
    thumbnailUrl: "https://example.com/thumbs/sciencekit.jpg",
  },

  // Automotive
  {
    name: "Car Phone Mount",
    description: "Adjustable car phone mount with suction cup.",
    category: "automotive",
    price: "19.99",
    imageUrl: "https://example.com/images/phone-mount.jpg",
    thumbnailUrl: "https://example.com/thumbs/phone-mount.jpg",
  },
  {
    name: "Car Vacuum",
    description: "Portable car vacuum cleaner with 12V adapter.",
    category: "automotive",
    price: "39.99",
    imageUrl: "https://example.com/images/car-vacuum.jpg",
    thumbnailUrl: "https://example.com/thumbs/car-vacuum.jpg",
  },
  {
    name: "Tire Pressure Gauge",
    description: "Digital tire pressure gauge with LCD display.",
    category: "automotive",
    price: "14.99",
    imageUrl: "https://example.com/images/tire-gauge.jpg",
    thumbnailUrl: "https://example.com/thumbs/tire-gauge.jpg",
  },
  {
    name: "Car Seat Cushion",
    description: "Memory foam car seat cushion for back support.",
    category: "automotive",
    price: "29.99",
    imageUrl: "https://example.com/images/seat-cushion.jpg",
    thumbnailUrl: "https://example.com/thumbs/seat-cushion.jpg",
  },
  {
    name: "Jumper Cables",
    description: "Heavy-duty jumper cables, 20 ft length.",
    category: "automotive",
    price: "34.99",
    imageUrl: "https://example.com/images/jumper-cables.jpg",
    thumbnailUrl: "https://example.com/thumbs/jumper-cables.jpg",
  },
  {
    name: "Dash Cam",
    description: "1080p dash cam with loop recording and night vision.",
    category: "automotive",
    price: "89.99",
    imageUrl: "https://example.com/images/dashcam.jpg",
    thumbnailUrl: "https://example.com/thumbs/dashcam.jpg",
  },
  {
    name: "Car Air Freshener",
    description: "Long-lasting car air freshener, set of 2.",
    category: "automotive",
    price: "9.99",
    imageUrl: "https://example.com/images/air-freshener.jpg",
    thumbnailUrl: "https://example.com/thumbs/air-freshener.jpg",
  },
  {
    name: "Windshield Sun Shade",
    description: "Foldable windshield sun shade for UV protection.",
    category: "automotive",
    price: "24.99",
    imageUrl: "https://example.com/images/sun-shade.jpg",
    thumbnailUrl: "https://example.com/thumbs/sun-shade.jpg",
  },
  {
    name: "Car Organizer",
    description: "Backseat car organizer with multiple pockets.",
    category: "automotive",
    price: "24.99",
    imageUrl: "https://example.com/images/car-organizer.jpg",
    thumbnailUrl: "https://example.com/thumbs/car-organizer.jpg",
  },
  {
    name: "Steering Wheel Cover",
    description: "Leather steering wheel cover with grip texture.",
    category: "automotive",
    price: "19.99",
    imageUrl: "https://example.com/images/steering-cover.jpg",
    thumbnailUrl: "https://example.com/thumbs/steering-cover.jpg",
  },
];

const usersData: Array<{
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  passwordHash: string;
  role: "CUSTOMER" | "VENDOR";
}> = [
  { firstName: "Alice", lastName: "Johnson", userName: "alicej", email: "alice@example.com", passwordHash: "$2b$12$hashplaceholder1", role: "VENDOR" },
  { firstName: "Bob", lastName: "Smith", userName: "bobsmith", email: "bob@example.com", passwordHash: "$2b$12$hashplaceholder2", role: "VENDOR" },
  { firstName: "Carol", lastName: "Williams", userName: "carolw", email: "carol@example.com", passwordHash: "$2b$12$hashplaceholder3", role: "VENDOR" },
  { firstName: "David", lastName: "Brown", userName: "davidb", email: "david@example.com", passwordHash: "$2b$12$hashplaceholder4", role: "CUSTOMER" },
  { firstName: "Eve", lastName: "Davis", userName: "eved", email: "eve@example.com", passwordHash: "$2b$12$hashplaceholder5", role: "CUSTOMER" },
  { firstName: "Frank", lastName: "Miller", userName: "frankm", email: "frank@example.com", passwordHash: "$2b$12$hashplaceholder6", role: "CUSTOMER" },
  { firstName: "Grace", lastName: "Wilson", userName: "gracew", email: "grace@example.com", passwordHash: "$2b$12$hashplaceholder7", role: "CUSTOMER" },
  { firstName: "Hank", lastName: "Moore", userName: "hankm", email: "hank@example.com", passwordHash: "$2b$12$hashplaceholder8", role: "CUSTOMER" },
  { firstName: "Ivy", lastName: "Taylor", userName: "ivyt", email: "ivy@example.com", passwordHash: "$2b$12$hashplaceholder9", role: "CUSTOMER" },
  { firstName: "Jack", lastName: "Anderson", userName: "jacka", email: "jack@example.com", passwordHash: "$2b$12$hashplaceholder10", role: "CUSTOMER" },
];

const storesData: Array<{
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  status: "PENDING" | "APPROVED" | "SUSPENDED";
}> = [];

async function main() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  try {
    const userRepository = AppDataSource.getRepository(User);
    const storeRepository = AppDataSource.getRepository(Store);
    const productRepository = AppDataSource.getRepository(Product);
    const inventoryRepository = AppDataSource.getRepository(Inventory);

    await AppDataSource.query("SET FOREIGN_KEY_CHECKS = 0");
    await inventoryRepository.clear();
    await productRepository.clear();
    await storeRepository.clear();
    await userRepository.clear();
    await AppDataSource.query("SET FOREIGN_KEY_CHECKS = 1");

    const demoPasswordHash = await bcryptHash("Password123!");
    const users = userRepository.create(
      usersData.map((user) => ({ ...user, passwordHash: demoPasswordHash })),
    );
    const savedUsers = await userRepository.save(users);

    const vendors = savedUsers.filter((u) => u.role === "VENDOR");

    storesData.push(
      {
        ownerId: vendors[0].id,
        name: "Tech Haven",
        slug: "tech-haven",
        description: "Electronics and gadgets store.",
        logoUrl: null,
        status: "APPROVED",
      },
      {
        ownerId: vendors[1].id,
        name: "Style Boutique",
        slug: "style-boutique",
        description: "Fashion and apparel store.",
        logoUrl: null,
        status: "APPROVED",
      },
      {
        ownerId: vendors[2].id,
        name: "Home Essentials",
        slug: "home-essentials",
        description: "Home and living products.",
        logoUrl: null,
        status: "APPROVED",
      },
    );

    const stores = storeRepository.create(storesData);
    const savedStores = await storeRepository.save(stores);

    const allProducts: Product[] = [];
    const allInventories: Inventory[] = [];

    let storeIndex = 0;

    for (const category of CATEGORIES) {
      const categoryProducts = productsData.filter((p) => p.category === category);

      for (const productData of categoryProducts) {
        const store = savedStores[storeIndex % savedStores.length];
        const imageSeed = encodeURIComponent(
          productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        );
        const product = productRepository.create({
          ...productData,
          storeId: store.id,
          imageUrl: `https://picsum.photos/seed/${imageSeed}/600/600`,
          thumbnailUrl: `https://picsum.photos/seed/${imageSeed}/300/300`,
        });
        allProducts.push(product);

        const inventory = inventoryRepository.create({
          productId: "", // will be set after product save
          totalStock: Math.floor(Math.random() * 100) + 1,
          reservedStock: 0,
        });
        allInventories.push(inventory);

        storeIndex++;
      }
    }

    const savedProducts = await productRepository.save(allProducts);

    savedProducts.forEach((product, index) => {
      allInventories[index].productId = product.id;
    });

    await inventoryRepository.save(allInventories);

    // eslint-disable-next-line no-console
    console.log("Seed completed successfully.");
    // eslint-disable-next-line no-console
    console.log(`Users: ${savedUsers.length} (demo password: Password123!)`);
    // eslint-disable-next-line no-console
    console.log(`Stores: ${savedStores.length}`);
    // eslint-disable-next-line no-console
    console.log(`Products: ${savedProducts.length}`);
    // eslint-disable-next-line no-console
    console.log(`Inventories: ${allInventories.length}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void main();
