import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneToUser1700496204409 implements MigrationInterface {
  name = 'AddPhoneToUser1700496204409';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."users" ADD "phone" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."users" DROP COLUMN "phone"`);
  }
}
