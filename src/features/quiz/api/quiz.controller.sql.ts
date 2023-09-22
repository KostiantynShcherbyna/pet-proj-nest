import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post, Query,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common"
import { AccessGuard } from "../../../infrastructure/guards/access.guard"
import { DeviceSession } from "../../../infrastructure/decorators/device-session.decorator"
import { DeviceSessionReqInputModel } from "../../auth/api/models/input/device-session.req.input-model"
import { QuizQueryRepositoryOrm } from "../repository/typeorm/quiz.query.repository.orm"
import { IdParamInputModelSql } from "./models/input/id.param.input-model"
import { CommandBus } from "@nestjs/cqrs"
import { ConnectionQuizCommandSql } from "../application/use-cases/connection-quiz.use-case.sql"
import { CreateAnswersQuizCommandSql } from "../application/use-cases/create-answers-quiz.use-case.sql"
import { ErrorEnums } from "../../../infrastructure/utils/error-enums"
import { callErrorMessage } from "../../../infrastructure/adapters/exception-message.adapter"
import { AnswerBodyInputModel } from "./models/input/answer.body.input-model"
import { query } from "express"
import { GetMyGamesQueryInputModel } from "./models/input/get-my-games.query.input-model.sql"
import { TopPlayersQueryInputModelSql } from "./models/input/top-players.query.input-model.sql"

@Controller(`pair-game-quiz`)
export class QuizControllerSql {
  constructor(
    private commandBus: CommandBus,
    protected quizQueryRepositorySql: QuizQueryRepositoryOrm,
  ) {
  }

  @Get(`pairs/my-current`)
  @UseGuards(AccessGuard)
  async getMyCurrentGame(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
  ) {
    const getContract = await this.quizQueryRepositorySql.getMyCurrentGame(deviceSession.userId)
    if (getContract.data === null) throw new NotFoundException()
    return getContract.data
  }

  @Get(`pairs/my`)
  @UseGuards(AccessGuard)
  async getMyGames(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Query() query: GetMyGamesQueryInputModel,
  ) {
    return await this.quizQueryRepositorySql.getMyGames(deviceSession.userId, query)
  }

  // @Get(`pairs/my/:id`)
  // @UseGuards(AccessGuard)
  // async getMyGames(
  //   @Param() param,
  //   @Query() query: GetMyGamesQueryInputModel,
  // ) {
  //   return await this.quizQueryRepositorySql.getMyGames(param.id, query)
  // }

  @Get(`users/my-statistic`)
  @UseGuards(AccessGuard)
  async getMyStatistic(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
  ) {
    return await this.quizQueryRepositorySql.getMyStatistic(deviceSession.userId)
  }

  // @Get(`users/my-statistic/:id`)
  // @UseGuards(AccessGuard)
  // async getMyStatistic(
  //   @Param() param,
  // ) {
  //   return await this.quizQueryRepositorySql.getMyStatistic(param.id)
  // }

  @Get(`users/top`)
  async getTop(
    @Query() query: TopPlayersQueryInputModelSql,
  ) {
    return await this.quizQueryRepositorySql.getTop(query)
  }

  @Get(`pairs/:id`)
  @UseGuards(AccessGuard)
  async getGameById(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Param() params: IdParamInputModelSql,
  ) {
    const getContract = await this.quizQueryRepositorySql.getGameById(params.id, deviceSession.userId)
    if (getContract.error === ErrorEnums.FOREIGN_GAME) throw new ForbiddenException()
    if (getContract.data === null) throw new NotFoundException()
    return getContract.data
  }

  @Post(`pairs/connection`)
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessGuard)
  async connection(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
  ) {
    const createContract = await this.commandBus.execute(
      new ConnectionQuizCommandSql(deviceSession.userId)
    )

    if (createContract.error === ErrorEnums.USER_NOT_FOUND)
      throw new UnauthorizedException(callErrorMessage(ErrorEnums.USER_NOT_FOUND, "id"))
    if (createContract.error === ErrorEnums.USER_EMAIL_NOT_CONFIRMED)
      throw new UnauthorizedException(callErrorMessage(ErrorEnums.USER_EMAIL_NOT_CONFIRMED, "id"))
    if (createContract.error === ErrorEnums.GAME_WAITING_OR_STARTED)
      throw new ForbiddenException(callErrorMessage(ErrorEnums.GAME_WAITING_OR_STARTED, "id"))
    if (createContract.error === ErrorEnums.FAIL_LOGIC)
      throw new ServiceUnavailableException()

    const getContract = await this.quizQueryRepositorySql.getGameById(createContract.data, deviceSession.userId)
    if (getContract.error === ErrorEnums.FOREIGN_GAME) throw new ForbiddenException()
    if (getContract.data === null) throw new NotFoundException()
    return getContract.data
  }

  @Post(`pairs/my-current/answers`)
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessGuard)
  async answers(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Body() body: AnswerBodyInputModel
  ) {
    const answersContract = await this.commandBus.execute(
      new CreateAnswersQuizCommandSql(deviceSession.userId, body.answer)
    )

    if (answersContract.error === ErrorEnums.USER_NOT_FOUND)
      throw new UnauthorizedException(callErrorMessage(ErrorEnums.USER_NOT_FOUND, "id"))
    if (answersContract.error === ErrorEnums.USER_EMAIL_NOT_CONFIRMED)
      throw new UnauthorizedException(callErrorMessage(ErrorEnums.USER_EMAIL_NOT_CONFIRMED, "id"))
    if (answersContract.error === ErrorEnums.GAME_NOT_STARTED) throw new ForbiddenException()
    if (answersContract.error === ErrorEnums.OVERDO_ANSWER) throw new ForbiddenException()
    if (answersContract.error === ErrorEnums.FAIL_LOGIC) throw new ServiceUnavailableException()

    const newAnswer = await this.quizQueryRepositorySql.getAnswer(answersContract.data)
    if (newAnswer === null) throw new ServiceUnavailableException()
    return newAnswer
  }


}