import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompanyConfig1699979433188 implements MigrationInterface {
  name = 'CompanyConfig1699979433188';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pos"."company_configs" ADD "date_format" character varying NOT NULL DEFAULT 'yyyy-MM-dd'`,
    );
    await queryRunner.query(
      `ALTER TABLE "pos"."company_configs" ADD "separator" character varying NOT NULL DEFAULT ','`,
    );
    await queryRunner.query(
      `ALTER TABLE "pos"."company_configs" ADD "decimal_symbol" character varying NOT NULL DEFAULT '.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "pos"."company_configs" ADD "time_format" character varying NOT NULL DEFAULT 'HH:mm'`,
    );
    await queryRunner.query(
      `ALTER TABLE "pos"."company_configs" ADD "language" character varying NOT NULL DEFAULT 'en'`,
    );
    await queryRunner.query(
      `ALTER TABLE "pos"."company_configs" ADD "name_format" character varying NOT NULL DEFAULT 'Dr'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "name_format"`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "language"`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "time_format"`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "decimal_symbol"`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "separator"`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "date_format"`);
  }
}
