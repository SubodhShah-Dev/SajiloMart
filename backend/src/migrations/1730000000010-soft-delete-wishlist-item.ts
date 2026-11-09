import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteWishlistItem1730000000010 implements MigrationInterface {
  name = 'SoftDeleteWishlistItem1730000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`wishlist_items\`
      ADD COLUMN \`is_removed\` BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_wishlist_items_is_removed\` ON \`wishlist_items\` (\`is_removed\`)
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_wishlist_items_user_id_is_removed\` ON \`wishlist_items\` (\`user_id\`, \`is_removed\`)
    `);

    await queryRunner.query(`
      ALTER TABLE \`wishlist_items\` DROP FOREIGN KEY \`FK_wishlist_items_user_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`wishlist_items\`
      ADD CONSTRAINT \`FK_wishlist_items_user_id\`
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
        ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE \`wishlist_items\` DROP FOREIGN KEY \`FK_wishlist_items_product_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`wishlist_items\`
      ADD CONSTRAINT \`FK_wishlist_items_product_id\`
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`)
        ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`wishlist_items\` DROP FOREIGN KEY \`FK_wishlist_items_product_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`wishlist_items\`
      ADD CONSTRAINT \`FK_wishlist_items_product_id\`
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`)
        ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`wishlist_items\` DROP FOREIGN KEY \`FK_wishlist_items_user_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`wishlist_items\`
      ADD CONSTRAINT \`FK_wishlist_items_user_id\`
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
        ON DELETE CASCADE
    `);

    await queryRunner.query(`DROP INDEX \`IDX_wishlist_items_user_id_is_removed\` ON \`wishlist_items\``);
    await queryRunner.query(`DROP INDEX \`IDX_wishlist_items_is_removed\` ON \`wishlist_items\``);
    await queryRunner.query(`ALTER TABLE \`wishlist_items\` DROP COLUMN \`is_removed\``);
  }
}