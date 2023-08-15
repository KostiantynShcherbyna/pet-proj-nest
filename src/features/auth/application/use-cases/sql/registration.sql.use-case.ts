import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { UsersSqlRepository } from "../../../../../repositories/users/sql/users.sql.repository"
import { EmailAdapter } from "../../../../../infrastructure/adapters/email.adapter"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { generateHashManager } from "../../../../../infrastructure/services/generate-hash.service"


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

    const user = await this.usersSqlRepository.findUserLoginOrEmail({ login: command.login, email: command.email })
    if (user.email === command.email) return new Contract(null, ErrorEnums.USER_EMAIL_EXIST)
    if (user.login === command.login) return new Contract(null, ErrorEnums.USER_LOGIN_EXIST)

    const passwordHash = await generateHashManager(command.password)
    const newUser = await this.usersSqlRepository.createUser({
      login: command.login,
      email: command.email,
      passwordHash: passwordHash,
    })
    await this.usersSqlRepository.createEmailConfirmation(newUser.id)
    await this.usersSqlRepository.createBanInfo(newUser.id)

    // SENDING EMAIL ↓↓↓ TODO TO CLASS
    const isSend = await this.emailAdapter.sendConfirmationCode(newUser)
    if (isSend === false) {
      await this.usersSqlRepository.deleteUser(newUser.id)
      return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
    }
    await this.usersSqlRepository.createSentEmailDate(user.id)
    return new Contract(true, null)
  }


}