import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRefundRelation1702483384871 implements MigrationInterface {
  name = 'UpdateRefundRelation1702483384871';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_9caf371e0c63363df5d7242c35f"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
