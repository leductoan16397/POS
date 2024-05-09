import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReCreateConstraintTransaction1702699752061 implements MigrationInterface {
  name = 'ReCreateConstraintTransaction1702699752061';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."transaction_histories" DROP IF EXISTS "REL_e862c5f3128f3041813083ad53"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
