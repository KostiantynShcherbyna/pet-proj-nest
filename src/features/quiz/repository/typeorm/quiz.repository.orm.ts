import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource, SelectQueryBuilder } from "typeorm"
import { Contract } from "../../../../infrastructure/utils/contract"
import { IInsertQuestionOutputModel } from "../../../sa/api/models/output/insert-question.output-model"
import { QuestionBodyInputModelSql } from "../../../sa/api/models/input/quiz/question.body.input-model.sql"
import { QuestionEntity } from "../../application/entities/typeorm/question.entity"
import { GameEntity, StatusEnum } from "../../application/entities/typeorm/game.entity"
import { AnswerEntity } from "../../application/entities/typeorm/answer.entity"
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

@Injectable()
export class QuizRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
  ) {
  }

  async createGame(userId: string, createdDate: string, questionIds: string[]) {
    const result = await this.dataSource.createQueryBuilder()
      .insert()
      .into(GameEntity)
      .values({ FirstPlayerId: userId, PairCreatedDate: createdDate, Questions: questionIds })
      .execute()
    return result.identifiers[0].GameId
  }

  async createAnswers({ questionId, answerStatus, userId, addedAt }: ICreateAnswerDto) {
    const result = await this.dataSource.createQueryBuilder()
      .insert()
      .into(AnswerEntity)
      .values({
        QuestionId: questionId,
        AnswerStatus: answerStatus,
        UserId: userId,
        AddedAt: addedAt,
      })
      .execute()
    return result.identifiers[0].AnswerId
  }

  async createQuestion({ body, published, createdAt, updatedAt, correctAnswers }: ICreateQuestionDto, userId: string)
    : Promise<string | null> {
    const result = await this.dataSource.createQueryBuilder()
      .insert()
      .into(QuestionEntity)
      .values({
        Body: body,
        Published: published,
        CreatedAt: createdAt,
        UpdatedAt: updatedAt,
        CorrectAnswers: correctAnswers,
      })
      .execute()
    return result.identifiers[0].QuestionId
  }

  async deleteQuestion(questionId: string, userId: string)
    : Promise<number | null> {
    const result = await this.dataSource.createQueryBuilder()
      .delete()
      .from(QuestionEntity)
      .where(`QuestionId = :questionId`, { questionId })
      .execute()
    return result.affected ? result.affected : null
  }

  async updateQuestion(questionId: string, { body, correctAnswers }: QuestionBodyInputModelSql, userId: string)
    : Promise<number | null> {
    const result = await this.dataSource.createQueryBuilder()
      .update(QuestionEntity)
      .set({
        Body: body,
        CorrectAnswers: correctAnswers,
      })
      .where(`QuestionId = :questionId`, { questionId })
      .execute()
    return result.affected ? result.affected : null
  }

  async publishQuestion(questionId: string, published: boolean, userId: string)
    : Promise<number | null> {
    const result = await this.dataSource.createQueryBuilder()
      .update(QuestionEntity)
      .set({ Published: published })
      .where(`QuestionId = :questionId`, { questionId })
      .execute()
    return result.affected ? result.affected : null
  }

  async incrementAnswerNumber(gameId: string, setDto: any)
    : Promise<number | null> {
    const result = await this.dataSource.createQueryBuilder()
      .update(GameEntity)
      .set(setDto)
      .where(`GameId = :gameId`, { gameId })
      .execute()
    return result.affected ? result.affected : null
  }

  async getQuestionIds(gameId: string, published: boolean): Promise<string[] | null> {
    const questionIds = await this.dataSource.createQueryBuilder()
      .select(`q.QuestionId as "questionId"`)
      .from(QuestionEntity, "q")
      .where(`(q.GameIds) = :gameId`, { gameId })
      .andWhere(`q.Published = :published`, { published })
      .orderBy("RANDOM()")
      .limit(5)
      .getRawMany()
    return questionIds ? questionIds : null
  }

  async getQuestionEntities(gameId: string, published: boolean) {
    const questionEntities = await this.dataSource.createQueryBuilder()
      .select(`q.QuestionId as "questionId"`)
      .from(QuestionEntity, "q")
      .where(`:gameId NOT IN (q."GameIds")`, { gameId })
      .andWhere(`q.Published = :published`, { published })
      .orderBy("RANDOM()")
      .limit(5)
      .getMany()
    return questionEntities ? questionEntities : null
  }

  // async isCorrectAnswer(gameId: string, answer: string)
  //   : Promise<string[] | null> {
  //   const questions = await this.dataSource.createQueryBuilder()
  //     .from(QuestionEntity, "q")
  //     .where(`q.GameId = :gameId`, { gameId })
  //     .andWhere(`:answer In q.CorrectAnswers`, { answer })
  //     .getRawOne()
  //   return questions ? questions : null
  // }


  async getUserCurrentGame(userId: string, { pending, active }) {
    const result = await this.dataSource.createQueryBuilder()
      .from(GameEntity, "g")
      .where(`g.FirstPlayerId = :userId or g.SecondPlayerId = :userId`, { userId })
      .andWhere(`g.Status = :pending or g.Status = :active`, { pending, active })
      .getRawOne()

    return this.createGameView(result)
  }


  private selectPlayerLogin(qb: SelectQueryBuilder<any>, userId: string) {
    return qb
      .select(`ac.Login`)
      .from(AccountEntity, "ac")
      .where(`ac.UserId = ${userId}`)
  }

  private selectAnswers(qb: SelectQueryBuilder<any>, userId: string) {
    return qb.select(`json_agg(to_jsonb("answers")) as "answers"`)
      .from(qb => {
        return qb
          .select([
            `an.QuestionId as "questionId"`,
            `an.AnswerStatus as "answerStatus"`,
            `an.AddedAt as "addedAt"`
          ])
          .from(AnswerEntity, "an")
          .where(`an.UserId = ${userId}`,)
          .andWhere(`an.GameId = g.GameId`)
          .groupBy(`an.UserId`)
          .orderBy(`an."AddedAt"`, "DESC")
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
          .from(QuestionEntity, "qu")
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
    }
  }


}