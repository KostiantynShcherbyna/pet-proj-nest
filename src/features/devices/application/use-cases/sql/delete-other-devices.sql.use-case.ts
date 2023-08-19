import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Devices, DevicesModel } from "../../entites/mongoose/devices.schema"
import { DevicesRepository } from "../../../infrastructure/mongoose/devices.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { DevicesSqlRepository } from "../../../infrastructure/sql/devices.sql.repository"


export class DeleteOtherDevicesSqlCommand {
  constructor(
    public userId: string,
    public deviceId: string
  ) {
  }
}


@CommandHandler(DeleteOtherDevicesSqlCommand)
export class DeleteOtherDevicesSql implements ICommandHandler<DeleteOtherDevicesSqlCommand> {
  constructor(
    @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
    protected devicesSqlRepository: DevicesSqlRepository,
  ) {
  }

  async execute(command: DeleteOtherDevicesSqlCommand): Promise<Contract<null | boolean>> {

    const device = await this.devicesSqlRepository.findDeviceByDeviceId(command.deviceId)
    if (device === null) return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)

    const deleteCount = await this.devicesSqlRepository.deleteOtherDevices({
      userId: command.userId,
      deviceId: command.deviceId
    })
    if (deleteCount === null) return new Contract(null, ErrorEnums.DEVICES_NOT_DELETE)

    return new Contract(true, null)
  }

}