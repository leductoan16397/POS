import { MigrationInterface, QueryRunner } from 'typeorm';

export class SymbolOnLeft1700296502361 implements MigrationInterface {
  name = 'SymbolOnLeft1700296502361';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pos"."company_configs" ADD "currency_symbol_on_left" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP COLUMN "currency_symbol_on_left"`);
  }
}
