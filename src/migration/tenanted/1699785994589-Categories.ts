import { MigrationInterface, QueryRunner } from 'typeorm';

export class Categories1699785994589 implements MigrationInterface {
  name = 'Categories1699785994589';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_db3582a34eaa7af952d12648981"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."items" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_0c4aa809ddf5b0c6ca45d8a8e80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_d19dfbe58b7a27e28f113b23f49"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_store" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_d0da52903c7079422adb145174c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_store" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_f9ffa384babe71a82e8e9ee6422"`,
    );
    await queryRunner.query(
      `DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_${queryRunner.connection.driver.schema}_d0da52903c7079422adb145174"`,
    );
    await queryRunner.query(
      `DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_${queryRunner.connection.driver.schema}_f9ffa384babe71a82e8e9ee642"`,
    );
    await queryRunner.query(
      `CREATE TABLE "${queryRunner.connection.driver.schema}"."item_category" ("item_id" uuid NOT NULL, "category_id" uuid NOT NULL, CONSTRAINT "PK_${queryRunner.connection.driver.schema}_7c2df7ada9546173673e1305121" PRIMARY KEY ("item_id", "category_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_${queryRunner.connection.driver.schema}_42bc3af8906e12365293438a93" ON "${queryRunner.connection.driver.schema}"."item_category" ("item_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_${queryRunner.connection.driver.schema}_638552fc7d9a2035c2b53182d8" ON "${queryRunner.connection.driver.schema}"."item_category" ("category_id") `,
    );
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" DROP COLUMN "category_id"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_${queryRunner.connection.driver.schema}_d0da52903c7079422adb145174" ON "${queryRunner.connection.driver.schema}"."discount_store" ("discount_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_${queryRunner.connection.driver.schema}_f9ffa384babe71a82e8e9ee642" ON "${queryRunner.connection.driver.schema}"."discount_store" ("store_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_db3582a34eaa7af952d12648981" FOREIGN KEY ("item_id") REFERENCES "${queryRunner.connection.driver.schema}"."items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_d19dfbe58b7a27e28f113b23f49" FOREIGN KEY ("group_id") REFERENCES "${queryRunner.connection.driver.schema}"."tenant_user_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_category" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_42bc3af8906e12365293438a937" FOREIGN KEY ("item_id") REFERENCES "${queryRunner.connection.driver.schema}"."items"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_category" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_638552fc7d9a2035c2b53182d8a" FOREIGN KEY ("category_id") REFERENCES "${queryRunner.connection.driver.schema}"."categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_store" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_d0da52903c7079422adb145174c" FOREIGN KEY ("discount_id") REFERENCES "${queryRunner.connection.driver.schema}"."discounts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_store" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_f9ffa384babe71a82e8e9ee6422" FOREIGN KEY ("store_id") REFERENCES "${queryRunner.connection.driver.schema}"."stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_store" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_f9ffa384babe71a82e8e9ee6422"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_store" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_d0da52903c7079422adb145174c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_category" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_638552fc7d9a2035c2b53182d8a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_category" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_42bc3af8906e12365293438a937"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_d19dfbe58b7a27e28f113b23f49"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" DROP CONSTRAINT "FK_${queryRunner.connection.driver.schema}_db3582a34eaa7af952d12648981"`,
    );
    await queryRunner.query(
      `DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_${queryRunner.connection.driver.schema}_f9ffa384babe71a82e8e9ee642"`,
    );
    await queryRunner.query(
      `DROP INDEX "${queryRunner.connection.driver.schema}"."IDX${queryRunner.connection.driver.schema}__d0da52903c7079422adb145174"`,
    );
    await queryRunner.query(`ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ADD "category_id" uuid`);
    await queryRunner.query(
      `DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_${queryRunner.connection.driver.schema}_638552fc7d9a2035c2b53182d8"`,
    );
    await queryRunner.query(
      `DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_${queryRunner.connection.driver.schema}_42bc3af8906e12365293438a93"`,
    );
    await queryRunner.query(`DROP TABLE "${queryRunner.connection.driver.schema}"."item_category"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_${queryRunner.connection.driver.schema}_f9ffa384babe71a82e8e9ee642" ON "${queryRunner.connection.driver.schema}"."discount_store" ("store_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_${queryRunner.connection.driver.schema}_d0da52903c7079422adb145174" ON "${queryRunner.connection.driver.schema}"."discount_store" ("discount_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_store" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_f9ffa384babe71a82e8e9ee6422" FOREIGN KEY ("store_id") REFERENCES "${queryRunner.connection.driver.schema}"."stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."discount_store" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_d0da52903c7079422adb145174c" FOREIGN KEY ("discount_id") REFERENCES "${queryRunner.connection.driver.schema}"."discounts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."tenant_users" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_d19dfbe58b7a27e28f113b23f49" FOREIGN KEY ("group_id") REFERENCES "${queryRunner.connection.driver.schema}"."tenant_user_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."items" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_0c4aa809ddf5b0c6ca45d8a8e80" FOREIGN KEY ("category_id") REFERENCES "${queryRunner.connection.driver.schema}"."categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${queryRunner.connection.driver.schema}"."item_variants" ADD CONSTRAINT "FK_${queryRunner.connection.driver.schema}_db3582a34eaa7af952d12648981" FOREIGN KEY ("item_id") REFERENCES "${queryRunner.connection.driver.schema}"."items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
