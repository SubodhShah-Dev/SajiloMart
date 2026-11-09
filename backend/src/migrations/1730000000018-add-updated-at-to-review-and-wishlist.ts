import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddUpdatedAtToReviewAndWishlist1730000000018
  implements MigrationInterface
{
  name = "AddUpdatedAtToReviewAndWishlist1730000000018";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`wishlist_items\`
      ADD COLUMN \`updated_at\` datetime(6) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
    `);

    await queryRunner.query(`
      ALTER TABLE \`reviews\`
      ADD COLUMN \`updated_at\` datetime(6) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`reviews\` DROP COLUMN \`updated_at\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`wishlist_items\` DROP COLUMN \`updated_at\`
    `);
  }
}
