import { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteUser1702305344761 implements MigrationInterface {
  name = 'SoftDeleteUser1702305344761';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" ADD "deleted_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" DROP COLUMN "deleted_at"`,
    );
  }
}
