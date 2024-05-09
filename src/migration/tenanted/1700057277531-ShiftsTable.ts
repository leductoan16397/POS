import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShiftsTable1700057277531 implements MigrationInterface {
  name = 'ShiftsTable1700057277531';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."shifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "opened_at" TIMESTAMP NOT NULL DEFAULT now(), "closed_at" TIMESTAMP, "initial_cash" integer DEFAULT 0, "total_payin" integer DEFAULT 0, "total_payout" integer DEFAULT 0, "total_cash" integer DEFAULT 0, "total_refund" integer DEFAULT 0, "toal_card" integer DEFAULT 0, "total_discount" integer DEFAULT 0, "actual_cash" integer DEFAULT 0, "user_id" uuid, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_84d692e367e4d6cdf045828768c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_dc1e84f1d1e75e990952c40859c" FOREIGN KEY ("user_id") REFERENCES "${queryRunner.connection.driver.schema}"."tenant_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_dc1e84f1d1e75e990952c40859c"`,
    );
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."shifts"`);
  }
}
