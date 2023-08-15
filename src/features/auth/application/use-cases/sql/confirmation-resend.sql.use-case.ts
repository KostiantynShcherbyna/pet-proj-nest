import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { UsersSqlRepository } from "../../../../../repositories/users/sql/users.sql.repository"
import { randomUUID } from "crypto"
import { EmailAdapter } from "../../../../../infrastructure/adapters/email.adapter"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"

export class ConfirmationResendSqlCommand {
  constructor(public email: string) {
  }
}

@CommandHandler(ConfirmationResendSqlCommand)
export class ConfirmationResendSql implements ICommandHandler<ConfirmationResendSqlCommand> {
  constructor(
    protected usersSqlRepository: UsersSqlRepository,
    protected emailAdapter: EmailAdapter,
  ) {
  }

  async execute(command: ConfirmationResendSqlCommand): Promise<Contract<null | boolean>> {

    const user = await this.usersSqlRepository.findUser({ key: "Email", value: command.email })
    if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (user.emailConfirmation.isConfirmed === true) return new Contract(null, ErrorEnums.USER_EMAIL_CONFIRMED)

    await this.usersSqlRepository.updateConfirmationCode({ id: user.id, newConfirmationCode: randomUUID() })

    // SENDING EMAIL ↓↓↓
    const isSend = await this.emailAdapter.sendConfirmationCode(user)
    if (isSend === false) {
      await this.usersSqlRepository.deleteUser(user.id)
      return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
    }

    await this.usersSqlRepository.createSentEmailDate(user.id)

    return new Contract(true, null)
  }


}