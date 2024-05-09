import { MigrationInterface, QueryRunner } from 'typeorm';

export class Index1706634228504 implements MigrationInterface {
  name = 'Index1706634228504';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_5886b3e59498f7861f8faf0277" ON "${queryRunner.connection.driver.schema}"."tenant_user_groups" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b942d55b92ededa770041db9de" ON "${queryRunner.connection.driver.schema}"."customers" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8536b8b85c06969f84f0c098b0" ON "${queryRunner.connection.driver.schema}"."customers" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_88acd889fbe17d0e16cc4bc917" ON "${queryRunner.connection.driver.schema}"."customers" ("phone") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_acd5656a9fa7cf04125f084816" ON "${queryRunner.connection.driver.schema}"."customers" ("customer_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2b8dab9fd7d3e171109719d81e" ON "${queryRunner.connection.driver.schema}"."discount_tickets" ("discount_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_494a87248dd34c2f0e05df38e2" ON "${queryRunner.connection.driver.schema}"."discount_tickets" ("code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d89d5e401a4759ae9c2d3d5bcd" ON "${queryRunner.connection.driver.schema}"."item_ticket_modifiers" ("modifier_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_08292f13695dc15dbdd494a6e2" ON "${queryRunner.connection.driver.schema}"."item_tickets" ("item_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c2f356660d9cb501e4dff6fe80" ON "${queryRunner.connection.driver.schema}"."receipts" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e5dae9145f91530e09a422754e" ON "${queryRunner.connection.driver.schema}"."tickets" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af9e530183acb92e5e938a83fa" ON "${queryRunner.connection.driver.schema}"."tickets" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d53e87bfe2cfc2bf22180bb5f7" ON "${queryRunner.connection.driver.schema}"."tenant_users" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6dbcd62a6466b78599714f032d" ON "${queryRunner.connection.driver.schema}"."tenant_users" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fae37b5b2b62cbce0f173e77bd" ON "${queryRunner.connection.driver.schema}"."tenant_users" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a205ca5a37fa5e10005f003aaf" ON "${queryRunner.connection.driver.schema}"."stores" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3c74d020d5ba37d5a01274010c" ON "${queryRunner.connection.driver.schema}"."discounts" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8c7cc2340e9ea0fc5a246e6374" ON "${queryRunner.connection.driver.schema}"."discounts" ("code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7d72ae46a78dca60e4b27275d3" ON "${queryRunner.connection.driver.schema}"."modifiers" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_213736582899b3599acaade2cd" ON "${queryRunner.connection.driver.schema}"."items" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8b0be371d28245da6e4f4b6187" ON "${queryRunner.connection.driver.schema}"."categories" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d0da52903c7079422adb145174" ON "${queryRunner.connection.driver.schema}"."discount_store" ("discount_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f9ffa384babe71a82e8e9ee642" ON "${queryRunner.connection.driver.schema}"."discount_store" ("store_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1a115671cef57de914581b5e03" ON "${queryRunner.connection.driver.schema}"."item_modifier" ("modifier_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_98536d2c9281404e8db36023f4" ON "${queryRunner.connection.driver.schema}"."item_modifier" ("item_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_42bc3af8906e12365293438a93" ON "${queryRunner.connection.driver.schema}"."item_category" ("item_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_638552fc7d9a2035c2b53182d8" ON "${queryRunner.connection.driver.schema}"."item_category" ("category_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_638552fc7d9a2035c2b53182d8"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_42bc3af8906e12365293438a93"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_98536d2c9281404e8db36023f4"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_1a115671cef57de914581b5e03"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_f9ffa384babe71a82e8e9ee642"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_d0da52903c7079422adb145174"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_8b0be371d28245da6e4f4b6187"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_213736582899b3599acaade2cd"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_7d72ae46a78dca60e4b27275d3"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_8c7cc2340e9ea0fc5a246e6374"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_3c74d020d5ba37d5a01274010c"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_a205ca5a37fa5e10005f003aaf"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_fae37b5b2b62cbce0f173e77bd"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_6dbcd62a6466b78599714f032d"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_d53e87bfe2cfc2bf22180bb5f7"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_af9e530183acb92e5e938a83fa"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_e5dae9145f91530e09a422754e"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_c2f356660d9cb501e4dff6fe80"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_08292f13695dc15dbdd494a6e2"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_d89d5e401a4759ae9c2d3d5bcd"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_494a87248dd34c2f0e05df38e2"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_2b8dab9fd7d3e171109719d81e"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_acd5656a9fa7cf04125f084816"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_88acd889fbe17d0e16cc4bc917"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_8536b8b85c06969f84f0c098b0"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_b942d55b92ededa770041db9de"`);
    await queryRunner.query(`DROP INDEX "${queryRunner.connection.driver.schema}"."IDX_5886b3e59498f7861f8faf0277"`);
  }
}
