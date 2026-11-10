import type { MigrationInterface, QueryRunner } from "typeorm";

export class StoreSelfServe1730000021 implements MigrationInterface {
  name = "StoreSelfServe1730000021";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to stores table
    await queryRunner.query(`
      ALTER TABLE \`stores\`
      ADD COLUMN \`phone\` varchar(20) NULL,
      ADD COLUMN \`category\` varchar(100) NULL,
      ADD COLUMN \`return_policy\` text NULL,
      ADD COLUMN \`shipping_policy\` text NULL,
      ADD COLUMN \`verification_status\` enum('UNVERIFIED','PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'UNVERIFIED',
      ADD COLUMN \`listing_limit\` int NULL,
      ADD COLUMN \`verification_requested_at\` datetime(6) NULL,
      ADD COLUMN \`verified_at\` datetime(6) NULL,
      ADD COLUMN \`verified_by\` varchar(36) NULL,
      ADD COLUMN \`suspension_reason\` varchar(500) NULL,
      ADD COLUMN \`suspended_at\` datetime(6) NULL
    `);

    // Add foreign key for verified_by
    await queryRunner.query(`
      ALTER TABLE \`stores\`
      ADD CONSTRAINT \`FK_stores_verified_by\` FOREIGN KEY (\`verified_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
    `);

    // Add indexes
    await queryRunner.query(`
      CREATE INDEX \`IDX_stores_verification_status\` ON \`stores\` (\`verification_status\`)
    `);

    // Backfill existing rows: verification_status='VERIFIED', listing_limit=NULL
    await queryRunner.query(`
      UPDATE \`stores\` SET \`verification_status\` = 'VERIFIED', \`listing_limit\` = NULL WHERE \`verification_status\` = 'UNVERIFIED'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.query(`
      ALTER TABLE \`stores\` DROP FOREIGN KEY \`FK_stores_verified_by\`
    `);

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX \`IDX_stores_verification_status\` ON \`stores\`
    `);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE \`stores\`
      DROP COLUMN \`phone\`,
      DROP COLUMN \`category\`,
      DROP COLUMN \`return_policy\`,
      DROP COLUMN \`shipping_policy\`,
      DROP COLUMN \`verification_status\`,
      DROP COLUMN \`listing_limit\`,
      DROP COLUMN \`verification_requested_at\`,
      DROP COLUMN \`verified_at\`,
      DROP COLUMN \`verified_by\`,
      DROP COLUMN \`suspension_reason\`,
      DROP COLUMN \`suspended_at\`
    `);
  }
}