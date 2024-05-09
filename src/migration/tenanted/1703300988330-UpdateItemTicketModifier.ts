import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateItemTicketModifier1703300988330 implements MigrationInterface {
  name = 'UpdateItemTicketModifier1703300988330';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_5246057b065ef2977087b993505"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" DROP COLUMN "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" DROP COLUMN "options"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" ADD "modifier_name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" ADD "option_name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" ADD "price" double precision NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" ADD CONSTRAINT "FK_5246057b065ef2977087b993505" FOREIGN KEY ("item_ticket_id") REFERENCES "${queryRunner.connection.driver.schema}"."item_tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" DROP CONSTRAINT "FK_5246057b065ef2977087b993505"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" DROP COLUMN "price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" DROP COLUMN "option_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" DROP COLUMN "modifier_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" ADD "options" jsonb NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_5246057b065ef2977087b993505" FOREIGN KEY ("item_ticket_id") REFERENCES "${queryRunner.connection.driver.schema}"."item_tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
