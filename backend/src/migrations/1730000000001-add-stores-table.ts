import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddStoresTable1730000000001 implements MigrationInterface {
  name = "AddStoresTable1730000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE stores (
        id varchar(36) NOT NULL,
        owner_id varchar(36) NOT NULL,
        name varchar(150) NOT NULL,
        slug varchar(180) NULL,
        description text NULL,
        logo_url varchar(500) NULL,
        \`status\` enum('PENDING','APPROVED','SUSPENDED') NOT NULL DEFAULT 'PENDING',
        is_removed tinyint(1) NOT NULL DEFAULT 0,
        deleted_at datetime(6) NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_stores_owner_id (owner_id),
        UNIQUE KEY UQ_stores_slug (slug),
        KEY IDX_stores_status (\`status\`),
        KEY IDX_stores_is_removed (is_removed),
        CONSTRAINT FK_stores_owner_id FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      ALTER TABLE \`products\`
      ADD COLUMN \`store_id\` varchar(36) NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`products\`
      ADD CONSTRAINT FK_products_store_id FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_products_store_id ON \`products\` (\`store_id\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IDX_products_store_id ON \`products\``);
    await queryRunner.query(`ALTER TABLE \`products\` DROP FOREIGN KEY FK_products_store_id`);
    await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`store_id\``);
    await queryRunner.query("DROP TABLE IF EXISTS stores");
  }
}
