import { MigrationInterface, QueryRunner } from 'typeorm';

export class TimecardStatus1705423452910 implements MigrationInterface {
  name = 'TimecardStatus1705423452910';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."timecards" ADD "status" character varying NOT NULL DEFAULT 'CLOSED'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."timecards" DROP COLUMN "status"`);
  }
}
