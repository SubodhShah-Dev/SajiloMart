import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeletePayment1730000000013 implements MigrationInterface {
  name = 'SoftDeletePayment1730000000013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`payments\`
      ADD COLUMN \`is_removed\` BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_payments_is_removed\` ON \`payments\` (\`is_removed\`)
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_payments_order_id_is_removed\` ON \`payments\` (\`order_id\`, \`is_removed\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_payments_order_id_is_removed\` ON \`payments\``);
    await queryRunner.query(`DROP INDEX \`IDX_payments_is_removed\` ON \`payments\``);
    await queryRunner.query(`ALTER TABLE \`payments\` DROP COLUMN \`is_removed\``);
  }
}