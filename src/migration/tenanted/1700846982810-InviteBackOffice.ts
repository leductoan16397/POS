import { MigrationInterface, QueryRunner } from 'typeorm';

export class InviteBackOffice1700846982810 implements MigrationInterface {
  name = 'InviteBackOffice1700846982810';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" ADD "invite_back_office" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" DROP COLUMN "invite_back_office"`,
    );
  }
}
