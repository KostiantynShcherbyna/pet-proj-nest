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
export class Logout {
    constructor(
        protected usersRepository: UsersRepository,
        protected devicesRepository: DevicesRepository,
        protected DevicesModel: DevicesModel,
    ) {
    }

    async execute(deviceSession: DeviceSessionModel): Promise<Contract<null | boolean>> {

        const userDto = ["_id", new Types.ObjectId(deviceSession.userId)]
        const user = await this.usersRepository.findUser(userDto)
        if (user === null)
            return new Contract(null, ErrorEnums.USER_NOT_FOUND)


        const device = await this.devicesRepository.findDeviceByDeviceId(deviceSession.deviceId)
        if (device === null)
            return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
        if (deviceSession.lastActiveDate < device.lastActiveDate)
            return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)


        const deleteResult = await this.DevicesModel.deleteOne({ deviceId: deviceSession.deviceId })
        if (deleteResult.deletedCount === 0)
            return new Contract(null, ErrorEnums.DEVICE_NOT_DELETE)

        return new Contract(true, null)
    }


}