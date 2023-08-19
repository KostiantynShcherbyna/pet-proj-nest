import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { UsersSqlRepository } from "../../../../super-admin/infrastructure/sql/users.sql.repository"
import { EmailAdapter } from "../../../../../infrastructure/adapters/email.adapter"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { generateHashManager } from "../../../../../infrastructure/services/generate-hash.service"
import { add } from "date-fns"
import { randomUUID } from "crypto"


export class RegistrationSqlCommand {
  constructor(
    public login: string,
    public email: string,
    public password: string
  ) {
  }
}

@CommandHandler(RegistrationSqlCommand)
export class RegistrationSql implements ICommandHandler<RegistrationSqlCommand> {
  constructor(
    // @InjectDataSource() protected dataSource: DataSource,
    protected usersSqlRepository: UsersSqlRepository,
    protected emailAdapter: EmailAdapter,
  ) {
  }

  async execute(command: RegistrationSqlCommand): Promise<Contract<null | boolean>> {

    const user = await this.usersSqlRepository.findUserByLoginOrEmail({ login: command.login, email: command.email })
    if (user?.email === command.email) return new Contract(null, ErrorEnums.USER_EMAIL_EXIST)
    if (user?.login === command.login) return new Contract(null, ErrorEnums.USER_LOGIN_EXIST)

    const passwordHash = await generateHashManager(command.password)
    const newDate = new Date(Date.now()).toISOString()
    const newUser = await this.usersSqlRepository.createUser({
      login: command.login,
      email: command.email,
      passwordHash: passwordHash,
      date: newDate
    })
    const emailConfirmationDto = {
      userId: newUser.userId,
      confirmationCode: randomUUID(),
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 3,
      }).toISOString(),
      isConfirmed: false
    }
    console.log("confirmationCode", emailConfirmationDto.confirmationCode)
    await this.usersSqlRepository.createEmailConfirmation(emailConfirmationDto)
    await this.usersSqlRepository.createBanInfo(newUser.userId)

    // SENDING EMAIL ↓↓↓ TODO TO CLASS
    this.emailAdapter.sendConfirmationCode(newUser)
    // if (isSend === false) {
    //   await this.usersSqlRepository.deleteUser(newUser.id)
    //   return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
    // }
    await this.usersSqlRepository.createSentConfirmCodeDate(newUser.userId, newDate)
    return new Contract(true, null)
  }


}