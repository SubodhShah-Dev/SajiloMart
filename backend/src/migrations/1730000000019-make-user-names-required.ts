import type { MigrationInterface, QueryRunner } from "typeorm";

export class MakeUserNamesRequired1730000000019 implements MigrationInterface {
  name = "MakeUserNamesRequired1730000000019";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE \`users\`
      SET \`first_name\` = COALESCE(
        NULLIF(\`first_name\`, ''),
        NULLIF(SUBSTRING_INDEX(\`user_name\`, ' ', 1), ''),
        'User'
      )
      WHERE \`first_name\` IS NULL OR \`first_name\` = ''
    `);

    await queryRunner.query(`
      UPDATE \`users\`
      SET \`last_name\` = ''
      WHERE \`last_name\` IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`users\`
      MODIFY COLUMN \`first_name\` varchar(50) NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`users\`
      MODIFY COLUMN \`last_name\` varchar(50) NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      MODIFY COLUMN \`last_name\` varchar(50) NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`users\`
      MODIFY COLUMN \`first_name\` varchar(50) NULL
    `);
  }
}
