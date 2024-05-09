import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefundQuantityColumn1700906027442 implements MigrationInterface {
  name = 'RefundQuantityColumn1700906027442';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" ADD "refunded_quantity" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" DROP COLUMN "refunded_quantity"`,
    );
  }
}
