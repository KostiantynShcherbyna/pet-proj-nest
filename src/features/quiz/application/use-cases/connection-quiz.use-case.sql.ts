import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { QuizRepositoryOrm } from "../../repository/typeorm/quiz.repository.orm"
import { Contract } from "../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import { UsersRepositoryOrm } from "../../../sa/repository/typeorm/users.repository.orm"
import { Game, StatusEnum } from "../entities/typeorm/game"
import { Answer } from "../entities/typeorm/answer"
import { randomUUID } from "crypto"
import { DataSource } from "typeorm"
import { Question } from "../entities/typeorm/question"

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

    const randomQuestionIds = await this.quizRepository.getQuestionIdsForConnect(true)
    if (!randomQuestionIds) return new Contract(null, ErrorEnums.FAIL_LOGIC)

    const createdDate = new Date(Date.now()).toISOString()

    const newGame = new Game()
    newGame.FirstPlayerId = command.userId
    newGame.PairCreatedDate = createdDate
    newGame.Questions = randomQuestionIds

    const nwGame = await this.dataSource.manager.transaction(async manager => {
      return await this.quizRepository.saveEntity(newGame, manager)
    })

    return new Contract(nwGame.GameId, null)
  }

}