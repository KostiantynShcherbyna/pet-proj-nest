import { DeviceSessionReqInputModel } from "../../../api/models/input/device-session.req.input-model"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { ConfigService, ConfigType } from "@nestjs/config"
import { RefreshTokenOutputModel } from "../../../api/models/output/refresh-token.output-model"
import { UsersRepositoryOrm } from "../../../../sa/repository/orm/users.repository.orm"
import { addSeconds } from "date-fns"
import {
  ACCESS_EXPIRES_TIME,
  EXPIRE_AT_ACCESS,
  REFRESH_EXPIRES_TIME,
  Secrets
} from "../../../../../infrastructure/utils/constants"
import { JwtService } from "@nestjs/jwt"
import { DevicesRepositoryOrm } from "../../../../devices/repository/orm/devices.repository.orm"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { TokensService } from "../../../../../infrastructure/services/tokens.service"


export class RefreshTokenSqlCommand {
  constructor(public deviceSession: DeviceSessionReqInputModel, public deviceIp: string, public userAgent: string) {
  }
}

@CommandHandler(RefreshTokenSqlCommand)
export class RefreshTokenSql implements ICommandHandler<RefreshTokenSqlCommand> {
  constructor(
    protected configService: ConfigService<ConfigType<any>, true>,
    protected devicesSqlRepository: DevicesRepositoryOrm,
    protected usersSqlRepository: UsersRepositoryOrm,
    protected tokensService: TokensService,
  ) {
  }

  async execute(command: RefreshTokenSqlCommand): Promise<Contract<null | RefreshTokenOutputModel>> {

    const user = await this.usersSqlRepository.findUserByUserId(command.deviceSession.userId)
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const device = await this.devicesSqlRepository.findDeviceByDeviceId(command.deviceSession.deviceId)
    if (device === null)
      return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
    if (command.deviceSession.lastActiveDate !== device.lastActiveDate)
      return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)

    const accessJwtSecret = this.configService.get(Secrets.ACCESS_JWT_SECRET, { infer: true })
    const refreshJwtSecret = this.configService.get(Secrets.REFRESH_JWT_SECRET, { infer: true })

    const newIssueAt = new Date(Date.now())

    const tokensPayload = {
      userId: device.userId,
      ip: command.deviceIp,
      title: command.userAgent,
      deviceId: device.deviceId,
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

    await this.devicesSqlRepository.updateActiveDate(tokensPayload)

    return new Contract({ accessJwt: { accessToken }, refreshToken }, null)
  }


}