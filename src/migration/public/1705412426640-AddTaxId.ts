import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaxId1705412426640 implements MigrationInterface {
  name = 'AddTaxId1705412426640';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" ADD "tax_id" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "tax_id"`);
  }
}
