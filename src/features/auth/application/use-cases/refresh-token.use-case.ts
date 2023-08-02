import { ConfigService } from "@nestjs/config"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Types } from "mongoose"
import { ConfigType } from "src/infrastructure/settings/configuration"
import { Contract } from "src/infrastructure/utils/contract"
import { DevicesRepository } from "src/features/devices/infrastructure/devices.repository"
import { UsersRepository } from "src/features/super-admin/infrastructure/users.repository"
import { Secrets } from "src/infrastructure/utils/constants"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"
import { DeviceSessionReqInputModel } from "../../api/models/input/device-session.req.input-model"
import { RefreshTokenOutputModel } from "../../api/models/output/refresh-token.output-model"


export class RefreshTokenCommand {
  constructor(public deviceSession: DeviceSessionReqInputModel, public deviceIp: string, public userAgent: string) {
  }
}

@CommandHandler(RefreshTokenCommand)
export class RefreshToken implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected devicesRepository: DevicesRepository,
    protected configService: ConfigService<ConfigType, true>,
  ) {
  }

  async execute(command: RefreshTokenCommand): Promise<Contract<null | RefreshTokenOutputModel>> {


    const userDto = ["_id", new Types.ObjectId(command.deviceSession.userId)]
    const user = await this.usersRepository.findUser(userDto)
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)


    const device = await this.devicesRepository.findDeviceByDeviceId(command.deviceSession.deviceId)
    if (device === null)
      return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
    if (command.deviceSession.lastActiveDate < device.lastActiveDate)
      return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)


    const accessJwtSecret = this.configService.get(Secrets.ACCESS_JWT_SECRET, { infer: true })
    const refreshJwtSecret = this.configService.get(Secrets.REFRESH_JWT_SECRET, { infer: true })
    const newTokens = await device.refreshDevice({
      deviceIp: command.deviceIp,
      userAgent: command.userAgent,
      device,
      accessJwtSecret,
      refreshJwtSecret
    })
    await this.devicesRepository.saveDocument(device)


    const tokensDto = {
      accessJwt: { accessToken: newTokens.accessToken },
      refreshToken: newTokens.refreshToken
    }
    return new Contract(tokensDto, null)
  }


}