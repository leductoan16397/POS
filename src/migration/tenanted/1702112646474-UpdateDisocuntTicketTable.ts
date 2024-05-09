import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDisocuntTicketTable1702112646474 implements MigrationInterface {
  name = 'UpdateDisocuntTicketTable1702112646474';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_tickets" ADD "discount_name" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_tickets" DROP COLUMN "discount_name"`,
    );
  }
}
