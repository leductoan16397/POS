import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaxInCategory1701881392401 implements MigrationInterface {
  name = 'TaxInCategory1701881392401';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."categories" ADD "tax" numeric NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."categories" DROP COLUMN "tax"`);
  }
}
