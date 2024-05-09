import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnTransaction1702694275909 implements MigrationInterface {
  name = 'AddColumnTransaction1702694275909';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."transaction_histories" RENAME COLUMN "transation_code" TO "transaction_code"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."transaction_histories" RENAME COLUMN "transaction_code" TO "transation_code"`,
    );
  }
}
