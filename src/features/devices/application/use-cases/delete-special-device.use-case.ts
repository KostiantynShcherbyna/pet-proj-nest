import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Devices, DevicesModel } from "../../../entities/mongoose/devices.schema"
import { DevicesRepository } from "../../infrastructure/devices.repository"
import { Contract } from "../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"


export class DeleteSpecialDeviceCommand {
  constructor(
    public deviceId: string,
    public userId: string
  ) {
  }
}


@CommandHandler(DeleteSpecialDeviceCommand)
export class DeleteSpecialDevice implements ICommandHandler<DeleteSpecialDeviceCommand> {
  constructor(
    @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
    protected devicesRepository: DevicesRepository,
  ) {
  }

  async execute(command: DeleteSpecialDeviceCommand): Promise<Contract<null | boolean>> {

    const device = await this.devicesRepository.findDeviceByDeviceId(command.deviceId)
    if (device === null) return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
    if (device.checkOwner(command.userId) === false) return new Contract(null, ErrorEnums.FOREIGN_DEVICE)

    const deleteCount = await Devices.deleteDevice(command.deviceId, this.DevicesModel)
    if (deleteCount === 0) return new Contract(null, ErrorEnums.DEVICE_NOT_DELETE)

    return new Contract(true, null)
  }


}