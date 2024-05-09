import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShiftNumberColumnShiftsTable1700149822318 implements MigrationInterface {
  name = 'ShiftNumberColumnShiftsTable1700149822318';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" DROP COLUMN "toal_card"`);
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" ADD "shift_number" SERIAL`);
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" ADD "total_card" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" DROP COLUMN "total_card"`);
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" DROP COLUMN "shift_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shifts" ADD "toal_card" integer DEFAULT '0'`,
    );
  }
}
