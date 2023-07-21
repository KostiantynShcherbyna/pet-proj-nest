import { Injectable } from "@nestjs/common"
import { Contract } from "src/contract"
import { DevicesRepository } from "src/repositories/devices.repository"
import { DevicesModel } from "src/schemas/devices.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"

@Injectable()
export class DeleteOtherDevices {
    constructor(
        protected DevicesModel: DevicesModel,
        protected devicesRepository: DevicesRepository,
    ) {
    }

    async execute(userId: string, deviceId: string): Promise<Contract<null | boolean>> {

        const device = await this.devicesRepository.findDeviceByDeviceId(deviceId)
        if (device === null) return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)

        const deleteCount = await this.DevicesModel.deleteOtherDevices(userId, deviceId, this.DevicesModel)
        if (deleteCount === 0) return new Contract(null, ErrorEnums.DEVICES_NOT_DELETE)

        return new Contract(true, null)
    }

}