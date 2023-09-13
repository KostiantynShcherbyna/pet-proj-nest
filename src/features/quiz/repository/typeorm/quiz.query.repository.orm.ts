import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { Column, DataSource, SelectQueryBuilder } from "typeorm"
import {
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
  SORT_BY_DEFAULT_SQL,
  SortDirection,
  SortDirectionOrm
} from "../../../../infrastructure/utils/constants"
import { GetQuestionsQueryInputModel } from "../../../sa/api/models/input/quiz/get-questions.query.input-model"
import { Question } from "../../application/entities/typeorm/question"
import { IQuestionsOutputModel } from "../../../sa/api/models/output/get-questions.output-model"
import { Game, StatusEnum } from "../../application/entities/typeorm/game"
import { AccountEntity } from "../../../sa/application/entities/sql/account.entity"
import { Answer } from "../../application/entities/typeorm/answer"

export interface IQuestionDto {
  questionId: string
  body: string
}

@Injectable()
export class QuizQueryRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
  ) {
  }

  async getAnswer(answerId: string) {
    const result = await this.dataSource.createQueryBuilder()
      .select([
        `a.AnswerId as "answerId"`,
        `a.AnswerStatus as "answerStatus"`,
        `a.AddedAd as "addedAt"`
      ])
      .from(Answer, "a")
      .where(`a.AnswerId = :answerId`, { answerId })
      .getRawOne()

    return result ? result : null
  }

  async getMyCurrentGame(userId: string) {
    const game = await this.dataSource.createQueryBuilder(Game, "g")
      // .addSelect(qb => this.selectPlayerLogin1(qb), `firstPlayerLogin`)
      // .addSelect(qb => this.selectPlayerLogin2(qb), `secondPlayerLogin`)
      .addSelect(qb => this.selectAnswers(qb, `g.firstPlayerId`), `firstPlayerAnswers`)
      .addSelect(qb => this.selectAnswers(qb, `g.secondPlayerId`), `secondPlayerAnswers`)
      .where(`g.firstPlayerId = :userId or g.secondPlayerId = :userId`, { userId })
      .getOne()

    const questions = await this.dataSource.createQueryBuilder(Question, "q")
      .select([`q.questionId`, `q.body`])
      .where(`q.questionId in (:...questionIds)`, { questionIds: game?.questionIds })
      .getOne()

    // @ts-ignore
    return game ? this.createGameOutputModel(game, questions) : null
  }

  async getGameById2(gameId: string) {
    const game = await this.dataSource.createQueryBuilder(Game, "g")
      .where(`g.gameId = :gameId`, { gameId })
      .getOne()
    if (game === null) return null

    const firstPlayerLogin = await this.dataSource.createQueryBuilder(AccountEntity, "a")
      .where(`a.UserId = :userId`, { userId: game.firstPlayerId })
      .getOne()
    const firstPlayerAnswers = await this.dataSource.createQueryBuilder(Answer, "a")
      .where(`a.userId = :userId`, { userId: game.secondPlayerId })
      .getMany()

    let secondPlayerLogin: AccountEntity | null = null
    let secondPlayerAnswers: Answer[] | null = null
    if (game.secondPlayerId) {
      secondPlayerLogin = await this.dataSource.createQueryBuilder(AccountEntity, "a")
        .where(`a.UserId = :userId`, { userId: game.secondPlayerId })
        .getOne()
      secondPlayerAnswers = await this.dataSource.createQueryBuilder(Answer, "a")
        .where(`a.userId = :userId`, { userId: game.secondPlayerId })
        .getMany()
    }
    const gameDto = {
      ...game,
      firstPlayerLogin: firstPlayerLogin?.Login || null,
      firstPlayerAnswers: firstPlayerAnswers,
      secondPlayerLogin: secondPlayerLogin?.Login || null,
      secondPlayerAnswers: secondPlayerAnswers || []
    }

    if (!game.questionIds.length) return this.createGameOutputModel(gameDto, [])

    const questions = await this.dataSource.createQueryBuilder(Question, "q")
      .where(`q.questionId in (:...questionIds)`, { questionIds: game.questionIds })
      .getMany()

    return this.createGameOutputModel(gameDto, questions)
  }

  async getGameById(gameId: string) {
    const game = await this.dataSource.createQueryBuilder(Game, "g")
      .select([
        `g.gameId as "gameId"`,
        `g.firstPlayerId as "firstPlayerId"`,
        `g.secondPlayerId as "secondPlayerId"`,
        `g.firstPlayerScore as "firstPlayerScore"`,
        `g.secondPlayerScore as "secondPlayerScore"`,
        `g.firstPlayerAnswerNumber as "firstPlayerAnswerNumber"`,
        `g.secondPlayerAnswerNumber as "secondPlayerAnswerNumber"`,
        `g.status as "status"`,
        `g.pairCreatedDate as "pairCreatedDate"`,
        `g.startGameDate as "startGameDate"`,
        `g.finishGameDate as "finishGameDate"`,
        `g.questionIds as "questionIds"`
      ])
      .addSelect(qb => this.selectPlayerLogin(qb, `g.firstPlayerId`), `firstPlayerLogin`)
      .addSelect(qb => this.selectPlayerLogin(qb, `g.secondPlayerId`), `secondPlayerLogin`)
      .addSelect(qb => this.selectAnswers(qb, `g.firstPlayerId`), `firstPlayerAnswers`)
      .addSelect(qb => this.selectAnswers(qb, `g.secondPlayerId`), `secondPlayerAnswers`)
      .where(`g.gameId = :gameId`, { gameId })
      .getRawOne()

    let questions: IQuestionDto[] = []
    if (game.questionIds.length) {
      questions = await this.dataSource.createQueryBuilder(Question, "q")
        .select([`q.questionId as "questionId"`, `q.body as "body"`])
        .where(`q.questionId in (:...questionIds)`, { questionIds: game.questionIds })
        .getRawMany()
    }

    return game ? this.createGameOutputModel2(game, questions) : null
  }

  async getQuestions(query: GetQuestionsQueryInputModel, userId: string): Promise<IQuestionsOutputModel> {
    const pageSize = Number(query.pageSize) || PAGE_SIZE_DEFAULT
    const pageNumber = Number(query.pageNumber) || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const sortDirection = query.sortDirection === SortDirection.Asc ? SortDirectionOrm.Asc : SortDirectionOrm.Desc
    const offset = (pageNumber - 1) * pageSize

    const [questions, totalCount] = await this.dataSource.createQueryBuilder()
      .from(Question, "q")
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

  async getQuestion(questionId: string) {
    let question = await this.dataSource.createQueryBuilder(Question, "q")
      .where(`q.questionId = :questionId`, { questionId })
      .getOne()
    return question ? { id: questionId, ...question } : null
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
      .select(`a.Login`)
      .from(AccountEntity, "a")
      .where(`a.UserId = ${userId}`)
  }

  private selectPlayerLogin1(qb: SelectQueryBuilder<any>) {
    return qb
      .select(`a.Login`)
      .from(AccountEntity, "a")
      .where(`a.UserId = g.firstPlayerId`)
  }

  private selectPlayerLogin2(qb: SelectQueryBuilder<any>) {
    return qb
      .select(`a.Login`)
      .from(AccountEntity, "a")
      .where(`a.UserId = g.secondPlayerId`)
  }

  private selectAnswers(qb: SelectQueryBuilder<any>, userId: string) {
    return qb.select(`json_agg(to_jsonb("answers")) as "answers"`)
      .from(qb => {
        return qb
          .select([
            `an.questionId`,
            `an.answerStatus`,
            `an.addedAt`
          ])
          .from(Answer, "an")
          .where(`an.userId = ${userId}`)
          .andWhere(`an.gameId = g.gameId`)
          .groupBy(`an.questionId, an.answerStatus, an.addedAt`)
          .orderBy(`an.addedAt`, "DESC")
      }, "answers")

  }

  private selectQuestions(qb: SelectQueryBuilder<any>) {
    return qb.select(`json_agg(to_jsonb("questions")) as "questions"`)
      .from(qb => {
        return qb
          .select([`q.questionId`, `q.body`])
          .from(Question, "q")
          .where(`q.questionId in (:...g.questionIds)`)
          .orderBy(`q."createdAt"`, "DESC")
      }, "questions")
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

  // private selectQuestions(qb: SelectQueryBuilder<any>, gameId: string) {
  //   return qb.select(`json_agg(to_jsonb("questions")) as "questions"`)
  //     .from(qb => {
  //       return qb
  //         .select([
  //           `qu.QuestionId as "id"`,
  //           `qu.Body as "body"`
  //         ])
  //         .from(QuestionEntity, "qu")
  //         .where(`qu.GameId = :gameId`, { gameId })
  //         .orderBy(`qu."CreatedAt"`, "DESC")
  //     }, "questions")
  // }

  // private selectQuestions2(qb: SelectQueryBuilder<any>, gameId: string) {
  //   return qb.select(`json_agg(to_jsonb("questions")) as "questions"`)
  //     .from(qb => {
  //       return qb
  //         .select([
  //           `qu.QuestionId as "id"`,
  //           `qu.Body as "body"`
  //         ])
  //         .from(QuestionEntity, "qu")
  //         .where(`qu.GameId = ${gameId}`)
  //         .orderBy(`qu."CreatedAt"`, "DESC")
  //     }, "questions")
  // }

  private createGameOutputModel(gameDto: any, questions: Question[]) {
    return {
      id: gameDto.gameId,
      firstPlayerProgress: {
        answers: gameDto.firstPlayerAnswers,
        player: {
          id: gameDto.firstPlayerId,
          login: gameDto.firstPlayerLogin
        },
        score: gameDto.firstPlayerScore
      },
      secondPlayerProgress: {
        answers: gameDto.secondPlayerAnswers,
        player: {
          id: gameDto.secondPlayerId,
          login: gameDto.secondPlayerLogin,
        },
        score: gameDto.secondPlayerScore
      },
      questions: questions,
      status: gameDto.status,
      pairCreatedDate: gameDto.pairCreatedDate,
      startGameDate: gameDto.startGameDate,
      finishGameDate: gameDto.finishGameDate,
    }
  }

  private createGameOutputModel2(gameDto: any, questions: IQuestionDto[]) {
    return {
      id: gameDto.gameId,
      firstPlayerProgress: {
        answers: gameDto.firstPlayerAnswers,
        player: {
          id: gameDto.firstPlayerId,
          login: gameDto.firstPlayerLogin
        },
        score: gameDto.firstPlayerScore
      },
      secondPlayerProgress: {
        answers: gameDto.secondPlayerAnswers,
        player: {
          id: gameDto.secondPlayerId,
          login: gameDto.secondPlayerLogin,
        },
        score: gameDto.secondPlayerScore
      },
      questions: questions,
      status: gameDto.status,
      pairCreatedDate: gameDto.pairCreatedDate,
      startGameDate: gameDto.startGameDate,
      finishGameDate: gameDto.finishGameDate,
    }
  }
}