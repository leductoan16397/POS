import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeMoneyType1700391132825 implements MigrationInterface {
  name = 'ChangeMoneyType1700391132825';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" ALTER COLUMN "price" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" ALTER COLUMN "cost" TYPE  double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ALTER COLUMN "price" TYPE  double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ALTER COLUMN "cost" TYPE  double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ALTER COLUMN "cost" TYPE integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ALTER COLUMN "price" TYPE integer`,
    );

    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" ALTER COLUMN "cost" TYPE integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" ALTER COLUMN "price" TYPE integer`,
    );
  }
}
