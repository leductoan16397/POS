import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateGroup21700844292073 implements MigrationInterface {
  name = 'UpdateGroup21700844292073';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "${queryRunner.connection.driver.schema}"."tenant_user_groups" SET assign_able = false WHERE name ='Owner'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "${queryRunner.connection.driver.schema}"."tenant_user_groups" SET assign_able = true WHERE name ='Owner'`,
    );
  }
}
