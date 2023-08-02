import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Types } from "mongoose"
import { Contract } from "src/infrastructure/utils/contract"
import { DevicesRepository } from "src/features/devices/infrastructure/devices.repository"
import { UsersRepository } from "src/features/users/infrastructure/users.repository"
import { Devices, DevicesModel } from "src/infrastructure/schemas/devices.schema"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"

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
        const { deviceId } = command
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