import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteAddress1730000000007 implements MigrationInterface {
  name = 'SoftDeleteAddress1730000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`addresses\`
      ADD COLUMN \`is_removed\` BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_addresses_is_removed\` ON \`addresses\` (\`is_removed\`)
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_addresses_user_id_is_removed\` ON \`addresses\` (\`user_id\`, \`is_removed\`)
    `);

    await queryRunner.query(`
      ALTER TABLE \`addresses\` DROP FOREIGN KEY \`FK_addresses_user_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`addresses\`
      ADD CONSTRAINT \`FK_addresses_user_id\`
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
        ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`addresses\` DROP FOREIGN KEY \`FK_addresses_user_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`addresses\`
      ADD CONSTRAINT \`FK_addresses_user_id\`
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
        ON DELETE CASCADE
    `);

    await queryRunner.query(`DROP INDEX \`IDX_addresses_user_id_is_removed\` ON \`addresses\``);
    await queryRunner.query(`DROP INDEX \`IDX_addresses_is_removed\` ON \`addresses\``);
    await queryRunner.query(`ALTER TABLE \`addresses\` DROP COLUMN \`is_removed\``);
  }
}