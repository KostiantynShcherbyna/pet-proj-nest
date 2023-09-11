import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { QuizRepositoryOrm } from "../../repository/typeorm/quiz.repository.orm"
import { Contract } from "../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import { UsersRepositoryOrm } from "../../../sa/repository/typeorm/users.repository.orm"
import { GameEntity, StatusEnum } from "../entities/typeorm/game.entity"
import { AnswerEntity, AnswerStatusEnum } from "../entities/typeorm/answer.entity"
import { Column, DataSource } from "typeorm"
import { randomUUID } from "crypto"

export class CreateAnswersQuizCommandSql {
  constructor(
    public userId: string,
    public answer: string,
  ) {
  }
}

@CommandHandler(CreateAnswersQuizCommandSql)
export class CreateAnswersQuizSql implements ICommandHandler<CreateAnswersQuizCommandSql> {
  constructor(
    protected dataSource: DataSource,
    protected quizRepository: QuizRepositoryOrm,
    protected usersRepository: UsersRepositoryOrm,
  ) {
  }

  async execute(command: CreateAnswersQuizCommandSql) {
    const foundUser = await this.usersRepository.findUserByUserId(command.userId)
    if (foundUser === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (foundUser.isConfirmed === false) return new Contract(null, ErrorEnums.USER_EMAIL_NOT_CONFIRMED)

    const game = await this.quizRepository.getUserCurrentGame(
      command.userId, {
        pending: "",
        active: StatusEnum.Active
      })
    if (!game) return new Contract(null, ErrorEnums.GAME_NOT_STARTED)

    const answerNumber = game.firstPlayerId = command.userId
      ? game.firstPlayerAnswerNumber
      : game.secondPlayerAnswerNumber

    // const questions = await this.quizRepository.getQuestionIds(game.id)
    // if (!questions) return new Contract(null, ErrorEnums.FAIL_LOGIC)

    const question = questions[answerNumber]
    const answerStatus = question.correctAnswers.includes(command.answer)
      ? AnswerStatusEnum.Correct
      : AnswerStatusEnum.Incorrect

    const setPlayerAnswerNumber = command.userId === game.firstPlayerId
      ? { FirstPlayerAnswerNumber: () => "FirstPlayerAnswerNumber + 1" }
      : { SecondPlayerAnswerNumber: () => "SecondPlayerAnswerNumber + 1" }

    const addedAt = new Date(Date.now()).toISOString()

    const answer = new AnswerEntity()
    answer.AnswerId = randomUUID()
    answer.GameId = game.id
    answer.QuestionId = question.questionId
    answer.AnswerStatus = answerStatus
    answer.UserId = command.userId
    answer.AddedAt = addedAt

    await this.dataSource.manager.transaction(async manager => {
      await manager.save<AnswerEntity>(answer)
      await manager.update(GameEntity, { GameId: game.id }, setPlayerAnswerNumber)
    })

    return new Contract(answer.AnswerId, null)
  }

}