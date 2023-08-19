import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Devices, DevicesModel } from "../../../../devices/application/entites/mongoose/devices.schema"
import { UsersRepository } from "../../../../super-admin/infrastructure/mongoose/users.repository"
import { DevicesRepository } from "../../../../devices/infrastructure/mongoose/devices.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { Types } from "mongoose"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"

export class LogoutCommand {
    constructor(
        public deviceId: string,
        public expireAt: Date,
        public ip: string,
        public lastActiveDate: string,
        public title: string,
        public userId: string
    ) { }
}

@CommandHandler(LogoutCommand)
export class Logout implements ICommandHandler<LogoutCommand> {
    constructor(
        @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
        protected usersRepository: UsersRepository,
        protected devicesRepository: DevicesRepository,
    ) {
    }

    async execute(command: LogoutCommand): Promise<Contract<null | boolean>> {
        const userDto = ["_id", new Types.ObjectId(command.userId)]
        const user = await this.usersRepository.findUser(userDto)
        if (user === null)
            return new Contract(null, ErrorEnums.USER_NOT_FOUND)


        const device = await this.devicesRepository.findDeviceByDeviceId(command.deviceId)
        if (device === null)
            return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
        if (command.lastActiveDate < device.lastActiveDate)
            return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)


        const deleteResult = await this.DevicesModel.deleteOne({ deviceId: command.deviceId })
        if (deleteResult.deletedCount === 0)
            return new Contract(null, ErrorEnums.DEVICE_NOT_DELETE)

        return new Contract(true, null)
    }


}