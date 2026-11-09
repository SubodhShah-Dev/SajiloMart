import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAt1730000000016 implements MigrationInterface {
  name = "AddDeletedAt1730000000016";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      "districts", "users", "products", "addresses", "inventory",
      "carts", "cart_items", "orders", "order_items", "payments",
      "wishlist_items", "reviews", "refresh_sessions",
    ];
    for (const table of tables) {
      await queryRunner.query(`
        ALTER TABLE \`${table}\`
        ADD COLUMN \`deleted_at\` DATETIME(6) NULL
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      "districts", "users", "products", "addresses", "inventory",
      "carts", "cart_items", "orders", "order_items", "payments",
      "wishlist_items", "reviews", "refresh_sessions",
    ];
    for (const table of tables) {
      await queryRunner.query(`
        ALTER TABLE \`${table}\`
        DROP COLUMN \`deleted_at\`
      `);
    }
  }
}
