import { MigrationInterface, QueryRunner } from "typeorm";

export class Quiz1694519540475 implements MigrationInterface {
    name = 'Quiz1694519540475'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."game_entity_status_enum" AS ENUM('PendingSecondPlayer', 'Active', 'Finished')`);
        await queryRunner.query(`CREATE TABLE "game_entity" ("GameId" uuid NOT NULL DEFAULT uuid_generate_v4(), "FirstPlayerId" uuid NOT NULL, "SecondPlayerId" uuid, "FirstPlayerScore" integer NOT NULL DEFAULT '0', "SecondPlayerScore" integer NOT NULL DEFAULT '0', "FirstPlayerAnswerNumber" integer NOT NULL DEFAULT '0', "SecondPlayerAnswerNumber" integer NOT NULL DEFAULT '0', "Status" "public"."game_entity_status_enum" NOT NULL DEFAULT 'PendingSecondPlayer', "PairCreatedDate" character varying NOT NULL, "StartGameDate" character varying, "FinishGameDate" character varying, CONSTRAINT "PK_72037d79710dbe1afb980745eaf" PRIMARY KEY ("GameId"))`);
        await queryRunner.query(`CREATE TABLE "question_entity" ("QuestionId" uuid NOT NULL DEFAULT uuid_generate_v4(), "Body" character varying NOT NULL, "Published" boolean NOT NULL, "CreatedAt" character varying NOT NULL, "UpdatedAt" character varying, CONSTRAINT "PK_90be52b6dcf76ba2ff08d7f9474" PRIMARY KEY ("QuestionId"))`);
        await queryRunner.query(`CREATE TYPE "public"."answer_entity_answerstatus_enum" AS ENUM('Correct', 'Incorrect')`);
        await queryRunner.query(`CREATE TABLE "answer_entity" ("AnswerId" uuid NOT NULL DEFAULT uuid_generate_v4(), "AnswerStatus" "public"."answer_entity_answerstatus_enum" NOT NULL, "AddedAt" character varying NOT NULL, "CorrectAnswers" character varying NOT NULL, CONSTRAINT "PK_515324fb42d78484b28b96fbf4b" PRIMARY KEY ("AnswerId"))`);
        await queryRunner.query(`CREATE TABLE "correct_answer_entity" ("CorrectAnswerId" uuid NOT NULL DEFAULT uuid_generate_v4(), CONSTRAINT "PK_0f991e0ca9e2709d1e83e7e5555" PRIMARY KEY ("CorrectAnswerId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "correct_answer_entity"`);
        await queryRunner.query(`DROP TABLE "answer_entity"`);
        await queryRunner.query(`DROP TYPE "public"."answer_entity_answerstatus_enum"`);
        await queryRunner.query(`DROP TABLE "question_entity"`);
        await queryRunner.query(`DROP TABLE "game_entity"`);
        await queryRunner.query(`DROP TYPE "public"."game_entity_status_enum"`);
    }

}
