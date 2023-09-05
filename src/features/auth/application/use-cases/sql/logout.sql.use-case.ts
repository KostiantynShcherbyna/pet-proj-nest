import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { DevicesRepositoryOrm } from "../../../../devices/repository/orm/devices.repository.orm"
import { UsersRepositoryOrm } from "../../../../sa/repository/orm/users.repository.orm"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"

export class LogoutSqlCommand {
  constructor(
    public deviceId: string,
    public expireAt: Date,
    public ip: string,
    public lastActiveDate: string,
    public title: string,
    public userId: string
  ) {
  }
}

@CommandHandler(LogoutSqlCommand)
export class LogoutSql implements ICommandHandler<LogoutSqlCommand> {
  constructor(
    protected devicesSqlRepository: DevicesRepositoryOrm,
    protected usersSqlRepository: UsersRepositoryOrm,
  ) {
  }

  async execute(command: LogoutSqlCommand): Promise<Contract<null | boolean>> {

    const user = await this.usersSqlRepository.findUserByUserId(command.userId)
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const device = await this.devicesSqlRepository.findDeviceByDeviceId(command.deviceId)
    if (device === null)
      return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
    if (command.lastActiveDate !== device.lastActiveDate)
      return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)

    const deleteResult = await this.devicesSqlRepository.deleteDevice(command.deviceId)
    if (deleteResult === null)
      return new Contract(null, ErrorEnums.DEVICE_NOT_DELETE)

    return new Contract(true, null)
  }


}