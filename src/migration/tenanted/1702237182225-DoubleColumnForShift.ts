import { MigrationInterface, QueryRunner } from 'typeorm';

export class DoubleColumnForShift1702237182225 implements MigrationInterface {
  name = 'DoubleColumnForShift1702237182225';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" ALTER COLUMN "initial_cash" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" ALTER COLUMN "total_payin" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" ALTER COLUMN "total_payout" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" ALTER COLUMN "total_cash" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" ALTER COLUMN "total_cash_refund" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" ALTER COLUMN "total_card" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" ALTER COLUMN "total_discount" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" ALTER COLUMN "actual_cash" TYPE double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
