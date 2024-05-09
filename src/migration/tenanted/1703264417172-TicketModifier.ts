import { MigrationInterface, QueryRunner } from 'typeorm';

export class TicketModifier1703264417172 implements MigrationInterface {
  name = 'TicketModifier1703264417172';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "modifier_id" character varying NOT NULL, "name" character varying NOT NULL, "options" jsonb NOT NULL, "item_ticket_id" uuid, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_9682d398fd7b9e2bb9bbcdf31bb" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_5246057b065ef2977087b993505" FOREIGN KEY ("item_ticket_id") REFERENCES "tenant_ex"."item_tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_5246057b065ef2977087b993505"`,
    );

    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."item_ticket_modifiers"`);
  }
}
