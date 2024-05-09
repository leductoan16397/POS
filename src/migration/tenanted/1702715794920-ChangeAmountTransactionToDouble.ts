import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAmountTransactionToDouble1702715794920 implements MigrationInterface {
  name = 'ChangeAmountTransactionToDouble1702715794920';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."transaction_histories" ALTER COLUMN "amount" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."transaction_histories" ALTER COLUMN "vat_amount" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."transaction_histories" ALTER COLUMN "tip_amount" TYPE double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
