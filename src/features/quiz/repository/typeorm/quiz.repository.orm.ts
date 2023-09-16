import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource, EntityManager, QueryRunner, SelectQueryBuilder } from "typeorm"
import { Contract } from "../../../../infrastructure/utils/contract"
import { IInsertQuestionOutputModel } from "../../../sa/api/models/output/insert-question.output-model"
import { QuestionBodyInputModelSql } from "../../../sa/api/models/input/quiz/question.body.input-model.sql"
import { Question } from "../../application/entities/typeorm/question"
import { Game, QuizStatusEnum } from "../../application/entities/typeorm/game"
import { Answer } from "../../application/entities/typeorm/answer"
import { AccountEntity } from "../../../sa/application/entities/sql/account.entity"
import {
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
  SORT_BY_DEFAULT_SQL,
  SortDirection, SortDirectionOrm
} from "../../../../infrastructure/utils/constants"

interface ICreateQuestionDto {
  body: string
  published: boolean
  createdAt: string
  updatedAt: string | null
  correctAnswers: string[]
}

interface ICreateAnswerDto {
  questionId: string
  answerStatus: string
  userId: string
  addedAt: string
}

interface IGetCurrentGameDto {
  userId: string
  pending: QuizStatusEnum.PendingSecondPlayer | null
  active: QuizStatusEnum.Active | null
}

