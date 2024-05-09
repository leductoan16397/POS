import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateItemDiscountTicket1702108683305 implements MigrationInterface {
  name = 'UpdateItemDiscountTicket1702108683305';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_tickets" ADD "code" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" ADD "item_name" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" ADD "options" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" DROP COLUMN "options"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_tickets" DROP COLUMN "item_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_tickets" DROP COLUMN "code"`,
    );
  }
}
