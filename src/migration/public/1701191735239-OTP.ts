import { MigrationInterface, QueryRunner } from 'typeorm';

export class OTP1701191735239 implements MigrationInterface {
  name = 'OTP1701191735239';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pos"."otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "action" character varying NOT NULL, "email" character varying NOT NULL, "code" character varying NOT NULL, "current_valid" integer NOT NULL, "limit_invalid" integer NOT NULL, "expire_time" TIMESTAMP NOT NULL, CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pos"."block_otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "num_request" integer NOT NULL, "expire_time" TIMESTAMP NOT NULL, "expire_block_time" TIMESTAMP NOT NULL, "status" character varying NOT NULL, CONSTRAINT "PK_3b108a35f3fdd36c3331ea049c2" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "pos"."block_otps"`);
    await queryRunner.query(`DROP TABLE "pos"."otps"`);
  }
}
