import { randomUUID } from "node:crypto";
import type { MigrationInterface, QueryRunner } from "typeorm";
import { NEPAL_DISTRICTS } from "../data/nepal-districts.js";

export class InitialSchema1730000000000 implements MigrationInterface {
  name = "InitialSchema1730000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE districts (
        id varchar(36) NOT NULL,
        name varchar(100) NOT NULL,
        province varchar(100) NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_districts_name_province (name, province),
        KEY IDX_district_province (province)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE users (
        id varchar(36) NOT NULL,
        user_name varchar(100) NOT NULL,
        email varchar(255) NOT NULL,
        password_hash varchar(255) NOT NULL,
        \`role\` enum('CUSTOMER','VENDOR','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
        status enum('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
        phone varchar(20) NULL,
        profile_image_url varchar(500) NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_users_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE products (
        id varchar(36) NOT NULL,
        name varchar(255) NOT NULL,
        slug varchar(255) NULL,
        description text NULL,
        price decimal(12,2) NOT NULL,
        category varchar(100) NOT NULL,
        is_active tinyint(1) NOT NULL DEFAULT 1,
        image_url varchar(500) NULL,
        thumbnail_url varchar(500) NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_products_slug (slug),
        KEY IDX_products_category_is_active (category, is_active),
        CONSTRAINT CHK_product_price_non_negative CHECK (price >= 0)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE addresses (
        id varchar(36) NOT NULL,
        user_id varchar(36) NOT NULL,
        label varchar(50) NOT NULL DEFAULT 'Home',
        recipient_name varchar(100) NOT NULL,
        phone varchar(20) NOT NULL,
        line1 varchar(255) NOT NULL,
        line2 varchar(255) NULL,
        city varchar(100) NOT NULL,
        district_id varchar(36) NOT NULL,
        is_default tinyint(1) NOT NULL DEFAULT 0,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        KEY IDX_address_user_id (user_id),
        KEY IDX_address_district_id (district_id),
        CONSTRAINT FK_addresses_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT FK_addresses_district_id FOREIGN KEY (district_id) REFERENCES districts (id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE inventory (
        id varchar(36) NOT NULL,
        product_id varchar(36) NOT NULL,
        total_stock int unsigned NOT NULL DEFAULT 0,
        reserved_stock int unsigned NOT NULL DEFAULT 0,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_inventory_product_id (product_id),
        CONSTRAINT CHK_inventory_stock_valid CHECK (reserved_stock <= total_stock),
        CONSTRAINT FK_inventory_product_id FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE carts (
        id varchar(36) NOT NULL,
        user_id varchar(36) NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_carts_user_id (user_id),
        CONSTRAINT FK_carts_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE cart_items (
        id varchar(36) NOT NULL,
        cart_id varchar(36) NOT NULL,
        product_id varchar(36) NOT NULL,
        quantity int unsigned NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_cart_items_cart_product (cart_id, product_id),
        KEY IDX_cart_items_product_id (product_id),
        CONSTRAINT CHK_cart_item_quantity CHECK (quantity > 0),
        CONSTRAINT FK_cart_items_cart_id FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
        CONSTRAINT FK_cart_items_product_id FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE orders (
        id varchar(36) NOT NULL,
        user_id varchar(36) NOT NULL,
        status enum('PENDING','CONFIRMED','PARTIAL','FULFILLED','CANCELLED') NOT NULL DEFAULT 'PENDING',
        payment_method enum('COD','STRIPE') NOT NULL,
        payment_status enum('PENDING','COMPLETED','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
        subtotal decimal(12,2) NOT NULL,
        shipping_fee decimal(12,2) NOT NULL DEFAULT 0.00,
        total decimal(12,2) NOT NULL,
        shipping_address json NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        KEY IDX_order_user_id (user_id, created_at),
        KEY IDX_order_status (status),
        CONSTRAINT CHK_order_subtotal_non_negative CHECK (subtotal >= 0),
        CONSTRAINT CHK_order_shipping_fee_non_negative CHECK (shipping_fee >= 0),
        CONSTRAINT CHK_order_total_non_negative CHECK (total >= 0),
        CONSTRAINT FK_orders_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE order_items (
        id varchar(36) NOT NULL,
        order_id varchar(36) NOT NULL,
        product_id varchar(36) NOT NULL,
        quantity int unsigned NOT NULL,
        unit_price_at_purchase decimal(12,2) NOT NULL,
        product_name varchar(255) NOT NULL,
        product_image_url varchar(500) NULL,
        line_total decimal(12,2) NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        KEY IDX_order_items_order_id (order_id),
        KEY IDX_order_items_product_id (product_id),
        CONSTRAINT CHK_order_items_quantity_positive CHECK (quantity > 0),
        CONSTRAINT CHK_order_items_unit_price_non_negative CHECK (unit_price_at_purchase >= 0),
        CONSTRAINT CHK_order_items_line_total_non_negative CHECK (line_total >= 0),
        CONSTRAINT FK_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        CONSTRAINT FK_order_items_product_id FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE payments (
        id varchar(36) NOT NULL,
        order_id varchar(36) NOT NULL,
        amount decimal(12,2) NOT NULL,
        currency varchar(3) NOT NULL DEFAULT 'NPR',
        payment_provider enum('STRIPE','COD') NOT NULL,
        status enum('PENDING','COMPLETED','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
        transaction_id varchar(255) NULL,
        gateway_response text NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_payments_order_id (order_id),
        UNIQUE KEY UQ_payments_transaction_id (transaction_id),
        KEY IDX_payments_status (status),
        CONSTRAINT CHK_payment_amount_non_negative CHECK (amount >= 0),
        CONSTRAINT FK_payments_order_id FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE wishlist_items (
        id varchar(36) NOT NULL,
        user_id varchar(36) NOT NULL,
        product_id varchar(36) NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_wishlist_items_user_product (user_id, product_id),
        KEY IDX_wishlist_items_product_id (product_id),
        CONSTRAINT FK_wishlist_items_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT FK_wishlist_items_product_id FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE reviews (
        id varchar(36) NOT NULL,
        user_id varchar(36) NOT NULL,
        product_id varchar(36) NOT NULL,
        rating tinyint unsigned NOT NULL,
        \`comment\` text NULL,
        status enum('PUBLISHED','HIDDEN') NOT NULL DEFAULT 'PUBLISHED',
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_reviews_user_product (user_id, product_id),
        KEY IDX_reviews_product_status_created (product_id, status, created_at),
        CONSTRAINT CHK_reviews_rating_range CHECK (rating BETWEEN 1 AND 5),
        CONSTRAINT FK_reviews_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT FK_reviews_product_id FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    for (const district of NEPAL_DISTRICTS) {
      await queryRunner.query(
        "INSERT IGNORE INTO districts (id, name, province, created_at, updated_at) VALUES (?, ?, ?, NOW(6), NOW(6))",
        [randomUUID(), district.name, district.province],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS reviews");
    await queryRunner.query("DROP TABLE IF EXISTS wishlist_items");
    await queryRunner.query("DROP TABLE IF EXISTS payments");
    await queryRunner.query("DROP TABLE IF EXISTS order_items");
    await queryRunner.query("DROP TABLE IF EXISTS orders");
    await queryRunner.query("DROP TABLE IF EXISTS cart_items");
    await queryRunner.query("DROP TABLE IF EXISTS carts");
    await queryRunner.query("DROP TABLE IF EXISTS inventory");
    await queryRunner.query("DROP TABLE IF EXISTS products");
    await queryRunner.query("DROP TABLE IF EXISTS addresses");
    await queryRunner.query("DROP TABLE IF EXISTS users");
    await queryRunner.query("DROP TABLE IF EXISTS districts");
  }
}
