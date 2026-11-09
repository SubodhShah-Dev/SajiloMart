import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteReview1730000000014 implements MigrationInterface {
  name = 'SoftDeleteReview1730000000014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`reviews\`
      ADD COLUMN \`is_removed\` BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_reviews_is_removed\` ON \`reviews\` (\`is_removed\`)
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_reviews_product_id_is_removed\` ON \`reviews\` (\`product_id\`, \`is_removed\`)
    `);

    await queryRunner.query(`
      ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_reviews_user_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`reviews\`
      ADD CONSTRAINT \`FK_reviews_user_id\`
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
        ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_reviews_product_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`reviews\`
      ADD CONSTRAINT \`FK_reviews_product_id\`
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`)
        ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_reviews_product_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`reviews\`
      ADD CONSTRAINT \`FK_reviews_product_id\`
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`)
        ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_reviews_user_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`reviews\`
      ADD CONSTRAINT \`FK_reviews_user_id\`
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
        ON DELETE CASCADE
    `);

    await queryRunner.query(`DROP INDEX \`IDX_reviews_product_id_is_removed\` ON \`reviews\``);
    await queryRunner.query(`DROP INDEX \`IDX_reviews_is_removed\` ON \`reviews\``);
    await queryRunner.query(`ALTER TABLE \`reviews\` DROP COLUMN \`is_removed\``);
  }
}