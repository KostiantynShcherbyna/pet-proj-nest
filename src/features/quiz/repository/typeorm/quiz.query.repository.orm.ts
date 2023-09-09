import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource, SelectQueryBuilder } from "typeorm"
import {
  LikeStatus,
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
  SORT_BY_DEFAULT_SQL,
  SortDirection,
  SortDirectionOrm
} from "../../../../infrastructure/utils/constants"
import { GetQuestionsQueryInputModel } from "../../../sa/api/models/input/quiz/get-questions.query.input-model"
import { QuestionEntity } from "../../application/entities/typeorm/question.entity"
import { IQuestionsOutputModel } from "../../../sa/api/models/output/get-questions.output-model"
import { GameEntity } from "../../application/entities/typeorm/game.entity"
import { AccountEntity } from "../../../sa/application/entities/sql/account.entity"
import { PostLikeEntity } from "../../../posts/application/entites/typeorm/post-like.entity"
import { AnswerEntity } from "../../application/entities/typeorm/answer.entity"


@Injectable()
export class QuizQueryRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
  ) {
  }

  async getMyCurrentGame(userId: string) {

  }

  async getGameById(gameId: string, userId: string) {
    const result = await this.dataSource.createQueryBuilder()
      .addSelect(qb => this.selectPlayerLogin(qb, `g.FirstPlayerId`), `FirstPlayerLogin`)
      .addSelect(qb => this.selectPlayerLogin(qb, `g.SecondPlayerId`), `SecondPlayerLogin`)
      .addSelect(qb => this.selectAnswers(qb, `g.FirstPlayerId`), `FirstPlayerAnswers`)
      .addSelect(qb => this.selectAnswers(qb, `g.SecondPlayerId`), `SecondPlayerAnswers`)
      .addSelect(qb => this.selectQuestions(qb, gameId), `Questions`)
      .from(GameEntity, "g")
      .where(`g.GameId = :gameId`, { gameId })
      .getRawOne()

    return this.createGameOutputModel(result)
  }

  async getQuestions(query: GetQuestionsQueryInputModel, userId: string): Promise<IQuestionsOutputModel> {
    const pageSize = Number(query.pageSize) || PAGE_SIZE_DEFAULT
    const pageNumber = Number(query.pageNumber) || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const sortDirection = query.sortDirection === SortDirection.Asc ? SortDirectionOrm.Asc : SortDirectionOrm.Desc
    const offset = (pageNumber - 1) * pageSize

    const [questions, totalCount] = await this.dataSource.createQueryBuilder()
      .from(QuestionEntity, "q")
      .orderBy(`q."${sortBy}"`, sortDirection)
      .limit(pageSize)
      .offset(offset)
      .getManyAndCount()

    const questionsView = this.createQuestionsView(questions)
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: questionsView
    }

  }


  private createQuestionsView(questions: any[]) {
    return questions.map(question => {
      return {
        id: question.QuestionId,
        body: question.Body,
        correctAnswers: question.CorrectAnswers,
        published: question.Published,
        createdAt: question.CreatedAt,
        updatedAt: question.UpdatedAt,
      }
    })
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

  private selectQuestions(qb: SelectQueryBuilder<any>, gameId: string) {
    return qb.select(`json_agg(to_jsonb("questions")) as "questions"`)
      .from(qb => {
        return qb
          .select([
            `qu.QuestionId as "id"`,
            `qu.Body as "body"`
          ])
          .from(QuestionEntity, "qu")
          .where(`qu.UserId = :gameId`, { gameId })
          .orderBy(`qu."CreatedAt"`, "DESC")
      }, "questions")

  }

  private createGameOutputModel(rawGameView: any) {
    return {
      id: rawGameView.GameId,
      firstPlayerProgress: {
        answers: rawGameView.FirstPlayerAnswers,
        player: {
          id: rawGameView.FirstPlayerId,
          login: rawGameView.FirstPlayerLogin,
        },
        score: rawGameView.FirstPlayerScore
      },
      secondPlayerProgress: {
        answers: rawGameView.SecondPlayerAnswers,
        player: {
          id: rawGameView.SecondPlayerId,
          login: rawGameView.SecondPlayerLogin,
        },
        score: rawGameView.SecondPlayerScore
      },
      questions: rawGameView.Questions,
      status: rawGameView.Status,
      pairCreatedDate: rawGameView.PairCreatedDate,
      startGameDate: rawGameView.StartGameDate,
      finishGameDate: rawGameView.FinishGameDate,
    }
  }
}