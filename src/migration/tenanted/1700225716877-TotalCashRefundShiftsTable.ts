import { MigrationInterface, QueryRunner } from 'typeorm';

export class TotalCashRefundShiftsTable1700225716877 implements MigrationInterface {
  name = 'TotalCashRefundShiftsTable1700225716877';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" DROP COLUMN "total_refund"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" ADD "total_cash_refund" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" DROP COLUMN "total_cash_refund"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" ADD "total_refund" integer DEFAULT '0'`,
    );
  }
}
