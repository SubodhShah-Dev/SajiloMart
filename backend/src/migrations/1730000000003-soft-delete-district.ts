import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteDistrict1730000000003 implements MigrationInterface {
  name = 'SoftDeleteDistrict1730000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`districts\`
      ADD COLUMN \`is_removed\` BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_districts_is_removed\` ON \`districts\` (\`is_removed\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_districts_is_removed\` ON \`districts\``);
    await queryRunner.query(`ALTER TABLE \`districts\` DROP COLUMN \`is_removed\``);
  }
}