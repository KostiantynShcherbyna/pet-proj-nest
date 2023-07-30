import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Types } from "mongoose"
import { Contract } from "src/contract"
import { BodyUserBanBloggerInputModel } from "src/input-models/body/body-user-ban-blogger.input-model"
import { DevicesRepository } from "src/repositories/devices.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { Devices, DevicesModel } from "src/schemas/devices.schema"
import { Users, UsersDocument, UsersModel } from "src/schemas/users.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { UserView } from "src/views/user.view"

export class BanUserBloggerCommand {
    constructor(
        public userId: string,
        public bodyUserBan: BodyUserBanBloggerInputModel,
    ) { }
}

@CommandHandler(BanUserBloggerCommand)
export class BanUserBlogger implements ICommandHandler<BanUserBloggerCommand> {
    constructor(
        @InjectModel(Users.name) protected UsersModel: UsersModel,
        @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
        protected usersRepository: UsersRepository,
        protected devicesRepository: DevicesRepository,
    ) {
    }

    async execute(command: BanUserBloggerCommand) {

        const user = await this.usersRepository.findUser(
            ["_id", new Types.ObjectId(command.userId)]
        )
        if (user === null)
            return new Contract(null, ErrorEnums.USER_NOT_FOUND)

        let result: number | null = null
        if (command.bodyUserBan.isBanned === true) result = await user.banUser(true, command.bodyUserBan.banReason, command.userId, this.DevicesModel)
        if (command.bodyUserBan.isBanned === false) result = user.unBanUser(false)

        // if (result !== null && result === 0) return new Contract(null, ErrorEnums.DEVICES_NOT_DELETE)

        await this.usersRepository.saveDocument(user)

        return new Contract(true, null)
    }
}