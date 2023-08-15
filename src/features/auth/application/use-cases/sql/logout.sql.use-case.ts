import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { DevicesSqlRepository } from "../../../../../repositories/devices/sql/devices.sql.repository"
import { UsersSqlRepository } from "../../../../../repositories/users/sql/users.sql.repository"
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
    protected devicesSqlRepository: DevicesSqlRepository,
    protected usersSqlRepository: UsersSqlRepository,
  ) {
  }

  async execute(command: LogoutSqlCommand): Promise<Contract<null | boolean>> {

    const user = await this.usersSqlRepository.findUser({ key: "UserId", value: command.userId })
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const device = await this.devicesSqlRepository.findDevice(command.deviceId)
    if (device === null)
      return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
    if (command.lastActiveDate < device.lastActiveDate)
      return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)

    const deleteResult = await this.devicesSqlRepository.deleteDevice(Number(command.deviceId))
    if (deleteResult === null)
      return new Contract(null, ErrorEnums.DEVICE_NOT_DELETE)

    return new Contract(true, null)
  }


}