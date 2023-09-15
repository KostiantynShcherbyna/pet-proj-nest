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

    const game = await this.quizRepository.getUserCurrentGame(
      command.userId, {
        pending: QuizStatusEnum.PendingSecondPlayer,
        active: QuizStatusEnum.Active
      })
    // if (game) return new Contract(null, ErrorEnums.GAME_CREATED_OR_STARTED)

    const randomQuestions = await this.quizRepository.getQuestions(true)
    // if (randomQuestions === null) return new Contract(null, ErrorEnums.FAIL_LOGIC)

    const randomQuestionIds = randomQuestions?.map(question => question.questionId)
    const createdDate = new Date(Date.now()).toISOString()

    const newGame = new Game()
    newGame.firstPlayerId = command.userId
    newGame.pairCreatedDate = createdDate
    newGame.questionIds = randomQuestionIds || []

    const nwGame = await this.dataSource.manager.transaction(async manager => {
      return await this.quizRepository.saveEntity(newGame, manager)
    })

    return new Contract(nwGame.gameId, null)
  }

}