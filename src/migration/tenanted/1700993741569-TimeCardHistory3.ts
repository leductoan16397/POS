import { MigrationInterface, QueryRunner } from 'typeorm';

export class TimeCardHistory31700993741569 implements MigrationInterface {
  name = 'TimeCardHistory31700993741569';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecard_histories" DROP CONSTRAINT "FK_794586b0962ed4032032a97eb36"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecard_histories" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_794586b0962ed4032032a97eb36" FOREIGN KEY ("timecard_id") REFERENCES "${queryRunner.connection.driver.schema}"."timecards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecard_histories" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_794586b0962ed4032032a97eb36"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecard_histories" ADD CONSTRAINT "FK_794586b0962ed4032032a97eb36" FOREIGN KEY ("timecard_id") REFERENCES "${queryRunner.connection.driver.schema}"."timecards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
