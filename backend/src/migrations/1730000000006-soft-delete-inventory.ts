import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteInventory1730000000006 implements MigrationInterface {
  name = 'SoftDeleteInventory1730000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`inventory\`
      ADD COLUMN \`is_removed\` BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_inventory_is_removed\` ON \`inventory\` (\`is_removed\`)
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_inventory_product_id_is_removed\` ON \`inventory\` (\`product_id\`, \`is_removed\`)
    `);

    await queryRunner.query(`
      ALTER TABLE \`inventory\` DROP FOREIGN KEY \`FK_inventory_product_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`inventory\`
      ADD CONSTRAINT \`FK_inventory_product_id\`
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`)
        ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`inventory\` DROP FOREIGN KEY \`FK_inventory_product_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`inventory\`
      ADD CONSTRAINT \`FK_inventory_product_id\`
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`)
        ON DELETE CASCADE
    `);

    await queryRunner.query(`DROP INDEX \`IDX_inventory_product_id_is_removed\` ON \`inventory\``);
    await queryRunner.query(`DROP INDEX \`IDX_inventory_is_removed\` ON \`inventory\``);
    await queryRunner.query(`ALTER TABLE \`inventory\` DROP COLUMN \`is_removed\``);
  }
}