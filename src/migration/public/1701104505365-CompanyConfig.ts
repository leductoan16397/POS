import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompanyConfig1701104505365 implements MigrationInterface {
  name = 'CompanyConfig1701104505365';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" ADD "state" character varying`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" ADD "city" character varying`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" ADD "zip_code" character varying`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" ADD "address" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "address"`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "zip_code"`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "state"`);
  }
}
