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

    const randomQuestionIds = await this.quizRepository.getQuestionEntities(true)
    if (!randomQuestionIds) return new Contract(null, ErrorEnums.FAIL_LOGIC)

    const createdDate = new Date(Date.now()).toISOString()

    const newGame = new GameEntity()
    newGame.FirstPlayerId = command.userId
    newGame.PairCreatedDate = createdDate
    newGame.QuestionIds = randomQuestionIds

    await this.dataSource.manager.transaction(async manager => {
      const nwGame: GameEntity = await this.quizRepository.saveEntity(newGame, manager)
    })

    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      await this.quizRepository.saveEntity(newGame, queryRunner)
      await queryRunner.commitTransaction()
    } catch (err) {
      console.log("ConnectionQuizSql", err)
      await queryRunner.rollbackTransaction()
    } finally {
      await queryRunner.release()
    }
    // try {
    //   await queryRunner.startTransaction()
    //   await this.quizRepository.saveEntity(newGame, queryRunner)
    //   const randomQuestions = await this.quizRepository.getQuestionEntities(newGame.GameId, true)
    //   if (!randomQuestions) {
    //     await queryRunner.rollbackTransaction()
    //     console.log("In ConnectionQuizSql randomQuestions is null")
    //     return new Contract(null, ErrorEnums.FAIL_LOGIC)
    //   }
    //   for (const question of randomQuestions) {
    //     question.GameIds.push(newGame.GameId)
    //     await this.quizRepository.saveEntity(question, queryRunner)
    //   }
    //   await queryRunner.commitTransaction()
    // } catch (err) {
    //   console.log("ConnectionQuizSql", err)
    //   await queryRunner.rollbackTransaction()
    // } finally {
    //   await queryRunner.release()
    // }

    // try {
    //   await this.dataSource.manager.transaction(async manager => {
    //     const newG = await manager.save<GameEntity>(newGame)
    //     const randomQuestions = await this.quizRepository.getQuestionEntities(newG.GameId, true)
    //
    //     if (randomQuestions) {
    //       for (const randomQuestion of randomQuestions) randomQuestion.GameIds.push(newG.GameId)
    //       await manager.save(QuestionEntity, randomQuestions)
    //     } else {
    //       throw new Error("randomQuestions is null")
    //     }
    //   })
    // } catch (err) {
    //   console.error("Ошибка в транзакции:", err)
    //
    // }


    return new Contract(newGame.GameId, null)
  }

}