import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteOrderItem1730000000012 implements MigrationInterface {
  name = 'SoftDeleteOrderItem1730000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`order_items\`
      ADD COLUMN \`is_removed\` BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_order_items_is_removed\` ON \`order_items\` (\`is_removed\`)
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_order_items_order_id_is_removed\` ON \`order_items\` (\`order_id\`, \`is_removed\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_order_items_order_id_is_removed\` ON \`order_items\``);
    await queryRunner.query(`DROP INDEX \`IDX_order_items_is_removed\` ON \`order_items\``);
    await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`is_removed\``);
  }
}