import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRefundRelation21702483954874 implements MigrationInterface {
  name = 'UpdateRefundRelation21702483954874';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_9caf371e0c63363d" FOREIGN KEY ("refunded_ticket_id") REFERENCES "${queryRunner.connection.driver.schema}"."tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP CONSTRAINT IF EXISTS "UQ_${queryRunner.connection.driver.schema}_9caf371e0c63363d"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
