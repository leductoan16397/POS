import { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteCategory1702035863086 implements MigrationInterface {
  name = 'SoftDeleteCategory1702035863086';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."categories" ADD "deleted_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."categories" DROP COLUMN "deleted_at"`,
    );
  }
}
