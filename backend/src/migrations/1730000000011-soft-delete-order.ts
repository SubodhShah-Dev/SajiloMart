import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteOrder1730000000011 implements MigrationInterface {
  name = 'SoftDeleteOrder1730000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`orders\`
      ADD COLUMN \`is_removed\` BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_orders_is_removed\` ON \`orders\` (\`is_removed\`)
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_orders_user_id_is_removed\` ON \`orders\` (\`user_id\`, \`is_removed\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_orders_user_id_is_removed\` ON \`orders\``);
    await queryRunner.query(`DROP INDEX \`IDX_orders_is_removed\` ON \`orders\``);
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`is_removed\``);
  }
}