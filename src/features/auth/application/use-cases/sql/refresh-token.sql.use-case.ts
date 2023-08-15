import { DeviceSessionReqInputModel } from "../../../api/models/input/device-session.req.input-model"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { ConfigService, ConfigType } from "@nestjs/config"
import { RefreshTokenOutputModel } from "../../../api/models/output/refresh-token.output-model"
import { UsersSqlRepository } from "../../../../../repositories/users/sql/users.sql.repository"
import { addSeconds } from "date-fns"
import {
  ACCESS_EXPIRES_TIME,
  EXPIRE_AT_ACCESS,
  REFRESH_EXPIRES_TIME,
  Secrets
} from "../../../../../infrastructure/utils/constants"
import { JwtService } from "@nestjs/jwt"
import { DevicesSqlRepository } from "../../../../../repositories/devices/sql/devices.sql.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"


export class RefreshTokenSqlCommand {
  constructor(public deviceSession: DeviceSessionReqInputModel, public deviceIp: string, public userAgent: string) {
  }
}

@CommandHandler(RefreshTokenSqlCommand)
export class RefreshTokenSql implements ICommandHandler<RefreshTokenSqlCommand> {
  constructor(
    protected configService: ConfigService<ConfigType<any>, true>,
    protected devicesSqlRepository: DevicesSqlRepository,
    protected usersSqlRepository: UsersSqlRepository,
    protected jwtService: JwtService,
  ) {
  }

  async execute(command: RefreshTokenSqlCommand): Promise<Contract<null | RefreshTokenOutputModel>> {

    const user = await this.usersSqlRepository.findUser({ key: "UserId", value: command.deviceSession.userId })
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const device = await this.devicesSqlRepository.findDevice(command.deviceSession.deviceId)
    if (device === null)
      return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
    if (command.deviceSession.lastActiveDate < device.lastActiveDate)
      return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)

    const accessJwtSecret = this.configService.get(Secrets.ACCESS_JWT_SECRET, { infer: true })
    const refreshJwtSecret = this.configService.get(Secrets.REFRESH_JWT_SECRET, { infer: true })

    const newIssueAt = new Date(Date.now())

    const tokensPayload = {
      id: device.userId,
      ip: command.deviceIp,
      title: command.userAgent,
      deviceId: device.deviceId,
      lastActiveDate: newIssueAt.toISOString(),
      expireAt: addSeconds(newIssueAt, EXPIRE_AT_ACCESS)
    }
    const accessToken = await this.jwtService.signAsync(
      tokensPayload,
      {
        secret: accessJwtSecret,
        expiresIn: ACCESS_EXPIRES_TIME
      }
    )
    const refreshToken = await this.jwtService.signAsync(
      tokensPayload,
      {
        secret: refreshJwtSecret,
        expiresIn: REFRESH_EXPIRES_TIME
      }
    )

    await this.devicesSqlRepository.updateActiveDate(tokensPayload)

    return new Contract({ accessJwt: { accessToken }, refreshToken }, null)
  }


}