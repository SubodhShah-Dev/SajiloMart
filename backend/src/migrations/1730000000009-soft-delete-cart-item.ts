import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteCartItem1730000000009 implements MigrationInterface {
  name = 'SoftDeleteCartItem1730000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`cart_items\`
      ADD COLUMN \`is_removed\` BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_cart_items_is_removed\` ON \`cart_items\` (\`is_removed\`)
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_cart_items_cart_id_is_removed\` ON \`cart_items\` (\`cart_id\`, \`is_removed\`)
    `);

    await queryRunner.query(`
      ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_cart_items_cart_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`cart_items\`
      ADD CONSTRAINT \`FK_cart_items_cart_id\`
        FOREIGN KEY (\`cart_id\`) REFERENCES \`carts\` (\`id\`)
        ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_cart_items_product_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`cart_items\`
      ADD CONSTRAINT \`FK_cart_items_product_id\`
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`)
        ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_cart_items_product_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`cart_items\`
      ADD CONSTRAINT \`FK_cart_items_product_id\`
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`)
        ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_cart_items_cart_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`cart_items\`
      ADD CONSTRAINT \`FK_cart_items_cart_id\`
        FOREIGN KEY (\`cart_id\`) REFERENCES \`carts\` (\`id\`)
        ON DELETE CASCADE
    `);

    await queryRunner.query(`DROP INDEX \`IDX_cart_items_cart_id_is_removed\` ON \`cart_items\``);
    await queryRunner.query(`DROP INDEX \`IDX_cart_items_is_removed\` ON \`cart_items\``);
    await queryRunner.query(`ALTER TABLE \`cart_items\` DROP COLUMN \`is_removed\``);
  }
}