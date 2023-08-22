import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { UsersRepositorySql } from "../../../../sa/repository/sql/users.repository.sql"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"

export class ConfirmationSqlCommand {
  constructor(public code: string) {
  }
}

@CommandHandler(ConfirmationSqlCommand)
export class ConfirmationSql implements ICommandHandler<ConfirmationSqlCommand> {
  constructor(
    protected usersSqlRepository: UsersRepositorySql,
  ) {
  }
  async execute(command: ConfirmationSqlCommand): Promise<Contract<null | boolean>> {
    const user = await this.usersSqlRepository.findUserByConfirmCode(command.code)
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (user.isConfirmed === true)
      return new Contract(null, ErrorEnums.USER_EMAIL_CONFIRMED)
    if (user.expirationDate && (user.expirationDate < new Date()))
      return new Contract(null, ErrorEnums.CONFIRMATION_CODE_EXPIRED)

    await this.usersSqlRepository.updateConfirmation({ userId: user.userId, isConfirm: true })

    return new Contract(true, null)
  }


}