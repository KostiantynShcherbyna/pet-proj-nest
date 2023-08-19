import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Users, UsersDocument, UsersModel } from "../../entities/mongoose/users.schema"
import { UsersRepository } from "../../../infrastructure/mongoose/users.repository"
import { CreateUserOutputModel } from "../../../api/models/output/create-user.output-model"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { generateHashManager } from "../../../../../infrastructure/services/generate-hash.service"
import { randomUUID } from "crypto"
import { add } from "date-fns"
import { UsersSqlRepository } from "../../../infrastructure/sql/users.sql.repository"


export class CreateUserSqlCommand {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {
  }
}

@CommandHandler(CreateUserSqlCommand)
export class CreateUserSql implements ICommandHandler<CreateUserSqlCommand> {
  constructor(
    @InjectModel(Users.name) protected UsersModel: UsersModel,
    protected usersSqlRepository: UsersSqlRepository,
  ) {
  }

  // : Promise<CreateUserOutputModel>
  async execute(command: CreateUserSqlCommand) {

    const user = await this.usersSqlRepository.findUserByLoginOrEmail({ login: command.login, email: command.email })
    if (user?.email === command.email) return new Contract(null, ErrorEnums.USER_EMAIL_EXIST)
    if (user?.login === command.login) return new Contract(null, ErrorEnums.USER_LOGIN_EXIST)

    const passwordHash = await generateHashManager(command.password)
    const newUser = await this.usersSqlRepository.createUser({
      login: command.login,
      email: command.email,
      passwordHash: passwordHash,
      createdAt: new Date(Date.now()).toISOString()
    })

    const emailConfirmationDto = {
      userId: newUser.userId,
      confirmationCode: null,
      expirationDate: null,
      isConfirmed: true
    }
    await this.usersSqlRepository.createEmailConfirmation(emailConfirmationDto)
    await this.usersSqlRepository.createBanInfo(newUser.userId)

    return new Contract(newUser.userId, null)

    // async execute(command: CreateUserSqlCommand): Promise<CreateUserOutputModel> {
    //
    //   const newUser = await this.UsersModel.createUser(
    //     {
    //       login: command.login,
    //       email: command.email,
    //       password: command.password,
    //     },
    //     this.UsersModel
    //   )
    //   await this.usersRepository.saveDocument(newUser)
    //   const userView = this.createUserView(newUser)
    //   return userView
    // }
    //
    //
    // private createUserView(data: UsersDocument) {
    //   return {
    //     id: data._id.toString(),
    //     login: data.accountData.login,
    //     email: data.accountData.email,
    //     createdAt: data.accountData.createdAt,
    //     banInfo: {
    //       banDate: data.accountData.banInfo.banDate,
    //       banReason: data.accountData.banInfo.banReason,
    //       isBanned: data.accountData.banInfo.isBanned,
    //     }
    //   }
  }
}