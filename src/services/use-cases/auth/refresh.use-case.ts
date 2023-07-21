import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Types } from "mongoose"
import { ConfigType } from "src/configuration"
import { Contract } from "src/contract"
import { BodyAuthModel } from "src/models/body/body-auth.model"
import { BodyUserModel } from "src/models/body/body-user.model"
import { DeviceSessionModel } from "src/models/request/device-session.model"
import { AuthRepository } from "src/repositories/auth.repository"
import { DevicesRepository } from "src/repositories/devices.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { DevicesModel } from "src/schemas/devices.schema"
import { RecoveryCodesModel } from "src/schemas/recovery-code.schema"
import { UsersDocument, UsersModel } from "src/schemas/users.schema"
import { TokensService } from "src/services/tokens.service"
import { Secrets } from "src/utils/constants/constants"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { TokensView } from "src/views/tokens.view"
import { UserView } from "src/views/user.view"

@Injectable()
export class Refresh {
    constructor(
        protected usersRepository: UsersRepository,
        protected devicesRepository: DevicesRepository,
        protected configService: ConfigService<ConfigType, true>,
    ) {
    }

    async execute(deviceSession: DeviceSessionModel, deviceIp: string, userAgent: string): Promise<Contract<null | TokensView>> {


        const userDto = ["_id", new Types.ObjectId(deviceSession.userId)]
        const user = await this.usersRepository.findUser(userDto)
        if (user === null)
            return new Contract(null, ErrorEnums.USER_NOT_FOUND)


        const device = await this.devicesRepository.findDeviceByDeviceId(deviceSession.deviceId)
        if (device === null)
            return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
        if (deviceSession.lastActiveDate < device.lastActiveDate)
            return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)


        const accessJwtSecret = this.configService.get(Secrets.ACCESS_JWT_SECRET, { infer: true })
        const refreshJwtSecret = this.configService.get(Secrets.REFRESH_JWT_SECRET, { infer: true })
        const newTokens = await device.refreshDevice({ deviceIp, userAgent, device, accessJwtSecret, refreshJwtSecret })
        await this.devicesRepository.saveDocument(device)


        const tokensDto = {
            accessJwt: { accessToken: newTokens.accessToken },
            refreshToken: newTokens.refreshToken
        }
        return new Contract(tokensDto, null)
    }


}