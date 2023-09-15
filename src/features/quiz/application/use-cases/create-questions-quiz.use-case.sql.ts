import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { QuizRepositoryOrm } from "../../repository/typeorm/quiz.repository.orm"
import { Contract } from "../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import { UsersRepositoryOrm } from "../../../sa/repository/typeorm/users.repository.orm"
import { Game, QuizStatusEnum } from "../entities/typeorm/game"
import { Answer, AnswerStatusEnum } from "../entities/typeorm/answer"
import { Column, DataSource } from "typeorm"
import { randomUUID } from "crypto"
import { Question } from "../entities/typeorm/question"

export class CreateQuestionsQuizCommandSql {
  constructor(
    public body: { body: string, correctAnswers: string[] }
  ) {
  }
}

@CommandHandler(CreateQuestionsQuizCommandSql)
export class CreateQuestionsQuizSql implements ICommandHandler<CreateQuestionsQuizCommandSql> {
  constructor(
    protected dataSource: DataSource,
    protected quizRepository: QuizRepositoryOrm,
  ) {
  }

  async execute(command: CreateQuestionsQuizCommandSql): Promise<Contract<string | null>> {
    const createdAt = new Date(Date.now()).toISOString()
    const question = new Question()
    question.body = command.body.body
    question.correctAnswers = command.body.correctAnswers
    question.createdAt = createdAt

    const newQuestionId = await this.dataSource.manager.transaction(async manager => {
      const newQ = await manager.save<Question>(question)
      return newQ.questionId
    })

    return new Contract(newQuestionId, null)
  }
}