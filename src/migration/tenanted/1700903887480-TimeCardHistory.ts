import { MigrationInterface, QueryRunner } from 'typeorm';

export class TimeCardHistory1700903887480 implements MigrationInterface {
  name = 'TimeCardHistory1700903887480';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."timecard_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "clock_in" TIMESTAMP NOT NULL, "event" character varying NOT NULL, "clock_out" TIMESTAMP NOT NULL, "timecard_id" uuid, CONSTRAINT "PK_4249c93b856c7b9050c1656227a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecard_histories" ADD CONSTRAINT "FK_794586b0962ed4032032a97eb36" FOREIGN KEY ("timecard_id") REFERENCES "${queryRunner.connection.driver.schema}"."timecards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecard_histories" DROP CONSTRAINT "FK_794586b0962ed4032032a97eb36"`,
    );
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."timecard_histories"`);
  }
}
