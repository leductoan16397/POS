import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateItemStock1699986316027 implements MigrationInterface {
  name = 'UpdateItemStock1699986316027';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" ADD "optimal_stock" integer`,
    );
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ADD "price" integer`);
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ADD "cost" integer`);
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ADD "sku_id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ADD "sku" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ADD "in_stock" integer`);
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ADD "low_stock" integer`);
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ADD "optimal_stock" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ADD "barcode" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" ALTER COLUMN "sku_id" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" DROP COLUMN "barcode"`);
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."items" DROP COLUMN "optimal_stock"`,
    );
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" DROP COLUMN "low_stock"`);
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" DROP COLUMN "in_stock"`);
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" DROP COLUMN "sku"`);
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" DROP COLUMN "sku_id"`);
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" DROP COLUMN "cost"`);
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" DROP COLUMN "price"`);

    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" DROP COLUMN "optimal_stock"`,
    );
  }
}
