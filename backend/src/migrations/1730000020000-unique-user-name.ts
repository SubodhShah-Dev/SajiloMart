import type { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueUserName1730000020000 implements MigrationInterface {
  name = "UniqueUserName1730000020000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Normalize existing user_name values
    await queryRunner.query(
      `UPDATE \`users\` SET \`user_name\` = LOWER(TRIM(\`user_name\`)) WHERE \`user_name\` IS NOT NULL AND \`user_name\` != ''`,
    );

    // Fill empty user_name from email local part
    await queryRunner.query(
      `UPDATE \`users\` SET \`user_name\` = LOWER(REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(\`email\`, '@', 1), '.', '_'), '-', '_'), ' ', '_')) WHERE \`user_name\` IS NULL OR \`user_name\` = ''`,
    );

    // Truncate to 30 chars and ensure valid characters (replace non-alphanumeric/underscore with _)
    await queryRunner.query(
      `UPDATE \`users\` SET \`user_name\` = SUBSTRING(REPLACE(REPLACE(REPLACE(\`user_name\`, '.', '_'), '-', '_'), ' ', '_'), 1, 30)`,
    );

    // Ensure it starts with a letter
    await queryRunner.query(
      `UPDATE \`users\` SET \`user_name\` = CONCAT('user', \`user_name\`) WHERE \`user_name\` REGEXP '^[^a-z]'`,
    );

    // De-duplicate: order by created_at, id and append numeric suffixes
    await queryRunner.query(`SET @rownum = 0`);
    await queryRunner.query(`SET @prev = ''`);

    await queryRunner.query(
      `UPDATE \`users\` u JOIN (SELECT id, user_name, @rownum := IF(@prev = user_name, @rownum + 1, 1) AS suffix, @prev := user_name FROM \`users\` ORDER BY user_name, created_at, id) t ON u.id = t.id SET u.user_name = CASE WHEN t.suffix = 1 THEN t.user_name ELSE CONCAT(SUBSTRING(t.user_name, 1, 30 - LENGTH(t.suffix)), t.suffix) END WHERE t.suffix > 1`,
    );

    // Add unique index
    await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE KEY \`UQ_users_user_name\` (\`user_name\`)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the unique index only
    await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`UQ_users_user_name\``);
  }
}