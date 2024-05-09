import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyConfigColumns1702695856237 implements MigrationInterface {
  name = 'AddCompanyConfigColumns1702695856237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" ADD "affiliate_key" character varying`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" ADD "public_key" character varying`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" ADD "private_key" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "private_key"`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "public_key"`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "affiliate_key"`);
  }
}
