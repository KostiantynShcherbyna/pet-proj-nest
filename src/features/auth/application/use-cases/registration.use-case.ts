import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Users, UsersModel } from "../../../entities/mongoose/users.schema"
import { InjectModel } from "@nestjs/mongoose"
import { UsersRepository } from "../../../super-admin/infrastructure/users.repository"
import { EmailAdapter } from "../../../../infrastructure/adapters/email.adapter"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import { Contract } from "../../../../infrastructure/utils/contract"

export class RegistrationCommand {
  constructor(
    public login: string,
    public email: string,
    public password: string
  ) {
  }
}

@CommandHandler(RegistrationCommand)
export class Registration implements ICommandHandler<RegistrationCommand> {
  constructor(
    @InjectModel(Users.name) protected UsersModel: UsersModel,
    protected usersRepository: UsersRepository,
    protected emailAdapter: EmailAdapter,
  ) {
  }

  async execute(command: RegistrationCommand): Promise<Contract<null | boolean>> {

    const user = await this.usersRepository.findUserLoginOrEmail({ login: command.login, email: command.email })
    const checkEmailAndLoginContract = user?.checkEmailAndLogin(
      {
        email: user?.accountData.email,
        login: user?.accountData.login,
        inputEmail: command.email,
        inputLogin: command.login
      }
    )
    if (checkEmailAndLoginContract?.error === ErrorEnums.USER_EMAIL_EXIST)
      return new Contract(null, ErrorEnums.USER_EMAIL_EXIST)
    if (checkEmailAndLoginContract?.error === ErrorEnums.USER_LOGIN_EXIST)
      return new Contract(null, ErrorEnums.USER_LOGIN_EXIST)


    const newUser = await this.UsersModel.registrationUser({
      login: command.login,
      email: command.email,
      password: command.password
    }, this.UsersModel)
    await this.usersRepository.saveDocument(newUser)

    // SENDING EMAIL ↓↓↓ TODO TO CLASS
    const isSend = await this.emailAdapter.sendConfirmationCode(newUser)
    if (isSend === false) {
      const deletedUserContract = await this.UsersModel.deleteUser(newUser._id.toString(), this.UsersModel)
      if (deletedUserContract.data === 0) return new Contract(null, ErrorEnums.USER_NOT_DELETED)

      return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
    }


    newUser.addSentDate()
    await this.usersRepository.saveDocument(newUser)

    return new Contract(true, null)
  }


}