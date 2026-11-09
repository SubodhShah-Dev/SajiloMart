import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteCart1730000000008 implements MigrationInterface {
  name = 'SoftDeleteCart1730000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`carts\`
      ADD COLUMN \`is_removed\` BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_carts_is_removed\` ON \`carts\` (\`is_removed\`)
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_carts_user_id_is_removed\` ON \`carts\` (\`user_id\`, \`is_removed\`)
    `);

    await queryRunner.query(`
      ALTER TABLE \`carts\` DROP FOREIGN KEY \`FK_carts_user_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`carts\`
      ADD CONSTRAINT \`FK_carts_user_id\`
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
        ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`carts\` DROP FOREIGN KEY \`FK_carts_user_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`carts\`
      ADD CONSTRAINT \`FK_carts_user_id\`
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
        ON DELETE CASCADE
    `);

    await queryRunner.query(`DROP INDEX \`IDX_carts_user_id_is_removed\` ON \`carts\``);
    await queryRunner.query(`DROP INDEX \`IDX_carts_is_removed\` ON \`carts\``);
    await queryRunner.query(`ALTER TABLE \`carts\` DROP COLUMN \`is_removed\``);
  }
}