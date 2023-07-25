import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Types } from "mongoose"
import { Contract } from "src/contract"
import { DevicesRepository } from "src/repositories/devices.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { Devices, DevicesModel } from "src/schemas/devices.schema"
import { Users, UsersDocument, UsersModel } from "src/schemas/users.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { UserView } from "src/views/user.view"

export class BanUserCommand {
    constructor(
        public userId: string,
        public isBanned: boolean,
        public banReason: string,
    ) { }
}

@CommandHandler(BanUserCommand)
export class BanUser implements ICommandHandler<BanUserCommand> {
    constructor(
        @InjectModel(Users.name) protected UsersModel: UsersModel,
        @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
        protected usersRepository: UsersRepository,
        protected devicesRepository: DevicesRepository,
    ) {
    }

    async execute(command: BanUserCommand) {

        const user = await this.usersRepository.findUser(
            ["_id", new Types.ObjectId(command.userId)]
        )
        if (user === null)
            return new Contract(null, ErrorEnums.USER_NOT_FOUND)


        user.banUser(command.isBanned, command.banReason)

        const deleteCount = await this.DevicesModel.deleteAllDevices(
            command.userId,
            this.DevicesModel
        )
        if (deleteCount === 0) return new Contract(null, ErrorEnums.DEVICES_NOT_DELETE)

        await this.usersRepository.saveDocument(user)

        return new Contract(true, null)
    }
}