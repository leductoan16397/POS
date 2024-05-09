import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTransaction1702690619383 implements MigrationInterface {
  name = 'UpdateTransaction1702690619383';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."transaction_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "transation_code" character varying NOT NULL, "amount" integer NOT NULL, "deleted_at" TIMESTAMP, "receipt_id" uuid, CONSTRAINT "REL_e862c5f3128f3041813083ad53" UNIQUE ("receipt_id"), CONSTRAINT "PK_20a6530a95a39f16f2fc90efdfc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum" RENAME TO "receipts_payment_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum" AS ENUM('PENDING', 'WAITING', 'COMPLETED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."receipts" ALTER COLUMN "payment_status" TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum" USING "payment_status"::"text"::"${queryRunner.connection.driver.schema}"."receipts_payment_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "${queryRunner.connection.driver.schema}"."tickets_payment_status_enum" RENAME TO "tickets_payment_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "${queryRunner.connection.driver.schema}"."tickets_payment_status_enum" AS ENUM('PENDING', 'WAITING', 'COMPLETED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ALTER COLUMN "payment_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ALTER COLUMN "payment_status" TYPE "${queryRunner.connection.driver.schema}"."tickets_payment_status_enum" USING "payment_status"::"text"::"${queryRunner.connection.driver.schema}"."tickets_payment_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ALTER COLUMN "payment_status" SET DEFAULT 'WAITING'`,
    );
    await queryRunner.query(`DROP TYPE "${queryRunner.connection.driver.schema}"."tickets_payment_status_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."transaction_histories" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_e862c5f3128f3041813083ad53d" FOREIGN KEY ("receipt_id") REFERENCES "${queryRunner.connection.driver.schema}"."receipts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."transaction_histories" DROP CONSTRAINT "FK_e862c5f3128f3041813083ad53d"`,
    );
    await queryRunner.query(
      `CREATE TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum_old" AS ENUM('WAITING', 'COMPLETED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."receipts" ALTER COLUMN "payment_status" TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum_old" USING "payment_status"::"text"::"${queryRunner.connection.driver.schema}"."receipts_payment_status_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum_old" RENAME TO "receipts_payment_status_enum"`,
    );
  }
}
