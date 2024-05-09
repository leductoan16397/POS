import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTotalTaxTicketTable1702232976569 implements MigrationInterface {
  name = 'AddTotalTaxTicketTable1702232976569';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ADD "total_tax_amount" double precision DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP COLUMN "total_tax_amount"`,
    );
  }
}
