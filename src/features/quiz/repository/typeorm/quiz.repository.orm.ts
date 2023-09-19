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

  async getCurrentGame(userId:string, status_1: QuizStatusEnum, status_2?: QuizStatusEnum): Promise<Game | null> {
    const game = await this.dataSource.createQueryBuilder(Game, "g")
      .where("(g.firstPlayerId = :userId OR g.secondPlayerId = :userId) AND g.status = ANY(:statuses::game_status_enum[])", {
        userId,
        statuses: [status_1, status_2]
      })
      .getOne()
    return game ? game : null
  }


  async getPendingGame(): Promise<Game | null> {
    const result = await this.dataSource.createQueryBuilder(Game, "g")
      .where(`g.status = :status`, { status: QuizStatusEnum.PendingSecondPlayer })
      .getOne()

    // return this.createGameView(result)
    return result ? result : null
  }


}