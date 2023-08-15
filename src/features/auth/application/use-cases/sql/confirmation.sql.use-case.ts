import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { UsersSqlRepository } from "../../../../../repositories/users/sql/users.sql.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"

export class ConfirmationSqlCommand {
  constructor(public code: string) {
  }
}

@CommandHandler(ConfirmationSqlCommand)
export class ConfirmationSql implements ICommandHandler<ConfirmationSqlCommand> {
  constructor(
    protected usersSqlRepository: UsersSqlRepository,
  ) {
  }

  async execute(command: ConfirmationSqlCommand): Promise<Contract<null | boolean>> {
    const user = await this.usersSqlRepository.findUser({ key: "ConfirmationCode", value: command.code })
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (user.emailConfirmation.isConfirmed === true)
      return new Contract(null, ErrorEnums.USER_EMAIL_CONFIRMED)
    if (user.emailConfirmation.expirationDate && !(user.emailConfirmation.expirationDate < new Date()))
      return new Contract(null, ErrorEnums.CONFIRMATION_CODE_EXPIRED)

    await this.usersSqlRepository.updateConfirmation({ userId: user.id, isConfirm: true })

    return new Contract(true, null)
  }


}