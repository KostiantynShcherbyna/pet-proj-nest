import { ConfigService } from "@nestjs/config"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { ConfigType } from "src/infrastructure/settings/configuration"
import { LoginBodyInputModel } from "../../../api/models/input/login.body.input-model"
import { Devices, DevicesModel } from "../../../../devices/application/entites/mongoose/devices.schema"
import { RecoveryCodes, RecoveryCodesModel } from "../../entities/mongoose/recovery-code.schema"
import { UsersSqlRepository } from "../../../../../repositories/users/sql/users.sql.repository"
import { compareHashManager } from "../../../../../infrastructure/services/compare-hash.service"
import { addSeconds } from "date-fns"
import {
  ACCESS_EXPIRES_TIME,
  EXPIRE_AT_ACCESS,
  REFRESH_EXPIRES_TIME, Secrets
} from "../../../../../infrastructure/utils/constants"
import { randomUUID } from "crypto"
import { TokensService } from "../../../../../infrastructure/services/tokens.service"
import { DevicesSqlRepository } from "../../../../../repositories/devices/sql/devices.sql.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { LoginOutputModel } from "../../../api/models/output/login.output-model"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"

export class LoginSqlCommand {
  constructor(
    public loginBody: LoginBodyInputModel,
    public deviceIp: string,
    public userAgent: string
  ) {
  }
}

@CommandHandler(LoginSqlCommand)
export class LoginSql implements ICommandHandler<LoginSqlCommand> {
  constructor(
    protected configService: ConfigService<ConfigType, true>,
    protected devicesSqlRepository: DevicesSqlRepository,
    protected usersSqlRepository: UsersSqlRepository,
    protected tokensService: TokensService,
  ) {
  }

  async execute(command: LoginSqlCommand): Promise<Contract<null | LoginOutputModel>> {
    // ↓↓↓ CHECK IN LOGIN-LOCAL-STRATEGY
    const user = await this.usersSqlRepository.findUserLoginOrEmail({
      login: command.loginBody.loginOrEmail,
      email: command.loginBody.loginOrEmail
    })
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (user.accountData.banInfo.isBanned === true)
      return new Contract(null, ErrorEnums.USER_IS_BANNED)


    if (user.emailConfirmation.isConfirmed === false)
      return new Contract(null, ErrorEnums.USER_EMAIL_NOT_CONFIRMED)
    if (await compareHashManager(user.accountData.passwordHash, command.loginBody.password) === false)
      return new Contract(null, ErrorEnums.PASSWORD_NOT_COMPARED)
    // ↑↑↑

    const accessJwtSecret = this.configService.get(Secrets.ACCESS_JWT_SECRET, { infer: true })
    const refreshJwtSecret = this.configService.get(Secrets.REFRESH_JWT_SECRET, { infer: true })

    const newIssueAt = new Date(Date.now())

    const tokensPayload = {
      id: randomUUID(),
      ip: command.deviceIp,
      title: command.userAgent,
      userId: user.id,
      lastActiveDate: newIssueAt.toISOString(),
      expireAt: addSeconds(newIssueAt, EXPIRE_AT_ACCESS)
    }
    const accessToken = await this.tokensService.createToken(
      tokensPayload,
      accessJwtSecret,
      ACCESS_EXPIRES_TIME
    )
    const refreshToken = await this.tokensService.createToken(
      tokensPayload,
      refreshJwtSecret,
      REFRESH_EXPIRES_TIME
    )

    await this.devicesSqlRepository.createDevice(tokensPayload)

    return new Contract({ accessJwt: { accessToken }, refreshToken }, null)
  }


}