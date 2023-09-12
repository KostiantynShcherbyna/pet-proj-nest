import { MigrationInterface, QueryRunner } from "typeorm";

export class Quiz1694515674816 implements MigrationInterface {
    name = 'Quiz1694515674816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recovery_code_entity" DROP COLUMN "Active1"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recovery_code_entity" ADD "Active1" boolean NOT NULL`);
    }

}
