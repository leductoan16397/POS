import { MigrationInterface, QueryRunner } from 'typeorm';

export class StockAndSkuItemVariantTable1699976732371 implements MigrationInterface {
  name = 'StockAndSkuItemVariantTable1699976732371';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" ADD "in_stock" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" ADD "low_stock" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" ADD "sku_id" serial`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" DROP COLUMN "in_stock"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" DROP COLUMN "low_stock"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" DROP COLUMN "sku_id"`,
    );
  }
}
