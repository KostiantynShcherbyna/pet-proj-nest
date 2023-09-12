import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { QuizRepositoryOrm } from "../../repository/typeorm/quiz.repository.orm"
import { Contract } from "../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import { UsersRepositoryOrm } from "../../../sa/repository/typeorm/users.repository.orm"
import { Game, StatusEnum } from "../entities/typeorm/game"
import { Answer, AnswerStatusEnum } from "../entities/typeorm/answer"
import { Column, DataSource } from "typeorm"
import { randomUUID } from "crypto"

export class CreateQuestionsQuizCommandSql {
  constructor(
    public body: { body: string, correctAnswers: string[] },
    public userId: string
  ) {
  }
}

@CommandHandler(CreateQuestionsQuizCommandSql)
export class CreateQuestionsQuizSql implements ICommandHandler<CreateQuestionsQuizCommandSql> {
  constructor(
    protected dataSource: DataSource,
    protected quizRepository: QuizRepositoryOrm,
    protected usersRepository: UsersRepositoryOrm,
  ) {
  }

  async execute(command: CreateQuestionsQuizCommandSql) {
    const foundUser = await this.usersRepository.findUserByUserIdQuiz(command.userId)
    if (foundUser === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (foundUser.IsConfirmed === false) return new Contract(null, ErrorEnums.USER_EMAIL_NOT_CONFIRMED)

    const game = await this.quizRepository.getUserCurrentGame(
      command.userId, {
        pending: "",
        active: StatusEnum.Active
      })
    if (!game) return new Contract(null, ErrorEnums.GAME_NOT_STARTED)

    const answerNumber = game.FirstPlayerId === command.userId
      ? game.FirstPlayerAnswerNumber
      : game.SecondPlayerAnswerNumber

    // @ts-ignore
    const questionIds = game.Questions.map(question => question.QuestionId)

    const questions = await this.quizRepository.getQuestionIdsForAnswer(questionIds, true)
    if (!questions) return new Contract(null, ErrorEnums.FAIL_LOGIC)

    const question = questions[answerNumber]
    // @ts-ignore
    const answerStatus = question.correctAnswers.includes(command.answer)
      ? AnswerStatusEnum.Correct
      : AnswerStatusEnum.Incorrect

    const setPlayerAnswerNumber = command.userId === game.FirstPlayerId
      ? { FirstPlayerAnswerNumber: () => "FirstPlayerAnswerNumber + 1" }
      : { SecondPlayerAnswerNumber: () => "SecondPlayerAnswerNumber + 1" }

    const addedAt = new Date(Date.now()).toISOString()

    const answer = new Answer()
    // @ts-ignore
    answer.Game = game
    // @ts-ignore
    answer.Question = question
    answer.AnswerStatus = answerStatus
    // @ts-ignore
    answer.User = foundUser
    answer.AddedAt = addedAt

    const newAnswerId = await this.dataSource.manager.transaction(async manager => {
      const ar = await manager.save<Answer>(answer)
      await manager.update(Game, { GameId: game.GameId }, setPlayerAnswerNumber)
      return ar.AnswerId
    })

    return new Contract(newAnswerId, null)
  }

}