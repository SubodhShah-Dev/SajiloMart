import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteRefreshSession1730000000015 implements MigrationInterface {
  name = 'SoftDeleteRefreshSession1730000000015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`refresh_sessions\`
      ADD COLUMN \`is_removed\` BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_refresh_sessions_is_removed\` ON \`refresh_sessions\` (\`is_removed\`)
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_refresh_sessions_user_id_is_removed\` ON \`refresh_sessions\` (\`user_id\`, \`is_removed\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_refresh_sessions_user_id_is_removed\` ON \`refresh_sessions\``);
    await queryRunner.query(`DROP INDEX \`IDX_refresh_sessions_is_removed\` ON \`refresh_sessions\``);
    await queryRunner.query(`ALTER TABLE \`refresh_sessions\` DROP COLUMN \`is_removed\``);
  }
}