import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Devices, DevicesModel } from "../entites/mongoose/devices.schema"
import { DevicesRepository } from "../../../../repositories/devices/mongoose/devices.repository"
import { Contract } from "../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"


export class DeleteOtherDevicesCommand {
  constructor(
    public userId: string,
    public deviceId: string
  ) {
  }
}


@CommandHandler(DeleteOtherDevicesCommand)
export class DeleteOtherDevices implements ICommandHandler<DeleteOtherDevicesCommand> {
  constructor(
    @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
    protected devicesRepository: DevicesRepository,
  ) {
  }

  async execute(command: DeleteOtherDevicesCommand): Promise<Contract<null | boolean>> {

    const device = await this.devicesRepository.findDeviceByDeviceId(command.deviceId)
    if (device === null) return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)

    const deleteCount = await Devices.deleteOtherDevices(command.userId, command.deviceId, this.DevicesModel)
    if (deleteCount === 0) return new Contract(null, ErrorEnums.DEVICES_NOT_DELETE)

    return new Contract(true, null)
  }

}