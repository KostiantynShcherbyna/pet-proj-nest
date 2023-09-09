import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { Contract } from "../../../../infrastructure/utils/contract"
import { IInsertQuestionOutputModel } from "../../../sa/api/models/output/insert-question.output-model"
import { QuestionBodyInputModelSql } from "../../../sa/api/models/input/quiz/question.body.input-model.sql"
import { QuestionEntity } from "../../application/entities/typeorm/question.entity"
import { GameEntity } from "../../application/entities/typeorm/game.entity"
import { AnswerEntity } from "../../application/entities/typeorm/answer.entity"

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

  async connection(userId: string, createdDate: string) {
    const result = await this.dataSource.createQueryBuilder()
      .insert()
      .into(GameEntity)
      .values({ FirstPlayerId: userId, PairCreatedDate: createdDate })
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


}