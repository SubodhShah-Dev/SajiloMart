import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteUser1730000000004 implements MigrationInterface {
  name = 'SoftDeleteUser1730000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      ADD COLUMN \`is_removed\` BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_users_is_removed\` ON \`users\` (\`is_removed\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_users_is_removed\` ON \`users\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`is_removed\``);
  }
}