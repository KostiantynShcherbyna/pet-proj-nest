import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { QuizRepositoryOrm } from "../../repository/typeorm/quiz.repository.orm"
import { Contract } from "../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import { UsersRepositoryOrm } from "../../../sa/repository/typeorm/users.repository.orm"
import { Game, QuizStatusEnum } from "../entities/typeorm/game"
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

    const userGame = await this.quizRepository.getCurrentGame(
      command.userId,
      QuizStatusEnum.PendingSecondPlayer,
      QuizStatusEnum.Active
    )
    if (userGame) return new Contract(null, ErrorEnums.GAME_WAITING_OR_STARTED)

    const pendingGame = await this.quizRepository.getPendingGame()

    const operationDate = new Date(Date.now()).toISOString()
    let finalGameId: string | null = null

    if (!pendingGame) {
      const randomQuestions = await this.quizRepository.getQuestions(true)
      if (randomQuestions === null) return new Contract(null, ErrorEnums.FAIL_LOGIC)
      const randomQuestionIds = randomQuestions?.map(question => question.questionId)

      const newGame = new Game()
      newGame.firstPlayerId = command.userId
      newGame.pairCreatedDate = operationDate
      newGame.questionIds = randomQuestionIds

      const nwGame = await this.dataSource.manager.transaction(async manager =>
        await manager.save(newGame))

      finalGameId = nwGame.gameId
    }
    if (pendingGame) {
      const updateGameDto = {
        secondPlayerId: command.userId,
        status: QuizStatusEnum.Active,
        startGameDate: operationDate
      }
      await this.dataSource.manager.transaction(async manager =>
        await manager.update(Game, { gameId: pendingGame.gameId }, updateGameDto))

      finalGameId = pendingGame.gameId
    }

    return new Contract(finalGameId, null)
  }

}