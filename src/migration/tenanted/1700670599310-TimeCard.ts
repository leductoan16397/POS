import { MigrationInterface, QueryRunner } from 'typeorm';

export class TimeCard1700670599310 implements MigrationInterface {
  name = 'TimeCard1700670599310';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."timecards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "clock_in" TIMESTAMP NOT NULL, "clock_out" TIMESTAMP NOT NULL, "time" numeric NOT NULL, "employee_id" uuid, "store_id" uuid, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_98f8fb8cea2c8a8be0b08a98d5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ADD "track_stock" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" ADD "name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" ADD "email" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" ADD CONSTRAINT "UQ_${queryRunner.connection.driver.schema}_fae37b5b2b62cbce0f173e77bd1" UNIQUE ("email")`,
    );

    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecards" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_bd0e74ee9156ae25bbe770bbfae" FOREIGN KEY ("employee_id") REFERENCES "${queryRunner.connection.driver.schema}"."tenant_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecards" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_2567a80332af6e9aa4f10035f39" FOREIGN KEY ("store_id") REFERENCES "${queryRunner.connection.driver.schema}"."stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecards" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_2567a80332af6e9aa4f10035f39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecards" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_bd0e74ee9156ae25bbe770bbfae"`,
    );

    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" DROP CONSTRAINT "UQ_${queryRunner.connection.driver.schema}_fae37b5b2b62cbce0f173e77bd1"`,
    );
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" DROP COLUMN "email"`);
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" DROP COLUMN "track_stock"`);
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."timecards"`);
  }
}
