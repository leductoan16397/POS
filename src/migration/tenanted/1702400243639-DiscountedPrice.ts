import { MigrationInterface, QueryRunner } from 'typeorm';

export class DiscountedPrice1702400243639 implements MigrationInterface {
  name = 'DiscountedPrice1702400243639';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" RENAME COLUMN "price" TO "discounted_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" RENAME COLUMN "price_original" TO "price"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" RENAME COLUMN "price" TO "price_original"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" RENAME COLUMN "discounted_price" TO "price"`,
    );
  }
}
