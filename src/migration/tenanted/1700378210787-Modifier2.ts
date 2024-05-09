import { MigrationInterface, QueryRunner } from 'typeorm';

export class Modifier21700378210787 implements MigrationInterface {
  name = 'Modifier21700378210787';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."modifiers" DROP COLUMN "allowed_for_all_outlet"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."modifiers" DROP COLUMN "outlet_ids"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."modifiers" ADD "outlet_ids" character varying array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."modifiers" ADD "allowed_for_all_outlet" boolean NOT NULL DEFAULT true`,
    );
  }
}
