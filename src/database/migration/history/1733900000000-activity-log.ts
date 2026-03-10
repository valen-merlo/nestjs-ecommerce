import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActivityLog1733900000000 implements MigrationInterface {
  name = 'ActivityLog1733900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "activity_log" (
        "id" SERIAL NOT NULL,
        "type" character varying(64) NOT NULL,
        "payload" jsonb NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_log_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_activity_log_createdAt" ON "activity_log" ("createdAt" DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_activity_log_createdAt"`);
    await queryRunner.query(`DROP TABLE "activity_log"`);
  }
}
