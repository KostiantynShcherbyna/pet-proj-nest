import { Controller, Get, Param, Post, UnauthorizedException, UseGuards } from "@nestjs/common"
import { AccessGuard } from "../../../infrastructure/guards/access.guard"
import { DeviceSession } from "../../../infrastructure/decorators/device-session.decorator"
import { DeviceSessionReqInputModel } from "../../auth/api/models/input/device-session.req.input-model"
import { QuizQueryRepositoryOrm } from "../repository/typeorm/quiz.query.repository.orm"
import { QuizRepositoryOrm } from "../repository/typeorm/quiz.repository.orm"
import { IdParamInputModelSql } from "./models/input/id.param.input-model"

@Controller(`pair-game-quiz/pairs`)
export class QuizControllerSql {
  constructor(
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
  async getGame(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Param() params: IdParamInputModelSql,
  ) {
    const userView = await this.quizQueryRepositorySql.getGameById(params.id, deviceSession.userId)
    if (userView === null) throw new UnauthorizedException()
    return userView
  }

  @Post(`connection`)
  @UseGuards(AccessGuard)
  async connection(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
  ) {
    const userView = await this.quizRepositorySql.connection(deviceSession.userId)
    if (userView === null) throw new UnauthorizedException()
    return userView
  }

  @Post(`my-current/answers`)
  @UseGuards(AccessGuard)
  async answers(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
  ) {
    const userView = await this.quizRepositorySql.createAnswers()
    if (userView === null) throw new UnauthorizedException()
    return userView
  }


}