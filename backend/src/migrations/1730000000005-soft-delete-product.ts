import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteProduct1730000000005 implements MigrationInterface {
  name = 'SoftDeleteProduct1730000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`products\`
      ADD COLUMN \`is_removed\` BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await queryRunner.query(`
      UPDATE \`products\` SET \`is_removed\` = NOT \`is_active\`
    `);

    await queryRunner.query(`
      DROP INDEX \`IDX_products_category_is_active\` ON \`products\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`products\` DROP COLUMN \`is_active\`
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_products_category_is_removed\` ON \`products\` (\`category\`, \`is_removed\`)
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_products_is_removed\` ON \`products\` (\`is_removed\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_products_is_removed\` ON \`products\``);
    await queryRunner.query(`DROP INDEX \`IDX_products_category_is_removed\` ON \`products\``);
    await queryRunner.query(`
      ALTER TABLE \`products\`
      ADD COLUMN \`is_active\` TINYINT(1) NOT NULL DEFAULT 1
    `);
    await queryRunner.query(`
      UPDATE \`products\` SET \`is_active\` = NOT \`is_removed\`
    `);
    await queryRunner.query(`
      CREATE INDEX \`IDX_products_category_is_active\` ON \`products\` (\`category\`, \`is_active\`)
    `);
    await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`is_removed\``);
  }
}