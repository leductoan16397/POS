import { MigrationInterface, QueryRunner } from "typeorm";

export class Index1706631252914 implements MigrationInterface {
    name = 'Index1706631252914'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "pos"."users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_e4bdddff12569bd25de6e701f1" ON "pos"."companies" ("business_name") `);
        await queryRunner.query(`CREATE INDEX "IDX_b27e13c6f9268437651b1e8654" ON "pos"."companies" ("key") `);
        await queryRunner.query(`CREATE INDEX "IDX_d2f6f92956a8f4c4b87be31944" ON "pos"."companies" ("owner_email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "pos"."IDX_d2f6f92956a8f4c4b87be31944"`);
        await queryRunner.query(`DROP INDEX "pos"."IDX_b27e13c6f9268437651b1e8654"`);
        await queryRunner.query(`DROP INDEX "pos"."IDX_e4bdddff12569bd25de6e701f1"`);
        await queryRunner.query(`DROP INDEX "pos"."IDX_97672ac88f789774dd47f7c8be"`);
    }

}
