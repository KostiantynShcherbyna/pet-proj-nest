import { MigrationInterface, QueryRunner } from "typeorm";

export class Quiz1694524433479 implements MigrationInterface {
    name = 'Quiz1694524433479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "game_entity_questions_question_entity" ("gameEntityGameId" uuid NOT NULL, "questionEntityQuestionId" uuid NOT NULL, CONSTRAINT "PK_f1e50edcbe761362b10699e7664" PRIMARY KEY ("gameEntityGameId", "questionEntityQuestionId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7359aecb35893910e8f8b8d97c" ON "game_entity_questions_question_entity" ("gameEntityGameId") `);
        await queryRunner.query(`CREATE INDEX "IDX_727bf50cda9202279ec7007ac8" ON "game_entity_questions_question_entity" ("questionEntityQuestionId") `);
        await queryRunner.query(`ALTER TABLE "question_entity" ADD "CorrectAnswers" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game_entity_questions_question_entity" ADD CONSTRAINT "FK_7359aecb35893910e8f8b8d97cd" FOREIGN KEY ("gameEntityGameId") REFERENCES "game_entity"("GameId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "game_entity_questions_question_entity" ADD CONSTRAINT "FK_727bf50cda9202279ec7007ac82" FOREIGN KEY ("questionEntityQuestionId") REFERENCES "question_entity"("QuestionId") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_entity_questions_question_entity" DROP CONSTRAINT "FK_727bf50cda9202279ec7007ac82"`);
        await queryRunner.query(`ALTER TABLE "game_entity_questions_question_entity" DROP CONSTRAINT "FK_7359aecb35893910e8f8b8d97cd"`);
        await queryRunner.query(`ALTER TABLE "question_entity" DROP COLUMN "CorrectAnswers"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_727bf50cda9202279ec7007ac8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7359aecb35893910e8f8b8d97c"`);
        await queryRunner.query(`DROP TABLE "game_entity_questions_question_entity"`);
    }

}
