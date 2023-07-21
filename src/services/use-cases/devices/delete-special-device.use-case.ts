import { Injectable } from "@nestjs/common"
import { Contract } from "src/contract"
import { DevicesRepository } from "src/repositories/devices.repository"
import { DevicesModel } from "src/schemas/devices.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"


@Injectable()
export class DeleteSpecialDevice {
    constructor(
        protected DevicesModel: DevicesModel,
        protected devicesRepository: DevicesRepository,
    ) {
    }

    async execute(deviceId: string, userId: string): Promise<Contract<null | boolean>> {

        const device = await this.devicesRepository.findDeviceByDeviceId(deviceId)
        if (device === null) return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
        if (device.checkOwner(userId) === false) return new Contract(null, ErrorEnums.FOREIGN_DEVICE_NOT_DELETE)

        const deleteCount = await this.DevicesModel.deleteDevice(deviceId, this.DevicesModel)
        if (deleteCount === 0) return new Contract(null, ErrorEnums.DEVICE_NOT_DELETE)

        return new Contract(true, null)
    }


}