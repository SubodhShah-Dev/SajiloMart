import { AppDataSource } from "../config/data-source.js";
import { Product } from "../entities/Product.js";
import { User } from "../entities/User.js";
import { hasDemoOrders, insertDemoOrders } from "./demo-orders.js";

/**
 * Adds demo orders to an existing database without deleting anything.
 *
 * Unlike `npm run seed`, this script never clears tables. It only needs an
 * existing CUSTOMER account and at least one product, and it is idempotent:
 * once demo orders exist it exits without inserting another batch.
 */
async function main() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  if (await hasDemoOrders()) {
    // eslint-disable-next-line no-console
    console.log("Demo orders already exist. Nothing to do.");
    return;
  }

  const users = await AppDataSource.getRepository(User).find({
    where: { role: "CUSTOMER" },
  });
  const products = await AppDataSource.getRepository(Product).find({
    where: { isRemoved: false },
  });

  if (users.length === 0 || products.length === 0) {
    // eslint-disable-next-line no-console
    console.error(
      "Cannot create demo orders: at least one CUSTOMER account and one active product are required.",
    );
    process.exitCode = 1;
    return;
  }

  const orders = await insertDemoOrders(users, products);

  // eslint-disable-next-line no-console
  console.log(`Demo orders created: ${orders.length}`);
  // eslint-disable-next-line no-console
  console.log("Existing users, stores, products, and orders were left untouched.");
}

void main()
  .catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error(
      "Failed to create demo orders:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
