import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1699200752161 implements MigrationInterface {
  name = 'Init1699200752161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."item_variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "price" integer, "cost" integer, "sku" character varying, "barcode" character varying, "options" jsonb NOT NULL, "stores" jsonb NOT NULL, "item_id" uuid NOT NULL, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_d5896ae5b95e6b60d50c6bbe61e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "${queryRunner.connection.driver.schema}"."items_sold_by_enum" AS ENUM('EACH', 'VOLUME')`,
    );
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying, "sold_by" "${queryRunner.connection.driver.schema}"."items_sold_by_enum" NOT NULL, "show_type" character varying NOT NULL DEFAULT 'COLOR_ICON', "image" character varying, "color" character varying, "icon" character varying, "options" character varying array NOT NULL, "category_id" uuid, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "color" character varying NOT NULL, "created_by" character varying NOT NULL, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."stores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying NOT NULL, "phone" character varying NOT NULL, "address" character varying NOT NULL, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_7aa6e7d71fa7acdd7ca43d7c9cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."discounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "code" character varying NOT NULL, "value" integer NOT NULL, "type" character varying NOT NULL, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_66c522004212dc814d6e2f14ecc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."tenant_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" character varying NOT NULL, "role" character varying NOT NULL, "delete_able" boolean NOT NULL DEFAULT true, "group_id" uuid, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_8ce1bc9e3a5887c234900365447" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."tenant_user_groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "delete_able" boolean NOT NULL DEFAULT true, "update_able" boolean NOT NULL DEFAULT true, "pos_access_able" boolean NOT NULL DEFAULT true, "back_office_access_able" boolean NOT NULL DEFAULT true, "pos_permissions" character varying array NOT NULL DEFAULT '{}', "back_office_permissions" character varying array NOT NULL DEFAULT '{}', CONSTRAINT "PK_${queryRunner.connection.driver.schema}_ea7c0adefc04ee9826b31d7d8f1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."discount_store" ("discount_id" uuid NOT NULL, "store_id" uuid NOT NULL, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_109777200d83e069a4e24f9cafb" PRIMARY KEY ("discount_id", "store_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_${queryRunner.connection.driver.schema}_d0da52903c7079422adb145174" ON "${queryRunner.connection.driver.schema}"."discount_store" ("discount_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_${queryRunner.connection.driver.schema}_f9ffa384babe71a82e8e9ee642" ON "${queryRunner.connection.driver.schema}"."discount_store" ("store_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_db3582a34eaa7af952d12648981" FOREIGN KEY ("item_id") REFERENCES "${queryRunner.connection.driver.schema}"."items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_0c4aa809ddf5b0c6ca45d8a8e80" FOREIGN KEY ("category_id") REFERENCES "${queryRunner.connection.driver.schema}"."categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_d19dfbe58b7a27e28f113b23f49" FOREIGN KEY ("group_id") REFERENCES "${queryRunner.connection.driver.schema}"."tenant_user_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_store" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_d0da52903c7079422adb145174c" FOREIGN KEY ("discount_id") REFERENCES "${queryRunner.connection.driver.schema}"."discounts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_store" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_f9ffa384babe71a82e8e9ee6422" FOREIGN KEY ("store_id") REFERENCES "${queryRunner.connection.driver.schema}"."stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_store" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_f9ffa384babe71a82e8e9ee6422"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_store" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_d0da52903c7079422adb145174c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_d19dfbe58b7a27e28f113b23f49"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."items" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_0c4aa809ddf5b0c6ca45d8a8e80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_db3582a34eaa7af952d12648981"`,
    );
    await queryRunner.query(
      `DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_${queryRunner.connection.driver.schema}_f9ffa384babe71a82e8e9ee642"`,
    );
    await queryRunner.query(
      `DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_${queryRunner.connection.driver.schema}_d0da52903c7079422adb145174"`,
    );
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."discount_store"`);
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."tenant_user_groups"`);
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."tenant_users"`);
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."discounts"`);
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."stores"`);
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."categories"`);
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."items"`);
    await queryRunner.query(`DROP TYPE "${queryRunner.connection.driver.schema}"."items_sold_by_enum"`);
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."item_variants"`);
  }
}
