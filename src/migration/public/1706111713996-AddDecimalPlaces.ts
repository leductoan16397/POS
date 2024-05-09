import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDecimalPlaces1706111713996 implements MigrationInterface {
  name = 'AddDecimalPlaces1706111713996';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" ADD "decimal_places" integer NOT NULL DEFAULT '2'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "decimal_places"`);
  }
}
