import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateGroup1700842838953 implements MigrationInterface {
  name = 'UpdateGroup1700842838953';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_user_groups" ADD "assign_able" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_user_groups" DROP COLUMN "assign_able"`,
    );
  }
}
