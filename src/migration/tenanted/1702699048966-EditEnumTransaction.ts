import { MigrationInterface, QueryRunner } from 'typeorm';

export class EditEnumTransaction1702699048966 implements MigrationInterface {
  name = 'EditEnumTransaction1702699048966';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "${queryRunner.connection.driver.schema}"."transaction_histories_payment_status_enum" RENAME TO "transaction_histories_payment_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "${queryRunner.connection.driver.schema}"."transaction_histories_payment_status_enum" AS ENUM('SUCCESSFUL', 'CANCALLED', 'FAILED', 'PENDING')`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."transaction_histories" ALTER COLUMN "payment_status" TYPE "${queryRunner.connection.driver.schema}"."transaction_histories_payment_status_enum" USING "payment_status"::"text"::"${queryRunner.connection.driver.schema}"."transaction_histories_payment_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "${queryRunner.connection.driver.schema}"."transaction_histories_payment_status_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "${queryRunner.connection.driver.schema}"."transaction_histories_payment_status_enum_old" AS ENUM('SUCCESSFUL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."transaction_histories" ALTER COLUMN "payment_status" TYPE "${queryRunner.connection.driver.schema}"."transaction_histories_payment_status_enum_old" USING "payment_status"::"text"::"${queryRunner.connection.driver.schema}"."transaction_histories_payment_status_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "${queryRunner.connection.driver.schema}"."transaction_histories_payment_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "${queryRunner.connection.driver.schema}"."transaction_histories_payment_status_enum_old" RENAME TO "transaction_histories_payment_status_enum"`,
    );
  }
}
