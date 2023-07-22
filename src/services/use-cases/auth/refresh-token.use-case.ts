import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Types } from "mongoose"
import { ConfigType } from "src/configuration"
import { Contract } from "src/contract"
import { DeviceSessionModel } from "src/models/request/device-session.model"
import { DevicesRepository } from "src/repositories/devices.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { Secrets } from "src/utils/constants/constants"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { TokensView } from "src/views/tokens.view"


export class RefreshTokenCommand {
    constructor(public deviceSession: DeviceSessionModel, public deviceIp: string, public userAgent: string) { }
}

@CommandHandler(RefreshTokenCommand)
export class RefreshToken implements ICommandHandler<RefreshTokenCommand>{
    constructor(
        protected usersRepository: UsersRepository,
        protected devicesRepository: DevicesRepository,
        protected configService: ConfigService<ConfigType, true>,
    ) {
    }

    async execute(comamnd: RefreshTokenCommand): Promise<Contract<null | TokensView>> {


        const userDto = ["_id", new Types.ObjectId(comamnd.deviceSession.userId)]
        const user = await this.usersRepository.findUser(userDto)
        if (user === null)
            return new Contract(null, ErrorEnums.USER_NOT_FOUND)


        const device = await this.devicesRepository.findDeviceByDeviceId(comamnd.deviceSession.deviceId)
        if (device === null)
            return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
        if (comamnd.deviceSession.lastActiveDate < device.lastActiveDate)
            return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)


        const accessJwtSecret = this.configService.get(Secrets.ACCESS_JWT_SECRET, { infer: true })
        const refreshJwtSecret = this.configService.get(Secrets.REFRESH_JWT_SECRET, { infer: true })
        const newTokens = await device.refreshDevice({ deviceIp: comamnd.deviceIp, userAgent: comamnd.userAgent, device, accessJwtSecret, refreshJwtSecret })
        await this.devicesRepository.saveDocument(device)


        const tokensDto = {
            accessJwt: { accessToken: newTokens.accessToken },
            refreshToken: newTokens.refreshToken
        }
        return new Contract(tokensDto, null)
    }


}