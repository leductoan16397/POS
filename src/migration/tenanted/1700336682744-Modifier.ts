import { MigrationInterface, QueryRunner } from 'typeorm';

export class Modifier1700336682744 implements MigrationInterface {
  name = 'Modifier1700336682744';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."modifiers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "allowed_for_all_outlet" boolean NOT NULL DEFAULT true, "outlet_ids" character varying array NOT NULL DEFAULT '{}', "options" jsonb NOT NULL, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_f4d68e3a0c8a835c06a9fa27f7e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."item_modifier" ("modifier_id" uuid NOT NULL, "item_id" uuid NOT NULL, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_5e8cf82ef816083a8cec6d425a3" PRIMARY KEY ("modifier_id", "item_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_${queryRunner.connection.driver.schema}_1a115671cef57de914581b5e03" ON "${queryRunner.connection.driver.schema}"."item_modifier" ("modifier_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_${queryRunner.connection.driver.schema}_98536d2c9281404e8db36023f4" ON "${queryRunner.connection.driver.schema}"."item_modifier" ("item_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_modifier" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_1a115671cef57de914581b5e03a" FOREIGN KEY ("modifier_id") REFERENCES "${queryRunner.connection.driver.schema}"."modifiers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_modifier" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_98536d2c9281404e8db36023f43" FOREIGN KEY ("item_id") REFERENCES "${queryRunner.connection.driver.schema}"."items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_modifier" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_98536d2c9281404e8db36023f43"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_modifier" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_1a115671cef57de914581b5e03a"`,
    );
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."item_modifier"`);
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."modifiers"`);
  }
}