@Injectable()
export class QuizRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
  ) {
  }

  // async saveEntity(entity, queryRunner: QueryRunner) {
  //   const result = await queryRunner.manager.save(entity)
  //   return result
  // }

  // async createGame(userId: string, createdDate: string, questionIds: string[]) {
  //   const result = await this.dataSource.createQueryBuilder()
  //     .insert()
  //     .into(GameEntity)
  //     .values({ FirstPlayerId: userId, PairCreatedDate: createdDate, Questions: questionIds })
  //     .execute()
  //   return result.identifiers[0].GameId
  // }

  // async createAnswers({ questionId, answerStatus, userId, addedAt }: ICreateAnswerDto) {
  //   const result = await this.dataSource.createQueryBuilder()
  //     .insert()
  //     .into(AnswerEntity)
  //     .values({
  //       QuestionId: questionId,
  //       AnswerStatus: answerStatus,
  //       UserId: userId,
  //       AddedAt: addedAt,
  //     })
  //     .execute()
  //   return result.identifiers[0].AnswerId
  // }

  // async createQuestion({ body, published, createdAt, updatedAt, correctAnswers }: ICreateQuestionDto, userId: string)
  //   : Promise<string | null> {
  //   const result = await this.dataSource.createQueryBuilder()
  //     .insert()
  //     .into(Question)
  //     .values({
  //       body: body,
  //       published: published,
  //       createdAt: createdAt,
  //       updatedAt: updatedAt || "",
  //     })
  //     .execute()
  //   return result.identifiers[0].QuestionId
  // }

  async deleteQuestion(questionId: string): Promise<number | null> {
    const result = await this.dataSource.createQueryBuilder()
      .delete()
      .from(Question)
      .where(`questionId = :questionId`, { questionId })
      .execute()
    return result.affected ? result.affected : null
  }

  async updateQuestion(questionId: string, { body, correctAnswers }: QuestionBodyInputModelSql)
    : Promise<number | null> {
    const updatedAt = new Date(Date.now()).toISOString()
    const result = await this.dataSource.createQueryBuilder()
      .update(Question)
      .set({ body, correctAnswers, updatedAt })
      .where(`questionId = :questionId`, { questionId })
      .execute()
    return result.affected ? result.affected : null
  }

  async publishQuestion(questionId: string, published: boolean): Promise<number | null> {
    const updatedAt = new Date(Date.now()).toISOString()
    const result = await this.dataSource.createQueryBuilder()
      .update(Question)
      .set({ published, updatedAt })
      .where(`questionId = :questionId`, { questionId })
      .execute()
    return result.affected ? result.affected : null
  }

  async incrementAnswerNumber(gameId: string, setDto: any)
    : Promise<number | null> {
    const result = await this.dataSource.createQueryBuilder()
      .update(Game)
      .set(setDto)
      .where(`gameId = :gameId`, { gameId })
      .execute()
    return result.affected ? result.affected : null
  }

  async getQuestionIdsForAnswer2(published: boolean): Promise<string[] | null> {
    const questionIds = await this.dataSource.createQueryBuilder()
      .select(`q.questionId as "questionId"`)
      .leftJoin(Game, "g")
      .from(Question, "q")
      .where(`q.questionId in (:...g.questionIds)`)
      .andWhere(`q.published = :published`, { published })
      .getRawMany()
    return questionIds ? questionIds : null
  }

  async getQuestionIdsForAnswer(questionIds: string[], published: boolean): Promise<Question[] | null> {
    const questions = await this.dataSource.createQueryBuilder(Question, "q")
      .where(`q.questionId in (:...questionIds)`, { questionIds })
      // .andWhere(`q.published = :published`, { published })
      .getMany()
    return questions ? questions : null
  }


  async getQuestions(published: boolean): Promise<Question[] | null> {
    const questions = await this.dataSource.createQueryBuilder(Question, "q")
      .where(`q.published = :published`, { published })
      .orderBy("RANDOM()", "DESC")
      .limit(5)
      .getMany()
    return questions.length ? questions : null
  }

  // async getQuestionEntities(gameId: string, published: boolean) {
  //   const questionEntities = await this.dataSource.createQueryBuilder()
  //     .select(`q.QuestionId as "questionId"`)
  //     .from(QuestionEntity, "q")
  //     .where(`:gameId NOT IN (q."GameIds")`, { gameId })
  //     .andWhere(`q.Published = :published`, { published })
  //     .orderBy("RANDOM()")
  //     .limit(5)
  //     .getMany()
  //   return questionEntities ? questionEntities : null
  // }

  // async isCorrectAnswer(gameId: string, answer: string)
  //   : Promise<string[] | null> {
  //   const questions = await this.dataSource.createQueryBuilder()
  //     .from(QuestionEntity, "q")
  //     .where(`q.GameId = :gameId`, { gameId })
  //     .andWhere(`:answer In q.CorrectAnswers`, { answer })
  //     .getRawOne()
  //   return questions ? questions : null
  // }


  async getCurrentGame({ userId, pending, active }: IGetCurrentGameDto): Promise<Game | null> {
    const qb = this.dataSource.createQueryBuilder(Game, "g")
      .where(`g.firstPlayerId = :userId or g.secondPlayerId = :userId`, { userId })
      .andWhere(`g.status = :pending or g.status = :active`, { pending, active })
    const game = await qb.getOne()
    return game ? game : null
  }

  async getUserCurrentGame2(userId: string, { pending, active }): Promise<Game & Question | null> {
    const result = await this.dataSource.createQueryBuilder()
      .from(Game, "g")
      .where(`g.firstPlayerId = :userId or g.secondPlayerId = :userId`, { userId })
      .andWhere(`g.status = :pending or g.status = :active`, { pending, active })
      .getRawOne()

    // return this.createGameView(result)
    return result ? result : null
  }

  async getPendingGame(): Promise<Game | null> {
    const result = await this.dataSource.createQueryBuilder(Game, "g")
      .where(`g.status = :status`, { status: QuizStatusEnum.PendingSecondPlayer })
      .getOne()

    // return this.createGameView(result)
    return result ? result : null
  }


  private selectPlayerLogin(qb: SelectQueryBuilder<any>, userId: string) {
    return qb
      .select(`ac.login`)
      .from(AccountEntity, "ac")
      .where(`ac.userId = ${userId}`)
  }

  private selectAnswers(qb: SelectQueryBuilder<any>, userId: string) {
    return qb.select(`json_agg(to_jsonb("answers")) as "answers"`)
      .from(qb => {
        return qb
          .select([
            `an.questionId as "questionId"`,
            `an.answerStatus as "answerStatus"`,
            `an.addedAt as "addedAt"`
          ])
          .from(Answer, "an")
          .where(`an.userId = ${userId}`,)
          .andWhere(`an.gameId = g.gameId`)
          .groupBy(`an.userId`)
          .orderBy(`an."addedAt"`, "DESC")
      }, "answers")

  }

  private selectQuestions2(qb: SelectQueryBuilder<any>, gameId: string) {
    return qb.select(`json_agg(to_jsonb("questions")) as "questions"`)
      .from(qb => {
        return qb
          .select([
            `qu.QuestionId as "id"`,
            `qu.Body as "body"`
          ])
          .from(Question, "qu")
          .where(`qu.GameId = ${gameId}`)
          .orderBy(`qu."CreatedAt"`, "DESC")
      }, "questions")
  }

  private createGameView(rawGameView: any) {
    return {
      id: rawGameView.GameId,
      firstPlayerId: rawGameView.FirstPlayerId,
      secondPlayerId: rawGameView.SecondPlayerId,
      firstPlayerScore: rawGameView.FirstPlayerScore,
      secondPlayerScore: rawGameView.SecondPlayerScore,
      firstPlayerAnswerNumber: rawGameView.FirstPlayerAnswerNumber,
      secondPlayerAnswerNumber: rawGameView.SecondPlayerAnswerNumber,
      status: rawGameView.Status,
      pairCreatedDate: rawGameView.PairCreatedDate,
      startGameDate: rawGameView.StartGameDate,
      finishGameDate: rawGameView.FinishGameDate,
      questionIds: rawGameView.QuestionIds,
    }
  }


}