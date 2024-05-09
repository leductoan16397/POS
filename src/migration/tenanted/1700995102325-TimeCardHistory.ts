import { MigrationInterface, QueryRunner } from 'typeorm';

export class TimeCardHistory1700995102325 implements MigrationInterface {
  name = 'TimeCardHistory1700995102325';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecard_histories" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_794586b0962ed4032032a97eb36"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecards" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_bd0e74ee9156ae25bbe770bbfae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecards" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_2567a80332af6e9aa4f10035f39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecard_histories" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_794586b0962ed4032032a97eb36" FOREIGN KEY ("timecard_id") REFERENCES "${queryRunner.connection.driver.schema}"."timecards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecard_histories" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_794586b0962ed4032032a97eb36"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecards" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_2567a80332af6e9aa4f10035f39" FOREIGN KEY ("store_id") REFERENCES "${queryRunner.connection.driver.schema}"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecards" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_bd0e74ee9156ae25bbe770bbfae" FOREIGN KEY ("employee_id") REFERENCES "${queryRunner.connection.driver.schema}"."tenant_users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecard_histories" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_794586b0962ed4032032a97eb36" FOREIGN KEY ("timecard_id") REFERENCES "${queryRunner.connection.driver.schema}"."timecards"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
