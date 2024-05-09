import { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteUser1702305246944 implements MigrationInterface {
  name = 'SoftDeleteUser1702305246944';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."users" ADD "deleted_at" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."users" DROP COLUMN "deleted_at"`);
  }
}
