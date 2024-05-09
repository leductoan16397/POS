import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1699202247833 implements MigrationInterface {
  name = 'Init1699202247833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pos"."refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "token" character varying NOT NULL, "user_id" uuid, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pos"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "salt" character varying NOT NULL, "email" character varying NOT NULL, "pin" character varying NOT NULL, "hashed_password" character varying NOT NULL, "country" character varying NOT NULL, "role" character varying NOT NULL, "company_id" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pos"."company_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "country_id" character varying, "currency" character varying, "currency_code" character varying, "currency_symbol" character varying, "minor_unit" integer, "timezone" character varying, "transaction_pct" character varying, "created_by_id" uuid, CONSTRAINT "REL_cbc7889728e84b3bc7339ec0b0" UNIQUE ("created_by_id"), CONSTRAINT "PK_726c503e5e9ae894378b0977353" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "pos"."companies_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
    await queryRunner.query(
      `CREATE TABLE "pos"."companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "business_name" character varying NOT NULL, "key" character varying NOT NULL, "owner_email" character varying NOT NULL, "status" "pos"."companies_status_enum" NOT NULL, "created_by_id" uuid, "config_id" uuid, CONSTRAINT "UQ_b27e13c6f9268437651b1e86540" UNIQUE ("key"), CONSTRAINT "REL_747580cfe76ebd751cbcd72b18" UNIQUE ("created_by_id"), CONSTRAINT "REL_d94f202dd949170c90fd95777c" UNIQUE ("config_id"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "pos"."refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "pos"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pos"."company_configs" ADD CONSTRAINT "FK_cbc7889728e84b3bc7339ec0b08" FOREIGN KEY ("created_by_id") REFERENCES "pos"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pos"."companies" ADD CONSTRAINT "FK_747580cfe76ebd751cbcd72b181" FOREIGN KEY ("created_by_id") REFERENCES "pos"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pos"."companies" ADD CONSTRAINT "FK_d94f202dd949170c90fd95777cd" FOREIGN KEY ("config_id") REFERENCES "pos"."company_configs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pos"."companies" DROP CONSTRAINT "FK_d94f202dd949170c90fd95777cd"`);
    await queryRunner.query(`ALTER TABLE "pos"."companies" DROP CONSTRAINT "FK_747580cfe76ebd751cbcd72b181"`);
    await queryRunner.query(`ALTER TABLE "pos"."company_configs" DROP CONSTRAINT "FK_cbc7889728e84b3bc7339ec0b08"`);
    await queryRunner.query(`ALTER TABLE "pos"."refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`);
    await queryRunner.query(`DROP TABLE "pos"."companies"`);
    await queryRunner.query(`DROP TYPE "pos"."companies_status_enum"`);
    await queryRunner.query(`DROP TABLE "pos"."company_configs"`);
    await queryRunner.query(`DROP TABLE "pos"."users"`);
    await queryRunner.query(`DROP TABLE "pos"."refresh_tokens"`);
  }
}
