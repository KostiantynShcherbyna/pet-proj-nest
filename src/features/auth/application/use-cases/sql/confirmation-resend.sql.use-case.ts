import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { UsersRepositoryOrm } from "../../../../sa/repository/orm/users.repository.orm"
import { randomUUID } from "crypto"
import { EmailAdapter } from "../../../../../infrastructure/adapters/email.adapter"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { add } from "date-fns"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"

export class ConfirmationResendSqlCommand {
  constructor(public email: string) {
  }
}

@CommandHandler(ConfirmationResendSqlCommand)
export class ConfirmationResendSql implements ICommandHandler<ConfirmationResendSqlCommand> {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected usersSqlRepository: UsersRepositoryOrm,
    protected emailAdapter: EmailAdapter,
  ) {
  }

  async execute(command: ConfirmationResendSqlCommand): Promise<Contract<null | boolean>> {

    const user = await this.usersSqlRepository.findUserByEmail(command.email)
    if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (user.isConfirmed === true) return new Contract(null, ErrorEnums.USER_EMAIL_CONFIRMED)

    const emailConfirmationDto = {
      userId: user.userId,
      confirmationCode: randomUUID(),
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 3,
      }).toISOString(),
      isConfirmed: false
    }

    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      await this.usersSqlRepository.createEmailConfirmation({ emailConfirmationDto, queryRunner })
      await queryRunner.commitTransaction()
    } catch (err) {
      console.log("ConfirmationResendSql", err)
      await queryRunner.rollbackTransaction()
      return new Contract(null, ErrorEnums.USER_NOT_DELETED)
    } finally {
      await queryRunner.release()
    }


    // SENDING EMAIL ↓↓↓
    this.emailAdapter.sendConfirmationCode(user)
    // if (isSend === false) {
    //   await this.usersSqlRepository.deleteUser(user.id)
    //   return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
    // }

    await this.usersSqlRepository.createSentConfirmCodeDate(user.userId, new Date(Date.now()).toISOString())

    return new Contract(true, null)
  }


}