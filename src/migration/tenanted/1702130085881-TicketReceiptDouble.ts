import { MigrationInterface, QueryRunner } from 'typeorm';

export class TicketReceiptDouble1702130085881 implements MigrationInterface {
  name = 'TicketReceiptDouble1702130085881';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ADD "total_price_original" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_tickets" ALTER COLUMN "value" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" ALTER COLUMN "price" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."receipts" ALTER COLUMN "total_price" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."receipts" ALTER COLUMN "different_amount" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ALTER COLUMN "total_price" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ALTER COLUMN "total_discount" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ALTER COLUMN "total_discount" TYPE double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
