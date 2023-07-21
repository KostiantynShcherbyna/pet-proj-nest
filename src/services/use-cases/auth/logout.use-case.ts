import { Injectable } from "@nestjs/common"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Types } from "mongoose"
import { Contract } from "src/contract"
import { BodyAuthModel } from "src/models/body/body-auth.model"
import { DeviceSessionModel } from "src/models/request/device-session.model"
import { DevicesRepository } from "src/repositories/devices.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { DevicesModel } from "src/schemas/devices.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"

export class LogoutCommand {
    constructor(public deviceSession: DeviceSessionModel) { }
}

@CommandHandler(LogoutCommand)
export class Logout implements ICommandHandler<LogoutCommand> {
    constructor(
        protected usersRepository: UsersRepository,
        protected devicesRepository: DevicesRepository,
        protected DevicesModel: DevicesModel,
    ) {
    }

    async execute(command: LogoutCommand): Promise<Contract<null | boolean>> {

        const userDto = ["_id", new Types.ObjectId(command.deviceSession.userId)]
        const user = await this.usersRepository.findUser(userDto)
        if (user === null)
            return new Contract(null, ErrorEnums.USER_NOT_FOUND)


        const device = await this.devicesRepository.findDeviceByDeviceId(command.deviceSession.deviceId)
        if (device === null)
            return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
        if (command.deviceSession.lastActiveDate < device.lastActiveDate)
            return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)


        const deleteResult = await this.DevicesModel.deleteOne({ deviceId: command.deviceSession.deviceId })
        if (deleteResult.deletedCount === 0)
            return new Contract(null, ErrorEnums.DEVICE_NOT_DELETE)

        return new Contract(true, null)
    }


}