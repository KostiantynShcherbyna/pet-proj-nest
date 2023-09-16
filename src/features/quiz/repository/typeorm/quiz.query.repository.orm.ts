import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { Column, DataSource, SelectQueryBuilder } from "typeorm"
import {
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT, SORT_BY_DEFAULT,
  SORT_BY_DEFAULT_SQL,
  SortDirection,
  SortDirectionOrm
} from "../../../../infrastructure/utils/constants"
import { GetQuestionsQueryInputModel } from "../../../sa/api/models/input/quiz/get-questions.query.input-model"
import { Question } from "../../application/entities/typeorm/question"
import { IQuestionsOutputModel } from "../../../sa/api/models/output/get-questions.output-model"
import { Game, QuizStatusEnum } from "../../application/entities/typeorm/game"
import { AccountEntity } from "../../../sa/application/entities/sql/account.entity"
import { Answer } from "../../application/entities/typeorm/answer"
import { Contract } from "../../../../infrastructure/utils/contract"
import { IInsertQuestionOutputModel } from "../../../sa/api/models/output/insert-question.output-model"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"

export interface IQuestionDto {
  questionId: string
  body: string
}

export interface IGetGameByIdOutputModel {
  id: string
  firstPlayerProgress: {
    answers: string[]
    player: { id: string, login: string }
    score: number
  }
  secondPlayerProgress: {
    answers: string[]
    player: { id: string, login: string } | null
    score: number
  }
  questions: IQuestionDto[] | null
  status: string
  pairCreatedDate: string
  startGameDate: string
  finishGameDate: string
}

