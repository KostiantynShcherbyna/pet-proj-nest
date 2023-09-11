import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { QuizRepositoryOrm } from "../../repository/typeorm/quiz.repository.orm"
import { Contract } from "../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import { UsersRepositoryOrm } from "../../../sa/repository/typeorm/users.repository.orm"
import { GameEntity, StatusEnum } from "../entities/typeorm/game.entity"
import { AnswerEntity } from "../entities/typeorm/answer.entity"
import { randomUUID } from "crypto"
import { DataSource } from "typeorm"
import { QuestionEntity } from "../entities/typeorm/question.entity"

export class ConnectionQuizCommandSql {
  constructor(
    public userId: string,
  ) {
  }
}

@CommandHandler(ConnectionQuizCommandSql)
export class ConnectionQuizSql implements ICommandHandler<ConnectionQuizCommandSql> {
  constructor(
    protected dataSource: DataSource,
    protected quizRepository: QuizRepositoryOrm,
    protected usersRepository: UsersRepositoryOrm,
  ) {
  }

  async execute(command: ConnectionQuizCommandSql): Promise<Contract<string | null>> {
    const foundUser = await this.usersRepository.findUserByUserId(command.userId)
    if (foundUser === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (foundUser.isConfirmed === false) return new Contract(null, ErrorEnums.USER_EMAIL_NOT_CONFIRMED)

    const game = await this.quizRepository.getUserCurrentGame(
      command.userId, {
        pending: StatusEnum.PendingSecondPlayer,
        active: StatusEnum.Active
      })
    if (game) return new Contract(null, ErrorEnums.GAME_CREATED_OR_STARTED)

    const createdDate = new Date(Date.now()).toISOString()

    const newGame = new GameEntity()
    newGame.FirstPlayerId = command.userId
    newGame.PairCreatedDate = createdDate

    await this.dataSource.manager.transaction(async manager => {
      const newG = await manager.save<GameEntity>(newGame)
      const randomQuestions = await this.quizRepository.getQuestionEntities(newG.GameId, true)

      if (randomQuestions) {
        for (const randomQuestion of randomQuestions) randomQuestion.GameIds.push(newG.GameId)
        await manager.save(QuestionEntity, randomQuestions)
      }
    })

    const questionIds = await this.quizRepository.getQuestionIds()
    if (!questionIds) return new Contract(null, ErrorEnums.FAIL_LOGIC)


    const newGameId = await this.quizRepository.createGame(command.userId, createdDate, questionIds)

    return new Contract(newGameId, null)
  }

}