import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShiftCashesTable1700151113903 implements MigrationInterface {
  name = 'ShiftCashesTable1700151113903';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "${queryRunner.connection.driver.schema}"."shift_cashes_type_enum" AS ENUM('PAY_IN', 'PAY_OUT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."shift_cashes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "amount" integer NOT NULL, "comment" character varying, "type" "${queryRunner.connection.driver.schema}"."shift_cashes_type_enum" NOT NULL, "shift_id" uuid, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_460c1ebc4abeb90ba93a2c25e6e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shift_cashes" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_aeee16197429ae3f7450c2b3586" FOREIGN KEY ("shift_id") REFERENCES "${queryRunner.connection.driver.schema}"."shifts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."shift_cashes" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_aeee16197429ae3f7450c2b3586"`,
    );
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."shift_cashes"`);
    await queryRunner.query(`DROP TYPE "${queryRunner.connection.driver.schema}"."shift_cashes_type_enum"`);
  }
}
