import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddNameColumnsToUsers1730000000017 implements MigrationInterface {
  name = "AddNameColumnsToUsers1730000000017";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      ADD COLUMN \`first_name\` varchar(50) NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`users\`
      ADD COLUMN \`last_name\` varchar(50) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`last_name\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`first_name\``);
  }
}
