import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { generateHashManager } from "../../../../../infrastructure/services/generate-hash.service"
import { UsersRepositoryOrm } from "../../../repository/orm/users.repository.orm"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"


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
    @InjectDataSource() protected dataSource: DataSource,
    protected usersSqlRepository: UsersRepositoryOrm,
  ) {
  }

  // : Promise<CreateUserOutputModel>
  async execute(command: CreateUserSqlCommand) {

    const user = await this.usersSqlRepository.findUserByLoginOrEmail({ login: command.login, email: command.email })
    if (user?.email === command.email) return new Contract(null, ErrorEnums.USER_EMAIL_EXIST)
    if (user?.login === command.login) return new Contract(null, ErrorEnums.USER_LOGIN_EXIST)

    let newUser
    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      const passwordHash = await generateHashManager(command.password)
      const newUserDataDto = {
        login: command.login,
        email: command.email,
        passwordHash: passwordHash,
        createdAt: new Date(Date.now()).toISOString()
      }
      newUser = await this.usersSqlRepository.createUser(newUserDataDto, queryRunner)

      const emailConfirmationDto = {
        userId: newUser.userId,
        confirmationCode: null,
        expirationDate: null,
        isConfirmed: true
      }
      await this.usersSqlRepository.createEmailConfirmation({emailConfirmationDto : emailConfirmationDto, queryRunner : queryRunner})
      await this.usersSqlRepository.createBanInfo(newUser.userId, queryRunner)
      await queryRunner.commitTransaction()
    } catch (err) {
      console.log("CreateUserSql", err)
      await queryRunner.rollbackTransaction()
      return new Contract(null, ErrorEnums.USER_NOT_DELETED)
    } finally {
      await queryRunner.release()
    }
    return new Contract(newUser.userId, null)
  }
}