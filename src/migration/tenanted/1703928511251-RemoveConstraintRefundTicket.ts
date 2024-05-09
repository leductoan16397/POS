import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveConstraintRefundTicket1703928511251 implements MigrationInterface {
  name = 'RemoveConstraintRefundTicket1703928511251';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP CONSTRAINT IF EXISTS "UQ_${queryRunner.connection.driver.schema}_9caf371e0c63363df5d7242c35f"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
