import { MigrationInterface, QueryRunner } from "typeorm";

export class Quiz1694515490061 implements MigrationInterface {
    name = 'Quiz1694515490061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recovery_code_entity" ADD "Active1" boolean NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recovery_code_entity" DROP COLUMN "Active1"`);
    }

}
