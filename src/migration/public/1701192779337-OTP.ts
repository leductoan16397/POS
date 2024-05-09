import { MigrationInterface, QueryRunner } from 'typeorm';

export class OTP1701192779337 implements MigrationInterface {
  name = 'OTP1701192779337';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."block_otps" ALTER COLUMN "expire_time" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "pos"."block_otps" ALTER COLUMN "expire_block_time" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."block_otps" ALTER COLUMN "expire_block_time" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "pos"."block_otps" ALTER COLUMN "expire_time" SET NOT NULL`);
  }
}