@Injectable()
export class QuizQueryRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
  ) {
  }

  async getAnswer(answerId: string): Promise<Answer | null> {
    const result = await this.dataSource.createQueryBuilder(Answer, "a")
      .select([`a.answerId`, `a.answerStatus`, `a.addedAt`])
      .where(`a.answerId = :answerId`, { answerId })
      .getOne()

    return result ? result : null
  }

  async getGame(gameId?: string, userId?: string) {
    const qb = this.dataSource.createQueryBuilder(Game, "g")
      .addSelect(qb => this.selectPlayerLogin(qb, `g.firstPlayerId`), `g_firstPlayerLogin`)
      .addSelect(qb => this.selectPlayerLogin(qb, `g.secondPlayerId`), `g_secondPlayerLogin`)
      .addSelect(qb => this.selectAnswers(qb, `g.firstPlayerId`), `g_firstPlayerAnswers`)
      .addSelect(qb => this.selectAnswers(qb, `g.secondPlayerId`), `g_secondPlayerAnswers`)
    if (gameId) qb.where(`g.firstPlayerId = :userId or g.secondPlayerId = :userId`, { userId })
    if (userId) qb.where(`g.gameId = :gameId`, { gameId })
    const game = await qb.getRawOne()

    let questions: IQuestionDto[] = []
    if (game.g_questionIds.length) {
      questions = await this.dataSource.createQueryBuilder(Question, "q")
        .select([`q.questionId`, `q.body`])
        .where(`q.questionId in (:...questionIds)`, { questionIds: game.g_questionIds })
        .getRawMany()
    }

    return qb ? this.createGameOutputModel(qb, questions) : null
  }

  async getMyCurrentGame(userId: string): Promise<Contract<IGetGameByIdOutputModel | null>> {
    const game = await this.dataSource.createQueryBuilder(Game, "g")
      .addSelect(qb => this.selectPlayerLogin(qb, `g.firstPlayerId`), `g_firstPlayerLogin`)
      .addSelect(qb => this.selectPlayerLogin(qb, `g.secondPlayerId`), `g_secondPlayerLogin`)
      .addSelect(qb => this.selectAnswers(qb, `g.firstPlayerId`), `g_firstPlayerAnswers`)
      .addSelect(qb => this.selectAnswers(qb, `g.secondPlayerId`), `g_secondPlayerAnswers`)
      // .where(`g.firstPlayerId = :userId or g.secondPlayerId = :userId`, { userId })
      .where(`g.status = :pending or g.status = :active`, {
        pending: QuizStatusEnum.PendingSecondPlayer,
        active: QuizStatusEnum.Active
      })
      .getRawOne()

    if (!game) return new Contract(null, null)
    if (!game.g_secondPlayerId && game.g_firstPlayerId !== userId)
      return new Contract(null, ErrorEnums.FOREIGN_GAME)
    if (game.g_secondPlayerId && game.g_firstPlayerId !== userId && game.g_secondPlayerId !== userId)
      return new Contract(null, ErrorEnums.FOREIGN_GAME)

    let questions: IQuestionDto[] = []
    if (game.g_questionIds.length) {
      questions = await this.dataSource.createQueryBuilder(Question, "q")
        .select([`q.questionId`, `q.body`])
        .where(`q.questionId in (:...questionIds)`, { questionIds: game.g_questionIds })
        .getRawMany()
    }

    return game
      ? new Contract(this.createGameOutputModel(game, questions), null)
      : new Contract(null, null)
  }

  async getGameById(gameId: string, userId: string): Promise<Contract<IGetGameByIdOutputModel | null>> {
    const game = await this.dataSource.createQueryBuilder(Game, "g")
      .addSelect(qb => this.selectPlayerLogin(qb, `g.firstPlayerId`), `g_firstPlayerLogin`)
      .addSelect(qb => this.selectPlayerLogin(qb, `g.secondPlayerId`), `g_secondPlayerLogin`)
      .addSelect(qb => this.selectAnswers(qb, `g.firstPlayerId`), `g_firstPlayerAnswers`)
      .addSelect(qb => this.selectAnswers(qb, `g.secondPlayerId`), `g_secondPlayerAnswers`)
      .where(`g.gameId = :gameId`, { gameId })
      .getRawOne()

    if (!game) return new Contract(null, null)
    if (!game.g_secondPlayerId && game.g_firstPlayerId !== userId)
      return new Contract(null, ErrorEnums.FOREIGN_GAME)
    if (game.g_secondPlayerId && game.g_firstPlayerId !== userId && game.g_secondPlayerId !== userId)
      return new Contract(null, ErrorEnums.FOREIGN_GAME)

    let questions: IQuestionDto[] = []
    if (game.g_questionIds.length) {
      questions = await this.dataSource.createQueryBuilder(Question, "q")
        .select([`q.questionId as "id"`, `q.body as "body"`])
        .where(`q.questionId in (:...questionIds)`, { questionIds: game.g_questionIds })
        .getRawMany()
    }

    return game
      ? new Contract(this.createGameOutputModel(game, questions), null)
      : new Contract(null, null)
  }

  async getQuestions(query: GetQuestionsQueryInputModel): Promise<Contract<IQuestionsOutputModel | null>> {
    const pageSize = Number(query.pageSize) || PAGE_SIZE_DEFAULT
    const pageNumber = Number(query.pageNumber) || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy || SORT_BY_DEFAULT
    const sortDirection = query.sortDirection === SortDirection.Asc ? SortDirectionOrm.Asc : SortDirectionOrm.Desc
    const offset = (pageNumber - 1) * pageSize

    const [questions, totalCount] = await this.dataSource.createQueryBuilder(Question, "q")
      .orderBy(`q.${sortBy}`, sortDirection)
      .limit(pageSize)
      .offset(offset)
      .getManyAndCount()

    const questionsOutputModel = this.createQuestionsOutputModel(questions)
    const pagesCount = Math.ceil(totalCount / pageSize)

    return new Contract({
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: questionsOutputModel
    }, null)

  }

  async getQuestion(questionId: string): Promise<Question | null> {
    let question = await this.dataSource.createQueryBuilder(Question, "q")
      .select([
        `q.questionId as "id"`,
        `q.body as "body"`,
        `q.published as "published"`,
        `q.createdAt as "createdAt"`,
        `q.updatedAt as "updatedAt"`,
        `q.correctAnswers as "correctAnswers"`
      ])
      .where(`q.questionId = :questionId`, { questionId })
      .getRawOne()
    return question ? question : null
  }


  private createQuestionsOutputModel(questions: Question[]): IInsertQuestionOutputModel[] {
    return questions.map(question => {
      return {
        id: question.questionId,
        body: question.body,
        correctAnswers: question.correctAnswers,
        published: question.published,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
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
    return qb.select(`json_agg(to_jsonb("answers"))`)
      .from(qb => {
        return qb
          .select([
            `an.questionId as "questionId"`,
            `an.answerStatus as "answerStatus"`,
            `an.addedAt as "addedAt"`
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

  private createGameOutputModel3(gameDto: any, questions: Question[]) {
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

  private createGameOutputModel(gameDto: any, questions: IQuestionDto[]): IGetGameByIdOutputModel {
    const secondPlayer = gameDto.g_secondPlayerId
      ? { id: gameDto.g_secondPlayerId, login: gameDto.g_secondPlayerLogin } : null
    const trueQuestions = gameDto.g_status === QuizStatusEnum.Active || QuizStatusEnum.Finished
      ? questions : null
    // const trueQuestions = questions ? questions : null
    return {
      id: gameDto.g_gameId,
      firstPlayerProgress: {
        answers: gameDto.g_firstPlayerAnswers || [],
        player: {
          id: gameDto.g_firstPlayerId,
          login: gameDto.g_firstPlayerLogin
        },
        score: gameDto.g_firstPlayerScore
      },
      secondPlayerProgress: {
        answers: gameDto.g_secondPlayerAnswers || [],
        player: secondPlayer,
        score: gameDto.g_secondPlayerScore
      },
      questions: trueQuestions,
      status: gameDto.g_status,
      pairCreatedDate: gameDto.g_pairCreatedDate,
      startGameDate: gameDto.g_startGameDate,
      finishGameDate: gameDto.g_finishGameDate,
    }
  }
}