import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTaxId1705420743438 implements MigrationInterface {
  name = 'RenameTaxId1705420743438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" RENAME COLUMN "tax_id" TO "tax_code"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" RENAME COLUMN "tax_code" TO "tax_id"`);
  }
}
