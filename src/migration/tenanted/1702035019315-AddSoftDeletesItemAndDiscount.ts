import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeletesItemAndDiscount1702035019315 implements MigrationInterface {
  name = 'AddSoftDeletesItemAndDiscount1702035019315';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discounts" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ADD "deleted_at" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discounts" DROP COLUMN "deleted_at"`,
    );
  }
}
