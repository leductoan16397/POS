import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStatusReceiptsTable1700830727095 implements MigrationInterface {
  name = 'UpdateStatusReceiptsTable1700830727095';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum" AS ENUM('WAITING', 'Completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."receipts" ADD "payment_status" "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."receipts" DROP COLUMN "payment_status"`,
    );
    await queryRunner.query(`DROP TYPE "${queryRunner.connection.driver.schema}"."receipts_payment_status_enum"`);
  }
}
