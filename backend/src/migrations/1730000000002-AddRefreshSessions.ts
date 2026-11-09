import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshSessions1730000000002 implements MigrationInterface {
  name = "AddRefreshSessions1730000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE refresh_sessions (
        id varchar(36) NOT NULL,
        user_id varchar(36) NOT NULL,
        token_hash char(64) NOT NULL,
        expires_at datetime(6) NOT NULL,
        revoked_at datetime(6) NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_refresh_sessions_token_hash (token_hash),
        KEY IDX_refresh_sessions_user_id (user_id),
        CONSTRAINT FK_refresh_sessions_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS refresh_sessions");
  }
}
