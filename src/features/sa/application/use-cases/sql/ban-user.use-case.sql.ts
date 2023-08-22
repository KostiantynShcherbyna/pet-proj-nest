import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Types } from "mongoose"
import { Users, UsersModel } from "../../entities/mongoose/users.schema"
import { Devices, DevicesModel } from "../../../../devices/application/entites/mongoose/devices.schema"
import { UsersRepository } from "../../../repository/mongoose/users.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { UsersRepositorySql } from "../../../repository/sql/users.repository.sql"


export class BanUserCommandSql {
  constructor(
    public userId: string,
    public isBanned: boolean,
    public banReason: string,
  ) {
  }
}

@CommandHandler(BanUserCommandSql)
export class BanUserSql implements ICommandHandler<BanUserCommandSql> {
  constructor(
    @InjectModel(Users.name) protected UsersModel: UsersModel,
    @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
    protected usersSqlRepository: UsersRepositorySql,
  ) {
  }

  async execute(command: BanUserCommandSql) {

    const user = await this.usersSqlRepository.findUserByUserId(command.userId)
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (user.isBanned === command.isBanned)
      return new Contract(true, null)

    const result = command.isBanned
      ? await this.usersSqlRepository.updateUserBan(
        command.userId,
        command.isBanned,
        command.banReason,
        new Date(Date.now()).toISOString()
      )
      : await this.usersSqlRepository.updateUserBan(
        command.userId,
        command.isBanned,
      )

    return new Contract(true, null)
  }
}