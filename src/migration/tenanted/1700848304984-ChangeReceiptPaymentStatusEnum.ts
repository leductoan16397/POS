import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeReceiptPaymentStatus1700848304984 implements MigrationInterface {
  name = 'ChangeReceiptPaymentStatus1700848304984';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum" RENAME TO "receipts_payment_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum" AS ENUM('WAITING', 'COMPLETED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."receipts" ALTER COLUMN "payment_status" TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum" USING "payment_status"::"text"::"${queryRunner.connection.driver.schema}"."receipts_payment_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum" RENAME TO "receipts_payment_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum" AS ENUM('WAITING', 'Completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."receipts" ALTER COLUMN "payment_status" TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum" USING "payment_status"::"text"::"${queryRunner.connection.driver.schema}"."receipts_payment_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum_old"`);
  }
}
