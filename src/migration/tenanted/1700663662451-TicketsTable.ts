import { MigrationInterface, QueryRunner } from 'typeorm';

export class TicketsTable1700663662451 implements MigrationInterface {
  name = 'TicketsTable1700663662451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "${queryRunner.connection.driver.schema}"."item_tickets_item_type_enum" AS ENUM('ITEM', 'ITEM_VARIANT', 'DISCOUNT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."item_tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "item_id" character varying NOT NULL, "item_type" "${queryRunner.connection.driver.schema}"."item_tickets_item_type_enum" NOT NULL, "price" integer NOT NULL, "quantity" integer NOT NULL, "ticket_id" uuid, CONSTRAINT "PK_d335de3018a487820e36c61e2c5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_type_enum" AS ENUM('CASH', 'CARD')`,
    );
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."receipts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "total_price" integer NOT NULL, "payment_type" "${queryRunner.connection.driver.schema}"."receipts_payment_type_enum" NOT NULL, "email" character varying, "ticket_id" uuid NOT NULL, CONSTRAINT "PK_5e8182d7c29e023da6e1ff33bfe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "${queryRunner.connection.driver.schema}"."tickets_type_enum" AS ENUM('DINE_IN', 'TAKE_OUT', 'DELIVERY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying, "comment" character varying, "type" "${queryRunner.connection.driver.schema}"."tickets_type_enum" NOT NULL, "total_price" integer NOT NULL, "customer_id" uuid, "shift_id" uuid, CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_62cecc4975ea9273182ebae2454" FOREIGN KEY ("ticket_id") REFERENCES "${queryRunner.connection.driver.schema}"."tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."receipts" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_6a538855166540f1e461ddcd415" FOREIGN KEY ("ticket_id") REFERENCES "${queryRunner.connection.driver.schema}"."tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_42e4343476d9c4a46fb565a5c46" FOREIGN KEY ("customer_id") REFERENCES "${queryRunner.connection.driver.schema}"."customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_63ef40ed2f68e3ac59d0193a55f" FOREIGN KEY ("shift_id") REFERENCES "${queryRunner.connection.driver.schema}"."shifts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_63ef40ed2f68e3ac59d0193a55f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_42e4343476d9c4a46fb565a5c46"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."receipts" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_6a538855166540f1e461ddcd415"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_62cecc4975ea9273182ebae2454"`,
    );

    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."tickets"`);
    await queryRunner.query(`DROP TYPE "${queryRunner.connection.driver.schema}"."tickets_type_enum"`);
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."receipts"`);
    await queryRunner.query(`DROP TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_type_enum"`);
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."item_tickets"`);
    await queryRunner.query(`DROP TYPE "${queryRunner.connection.driver.schema}"."item_tickets_item_type_enum"`);
  }
}
