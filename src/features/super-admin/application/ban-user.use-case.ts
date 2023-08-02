import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Types } from "mongoose"
import { Contract } from "src/infrastructure/utils/contract"
import { UsersRepository } from "src/features/super-admin/infrastructure/users.repository"
import { Devices, DevicesModel } from "src/infrastructure/schemas/devices.schema"
import { Users, UsersModel } from "src/infrastructure/schemas/users.schema"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"

export class BanUserCommand {
  constructor(
    public userId: string,
    public isBanned: boolean,
    public banReason: string,
  ) {
  }
}

@CommandHandler(BanUserCommand)
export class BanUser implements ICommandHandler<BanUserCommand> {
  constructor(
    @InjectModel(Users.name) protected UsersModel: UsersModel,
    @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
    protected usersRepository: UsersRepository,
  ) {
  }

  async execute(command: BanUserCommand) {

    const user = await this.usersRepository.findUser(
      ["_id", new Types.ObjectId(command.userId)]
    )
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (user.accountData.banInfo.isBanned === command.isBanned)
      return new Contract(true, null)

    const result = command.isBanned === true
      ? await user.banUser(command.banReason, command.userId, this.DevicesModel)
      : user.unBanUser()

    if (result === 0) return new Contract(null, ErrorEnums.USER_NOT_BANNED)

    await this.usersRepository.saveDocument(user)

    return new Contract(true, null)
  }
}