import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { Column, DataSource, SelectQueryBuilder } from "typeorm"
import {
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT, SEARCH_LOGIN_TERM_DEFAULT, SORT_BY_DEFAULT,
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
import { GetPostsCommentsQueryInputModel } from "../../../blogs/api/models/input/get-posts-comments.query.input-model"
import { GetMyGamesQueryInputModel } from "../../api/models/input/get-my-games.query.input-model.sql"
import { Posts } from "../../../posts/application/entites/mongoose/posts.schema"

export interface IQuestionDto {
  questionId: string
  body: string
}

export interface IPlayerProgress {
  answers: string[]
  player: { id: string, login: string }
  score: number
}

export interface IGetGameByIdOutputModel {
  id: string
  firstPlayerProgress: IPlayerProgress
  secondPlayerProgress: IPlayerProgress | null
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
      .select([`a.questionId`, `a.answerStatus`, `a.addedAt`])
      .where(`a.answerId = :answerId`, { answerId })
      .getOne()

    return result ? result : null
  }

  async getMyCurrentGame(userId: string): Promise<Contract<IGetGameByIdOutputModel | null>> {
    const game = await this.dataSource.createQueryBuilder(Game, "g")
      .addSelect(qb => this.selectPlayerLogin(qb, `g.firstPlayerId`), `g_firstPlayerLogin`)
      .addSelect(qb => this.selectPlayerLogin(qb, `g.secondPlayerId`), `g_secondPlayerLogin`)
      .addSelect(qb => this.selectAnswers(qb, `g.firstPlayerId`), `g_firstPlayerAnswers`)
      .addSelect(qb => this.selectAnswers(qb, `g.secondPlayerId`), `g_secondPlayerAnswers`)
      .where(`g.firstPlayerId = :userId and (g.status = :pending or g.status = :active)`, {
        userId: userId,
        pending: QuizStatusEnum.PendingSecondPlayer,
        active: QuizStatusEnum.Active
      })
      .orWhere(`g.secondPlayerId = :userId and (g.status = :pending or g.status = :active)`, {
        userId: userId,
        pending: QuizStatusEnum.PendingSecondPlayer,
        active: QuizStatusEnum.Active
      })
      .getRawOne()

    if (!game) return new Contract(null, null)

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

  async getMyGames(userId: string, query: GetMyGamesQueryInputModel) {

    const pageSize = Number(query.pageSize) || PAGE_SIZE_DEFAULT
    const pageNumber = Number(query.pageNumber) || PAGE_NUMBER_DEFAULT
    const sortDirection = query.sortDirection === SortDirection.Asc ? SortDirectionOrm.Asc : SortDirectionOrm.Desc
    const sortBy = query.sortBy || SORT_BY_DEFAULT
    const offset = (pageNumber - 1) * pageSize

    const totalCount = await this.dataSource.createQueryBuilder(Game, "g")
      .where(`g.firstPlayerId = :userId`, { userId: userId })
      .orWhere(`g.secondPlayerId = :userId`, { userId: userId })
      .getCount()

    const rawGames = await this.dataSource.createQueryBuilder(Game, "g")
      .addSelect(qb => this.selectPlayerLogin(qb, `g.firstPlayerId`), `g_firstPlayerLogin`)
      .addSelect(qb => this.selectPlayerLogin(qb, `g.secondPlayerId`), `g_secondPlayerLogin`)
      .addSelect(qb => this.selectAnswers(qb, `g.firstPlayerId`), `g_firstPlayerAnswers`)
      .addSelect(qb => this.selectAnswers(qb, `g.secondPlayerId`), `g_secondPlayerAnswers`)
      .where(`g.firstPlayerId = :userId`, { userId: userId })
      .orWhere(`g.secondPlayerId = :userId`, { userId: userId })
      .orderBy(`g.${sortBy}`, sortDirection)
      .limit(pageSize)
      .offset(offset)
      .getRawMany()

    const gamesWithQuestions: any = []
    for (const game of rawGames) {
      let questions: IQuestionDto[] = []
      if (game.g_questionIds.length) {
        questions = await this.dataSource.createQueryBuilder(Question, "q")
          .select([`q.questionId as "id"`, `q.body as "body"`])
          .where(`q.questionId in (:...questionIds)`, { questionIds: game.g_questionIds })
          .getRawMany()
      }
      const modifyGame = { ...game, questions }
      gamesWithQuestions.push(modifyGame)
    }

    const gameViews = this.createGameViews(gamesWithQuestions)

    const pagesCount = Math.ceil(totalCount / pageSize)
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount),
      items: gameViews
    }
  }

  async getMyStatistic(userId: string) {

    const gamesCount = await this.dataSource.createQueryBuilder(Game, "g")
      .where(`g.firstPlayerId = :userId`, { userId: userId })
      .orWhere(`g.secondPlayerId = :userId`, { userId: userId })
      .getCount()
    const sumScore = await this.dataSource.createQueryBuilder(Game, "g")
      .select("SUM(g.firstPlayerScore)", "firstPlayerScoreSum")
      .addSelect("SUM(g.secondPlayerScore)", "secondPlayerScoreSum")
      .addSelect("ROUND(AVG(g.firstPlayerScore), 2)", "firstPlayerScoreAvg")
      .addSelect("ROUND(AVG(g.secondPlayerScore), 2)", "secondPlayerScoreAvg")
      .where(`g.firstPlayerId = :userId`, { userId: userId })
      .orWhere(`g.secondPlayerId = :userId`, { userId: userId })
      .getRawOne()
    const winsCount = await this.dataSource.createQueryBuilder(Game, "g")
      .where(`g.firstPlayerId = :userId and g.firstPlayerScore > g.secondPlayerScore`, { userId: userId })
      .orWhere(`g.secondPlayerId = :userId and g.secondPlayerScore > g.firstPlayerScore`, { userId: userId })
      .getCount()
    const lossesCount = await this.dataSource.createQueryBuilder(Game, "g")
      .where(`g.firstPlayerId = :userId and g.firstPlayerScore < g.secondPlayerScore`, { userId: userId })
      .orWhere(`g.secondPlayerId = :userId and g.secondPlayerScore < g.firstPlayerScore`, { userId: userId })
      .getCount()
    const drawsCount = await this.dataSource.createQueryBuilder(Game, "g")
      .where(`g.firstPlayerId = :userId and g.firstPlayerScore = g.secondPlayerScore`, { userId: userId })
      .orWhere(`g.secondPlayerId = :userId and g.secondPlayerScore = g.firstPlayerScore`, { userId: userId })
      .getCount()
    // const winsCount = await this.dataSource.createQueryBuilder(Game, "g")
    //   .select("SUM(firstPlayerScore)", "firstPlayerScoreSum")
    //   .addSelect("SUM(secondPlayerScore)", "secondPlayerScoreSum")
    //   .where(`g.firstPlayerId = :userId`, { userId: userId })
    //   .orWhere(`g.secondPlayerId = :userId`, { userId: userId })
    //   .getRawOne()
    //

    // const avgScores = await this.dataSource.createQueryBuilder(Game, "g")
    //   .select("ROUND(AVG(firstPlayerScore), 2)", "firstPlayerScore")
    //   .addSelect("ROUND(AVG(secondPlayerScore), 2)", "secondPlayerScore")
    //   .where(`g.firstPlayerId = :userId`, { userId: userId })
    //   .orWhere(`g.secondPlayerId = :userId`, { userId: userId })
    //   .getRawOne()

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

  private sumScore(qb: SelectQueryBuilder<any>, userId: string) {
    return qb
      .select(`count(*)`)
      .where(`g.firstPlayerId = :userId and g.firstPlayerScore > g.secondPlayerScore`, { userId: userId })
      .orWhere(`g.secondPlayerId = :userId and g.secondPlayerScore > g.firstPlayerScore`, { userId: userId })
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
          .orderBy(`an."addedAt"`, "ASC")
      }, "answers")

  }


  private createGameOutputModel(gameDto: any, questions: IQuestionDto[]): IGetGameByIdOutputModel {
    const secondPlayer = gameDto.g_secondPlayerId
      ? { id: gameDto.g_secondPlayerId, login: gameDto.g_secondPlayerLogin } : null
    const trueQuestions = gameDto.g_status === QuizStatusEnum.Active || gameDto.g_status === QuizStatusEnum.Finished
      ? questions : null
    const secondPlayerProgress: any = gameDto.g_secondPlayerId
      ? { answers: gameDto.g_secondPlayerAnswers || [], player: secondPlayer, score: gameDto.g_secondPlayerScore }
      : null
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
      secondPlayerProgress: secondPlayerProgress,
      questions: trueQuestions,
      status: gameDto.g_status,
      pairCreatedDate: gameDto.g_pairCreatedDate,
      startGameDate: gameDto.g_startGameDate,
      finishGameDate: gameDto.g_finishGameDate,
    }
  }

  private createGameViews(gamesDto: any): IGetGameByIdOutputModel[] {

    return gamesDto.map(gameDto => {
      const secondPlayer = gameDto.g_secondPlayerId
        ? { id: gameDto.g_secondPlayerId, login: gameDto.g_secondPlayerLogin } : null
      const trueQuestions = gameDto.g_status === QuizStatusEnum.Active || gameDto.g_status === QuizStatusEnum.Finished
        ? gameDto.questions : null
      const secondPlayerProgress: any = gameDto.g_secondPlayerId
        ? { answers: gameDto.g_secondPlayerAnswers || [], player: secondPlayer, score: gameDto.g_secondPlayerScore }
        : null
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
        secondPlayerProgress: secondPlayerProgress,
        questions: trueQuestions,
        status: gameDto.g_status,
        pairCreatedDate: gameDto.g_pairCreatedDate,
        startGameDate: gameDto.g_startGameDate,
        finishGameDate: gameDto.g_finishGameDate,
      }
    })


  }
}