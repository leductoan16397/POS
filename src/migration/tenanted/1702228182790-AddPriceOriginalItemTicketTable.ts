import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriceOriginalItemTicketTable1702228182790 implements MigrationInterface {
  name = 'AddPriceOriginalItemTicketTable1702228182790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" ADD "price_original" double precision DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" DROP COLUMN "price_original"`,
    );
  }
}
