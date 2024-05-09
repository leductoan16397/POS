import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefundTicket1700892149496 implements MigrationInterface {
  name = 'RefundTicket1700892149496';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "${queryRunner.connection.driver.schema}"."tickets_ticket_type_enum" AS ENUM('ORDER', 'REFUND')`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ADD "ticket_type" "${queryRunner.connection.driver.schema}"."tickets_ticket_type_enum" NOT NULL DEFAULT 'ORDER'`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ADD "ticket_number" SERIAL`,
    );
    await queryRunner.query(
      `CREATE TYPE "${queryRunner.connection.driver.schema}"."tickets_payment_status_enum" AS ENUM('WAITING', 'COMPLETED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ADD "payment_status" "${queryRunner.connection.driver.schema}"."tickets_payment_status_enum" NOT NULL DEFAULT 'WAITING'`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ADD "email" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ADD "refunded_ticket_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ADD CONSTRAINT "UQ_${queryRunner.connection.driver.schema}_9caf371e0c63363df5d7242c35f" UNIQUE ("refunded_ticket_id")`,
    );
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ADD "user_id" uuid`);

    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_9caf371e0c63363df5d7242c35f" FOREIGN KEY ("refunded_ticket_id") REFERENCES "${queryRunner.connection.driver.schema}"."tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_2e445270177206a97921e461710" FOREIGN KEY ("user_id") REFERENCES "${queryRunner.connection.driver.schema}"."tenant_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_2e445270177206a97921e461710"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_9caf371e0c63363df5d7242c35f"`,
    );

    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP CONSTRAINT "UQ_${queryRunner.connection.driver.schema}_9caf371e0c63363df5d7242c35f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP COLUMN "refunded_ticket_id"`,
    );
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP COLUMN "email"`);
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP COLUMN "payment_status"`,
    );
    await queryRunner.query(`DROP TYPE "${queryRunner.connection.driver.schema}"."tickets_payment_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP COLUMN "ticket_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tickets" DROP COLUMN "ticket_type"`,
    );
    await queryRunner.query(`DROP TYPE "${queryRunner.connection.driver.schema}"."tickets_ticket_type_enum"`);
  }
}
