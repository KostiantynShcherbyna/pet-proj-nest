import { ConfigService } from "@nestjs/config"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { ConfigType } from "src/infrastructure/settings/configuration"
import { LoginBodyInputModel } from "../../../api/models/input/login.body.input-model"
import { Devices, DevicesModel } from "../../../../devices/application/entites/mongoose/devices.schema"
import { Users, UsersModel } from "../../../../super-admin/application/entities/mongoose/users.schema"
import { RecoveryCodes, RecoveryCodesModel } from "../../entities/mongoose/recovery-code.schema"
import { UsersRepository } from "../../../../super-admin/infrastructure/mongoose/users.repository"
import { DevicesRepository } from "../../../../devices/infrastructure/mongoose/devices.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { LoginOutputModel } from "../../../api/models/output/login.output-model"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { Secrets } from "../../../../../infrastructure/utils/constants"

export class LoginCommand {
  constructor(
    public loginBody: LoginBodyInputModel,
    public deviceIp: string,
    public userAgent: string
  ) {
  }
}

@CommandHandler(LoginCommand)
export class Login implements ICommandHandler<LoginCommand> {
  constructor(
    @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
    @InjectModel(Users.name) protected UsersModel: UsersModel,
    @InjectModel(RecoveryCodes.name) protected RecoveryCodesModel: RecoveryCodesModel,
    protected usersRepository: UsersRepository,
    protected devicesRepository: DevicesRepository,
    protected configService: ConfigService<ConfigType, true>,
  ) {
  }

  async execute(command: LoginCommand): Promise<Contract<null | LoginOutputModel>> {
    // ↓↓↓ CHECK IN LOGIN-LOCAL-STRATEGY
    const user = await this.usersRepository.findUserLoginOrEmail({
      login: command.loginBody.loginOrEmail,
      email: command.loginBody.loginOrEmail
    })

    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (user.accountData.banInfo.isBanned === true)
      return new Contract(null, ErrorEnums.USER_IS_BANNED)


    const checkConfirmationAndHashContract = await user.checkConfirmationAndHash(
      user.accountData.passwordHash,
      command.loginBody.password
    )

    if (checkConfirmationAndHashContract.error === ErrorEnums.USER_EMAIL_NOT_CONFIRMED)
      return new Contract(null, ErrorEnums.USER_EMAIL_NOT_CONFIRMED)
    if (checkConfirmationAndHashContract.error === ErrorEnums.PASSWORD_NOT_COMPARED)
      return new Contract(null, ErrorEnums.PASSWORD_NOT_COMPARED)
    // ↑↑↑

    const accessJwtSecret = this.configService.get(Secrets.ACCESS_JWT_SECRET)
    const refreshJwtSecret = this.configService.get(Secrets.REFRESH_JWT_SECRET)

    const newTokens = await this.DevicesModel.createDevice(
      {
        deviceIp: command.deviceIp,
        userAgent: command.userAgent,
        userId: user._id.toString(),
        accessJwtSecret,
        refreshJwtSecret,
        DevicesModel: this.DevicesModel,
      },
    )

    await this.devicesRepository.saveDocument(newTokens.refreshEntry)


    const tokensDto = {
      accessJwt: { accessToken: newTokens.accessToken },
      refreshToken: newTokens.refreshToken
    }
    return new Contract(tokensDto, null)
  }


}