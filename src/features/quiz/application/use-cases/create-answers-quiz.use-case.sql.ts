import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { QuizRepositoryOrm } from "../../repository/typeorm/quiz.repository.orm"
import { Contract } from "../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import { UsersRepositoryOrm } from "../../../sa/repository/typeorm/users.repository.orm"
import { Game, QuizStatusEnum } from "../entities/typeorm/game"
import { Answer, AnswerStatusEnum } from "../entities/typeorm/answer"
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
    const foundUser = await this.usersRepository.findUserByUserIdQuiz(command.userId)
    if (foundUser === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (foundUser.IsConfirmed === false) return new Contract(null, ErrorEnums.USER_EMAIL_NOT_CONFIRMED)

    const currentGame = await this.quizRepository.getCurrentGame({
      userId: command.userId,
      pending: QuizStatusEnum.PendingSecondPlayer,
      active: QuizStatusEnum.Active
    })
    if (!currentGame || currentGame.status === QuizStatusEnum.PendingSecondPlayer)
      return new Contract(null, ErrorEnums.GAME_NOT_STARTED)

    const answerNumber = command.userId === currentGame.firstPlayerId
      ? currentGame.firstPlayerAnswerNumber
      : currentGame.secondPlayerAnswerNumber

    if (answerNumber > 4) return new Contract(null, ErrorEnums.OVERDO_ANSWER)

    // Проверка на null, чтобы ts не ругался, т.к. при создании игры может быть null, но сюда null попасть не может
    if (!currentGame.questionIds) return new Contract(null, ErrorEnums.FAIL_LOGIC)
    const questions = await this.quizRepository.getQuestionIdsForAnswer(currentGame.questionIds, true)
    if (!questions) return new Contract(null, ErrorEnums.FAIL_LOGIC)

    const question = questions[answerNumber]
    const answerStatus = question.correctAnswers.includes(command.answer)
      ? AnswerStatusEnum.Correct
      : AnswerStatusEnum.Incorrect

    const setPlayerAnswerNumber = command.userId === currentGame.firstPlayerId
      ? { firstPlayerAnswerNumber: () => "firstPlayerAnswerNumber + 1" }
      : { secondPlayerAnswerNumber: () => "secondPlayerAnswerNumber + 1" }

    let increaseScore
    if (answerStatus === AnswerStatusEnum.Correct && command.userId === currentGame.firstPlayerId)
      increaseScore = { firstPlayerScore: () => "firstPlayerScore + 1" }
    if (answerStatus === AnswerStatusEnum.Correct && command.userId === currentGame.secondPlayerId)
      increaseScore = { secondPlayerScore: () => "secondPlayerScore + 1" }

    const timeStamp = new Date(Date.now()).toISOString()

    const newAnswer = new Answer()
    newAnswer.gameId = currentGame.gameId
    newAnswer.questionId = question.questionId
    newAnswer.answerStatus = answerStatus
    newAnswer.userId = command.userId
    newAnswer.addedAt = timeStamp

    const answer = await this.dataSource.manager.transaction(async manager => {
      answerNumber === 4 && currentGame.firstFinisherId === null
        ? await manager.update(Game, { gameId: currentGame.gameId },
          { ...setPlayerAnswerNumber, ...increaseScore, firstFinisherId: command.userId })
        : await manager.update(Game, { gameId: currentGame.gameId },
          { ...setPlayerAnswerNumber, ...increaseScore })
      return await manager.save(newAnswer)
    })

    const currentGameAfter = await this.quizRepository.getCurrentGame({
      userId: command.userId,
      pending: null,
      active: QuizStatusEnum.Active
    })
    // Проверка,чтобы TS не ругался на null
    if (!currentGameAfter) return new Contract(null, ErrorEnums.FAIL_LOGIC)

    if (currentGameAfter?.firstPlayerAnswerNumber > 4 && currentGameAfter?.secondPlayerAnswerNumber > 4) {
      let extraScore
      if (currentGameAfter.firstPlayerScore > 0 && command.userId === currentGameAfter.firstFinisherId)
        extraScore = { firstPlayerScore: () => "firstPlayerScore + 1" }
      if (currentGameAfter.secondPlayerScore > 0 && command.userId === currentGameAfter.firstFinisherId)
        extraScore = { secondPlayerScore: () => "secondPlayerScore + 1" }

      await this.dataSource.manager.transaction(async manager =>
        await manager.update(Game, { gameId: currentGame.gameId },
          { ...extraScore, status: QuizStatusEnum.Finished, finishGameDate: timeStamp })
      )
    }

    return new Contract(answer.answerId, null)
  }

}