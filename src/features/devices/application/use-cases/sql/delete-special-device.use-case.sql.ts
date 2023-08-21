import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Devices, DevicesModel } from "../../entites/mongoose/devices.schema"
import { DevicesRepository } from "../../../repository/mongoose/devices.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { DevicesRepositorySql } from "../../../repository/sql/devices.repository.sql"


export class DeleteSpecialDeviceCommandSql {
  constructor(
    public deviceId: string,
    public userId: string
  ) {
  }
}


@CommandHandler(DeleteSpecialDeviceCommandSql)
export class DeleteSpecialDeviceSql implements ICommandHandler<DeleteSpecialDeviceCommandSql> {
  constructor(
    @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
    protected devicesSqlRepository: DevicesRepositorySql,
  ) {
  }

  async execute(command: DeleteSpecialDeviceCommandSql): Promise<Contract<null | boolean>> {

    const device = await this.devicesSqlRepository.findDeviceByDeviceId(command.deviceId)
    if (device === null) return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
    if (device.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_DEVICE)

    const deleteCount = await this.devicesSqlRepository.deleteDevice(command.deviceId)
    if (deleteCount === null) return new Contract(null, ErrorEnums.DEVICE_NOT_DELETE)

    return new Contract(true, null)
  }


}