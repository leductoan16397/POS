import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaxToItemTickets1702134476495 implements MigrationInterface {
  name = 'AddTaxToItemTickets1702134476495';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" ADD "tax" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" DROP COLUMN "tax"`);
  }
}
