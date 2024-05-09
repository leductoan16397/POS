import { MigrationInterface, QueryRunner } from 'typeorm';

export class CustomersTable1700379114355 implements MigrationInterface {
  name = 'CustomersTable1700379114355';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "address" character varying, "city" character varying, "province" character varying, "postal_code" character varying, "country" character varying, "customer_code" character varying, "note" character varying, "points" integer DEFAULT '0', "visit_count" integer DEFAULT '0', "last_visit" TIMESTAMP, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."customers"`);
  }
}
