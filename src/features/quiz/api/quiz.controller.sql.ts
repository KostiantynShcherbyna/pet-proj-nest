import {
  Body,
  Controller,
  ForbiddenException,
  Get, InternalServerErrorException,
  NotFoundException,
  Param,
  Post, ServiceUnavailableException,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common"
import { AccessGuard } from "../../../infrastructure/guards/access.guard"
import { DeviceSession } from "../../../infrastructure/decorators/device-session.decorator"
import { DeviceSessionReqInputModel } from "../../auth/api/models/input/device-session.req.input-model"
import { QuizQueryRepositoryOrm } from "../repository/typeorm/quiz.query.repository.orm"
import { QuizRepositoryOrm } from "../repository/typeorm/quiz.repository.orm"
import { IdParamInputModelSql } from "./models/input/id.param.input-model"
import { CommandBus } from "@nestjs/cqrs"
import { ConnectionQuizCommandSql } from "../application/use-cases/connection-quiz.use-case.sql"
import { CreateAnswersQuizCommandSql } from "../application/use-cases/create-answers-quiz.use-case.sql"
import { ErrorEnums } from "../../../infrastructure/utils/error-enums"
import { callErrorMessage } from "../../../infrastructure/adapters/exception-message.adapter"
import { AnswerBodyInputModel } from "./models/input/answer.body.input-model"

@Controller(`pair-game-quiz/pairs`)
export class QuizControllerSql {
  constructor(
    private commandBus: CommandBus,
    protected quizQueryRepositorySql: QuizQueryRepositoryOrm,
    protected quizRepositorySql: QuizRepositoryOrm,
  ) {
  }

  @Get(`my-current`)
  @UseGuards(AccessGuard)
  async getMyCurrentGame(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
  ) {
    const userView = await this.quizQueryRepositorySql.getMyCurrentGame(deviceSession.userId)
    if (userView === null) throw new UnauthorizedException()
    return userView
  }

  @Get(`:id`)
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

  @Post(`connection`)
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

  @Post(`my-current/answers`)
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