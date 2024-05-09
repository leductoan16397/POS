import { MigrationInterface, QueryRunner } from 'typeorm';

export class DifferentAmountColumnReceiptsTable1701585151630 implements MigrationInterface {
  name = 'DifferentAmountColumnReceiptsTable1701585151630';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."receipts" ADD "different_amount" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."receipts" DROP COLUMN "different_amount"`,
    );
  }
}
