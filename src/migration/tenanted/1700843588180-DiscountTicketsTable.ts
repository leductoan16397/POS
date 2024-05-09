import { MigrationInterface, QueryRunner } from 'typeorm';

export class DiscountTicketsTable1700843588180 implements MigrationInterface {
  name = 'DiscountTicketsTable1700843588180';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."discount_tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "discount_type" character varying NOT NULL, "value" integer NOT NULL, "discount_id" uuid, "ticket_id" uuid, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_5cf7595652758200f26e2fbd456" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ADD "total_discount" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_tickets" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_6610d2d9c622be4ce7b8799cd01" FOREIGN KEY ("ticket_id") REFERENCES "${queryRunner.connection.driver.schema}"."tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_tickets" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_6610d2d9c622be4ce7b8799cd01"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_tickets" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_48bfe86e52ba7868862938223c7"`,
    );

    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP COLUMN "total_discount"`,
    );
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."discount_tickets"`);
  }
}
