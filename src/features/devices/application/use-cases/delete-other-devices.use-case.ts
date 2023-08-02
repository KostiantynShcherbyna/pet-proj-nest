import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Contract } from "src/infrastructure/utils/contract"
import { DevicesRepository } from "src/features/devices/infrastructure/devices.repository"
import { Devices, DevicesModel } from "src/features/auth/application/entitys/devices.schema"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"

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