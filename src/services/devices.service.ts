import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Contract } from "src/contract"
import { DevicesRepository } from "src/repositories/devices.repository"
import { Devices, DevicesModel } from "src/schemas/devices.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"

@Injectable()
export class DevicesService {
    constructor(
        @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
        @Inject(DevicesRepository) protected devicesRepository: DevicesRepository,
    ) { }

    async deleteOtherDevices(userId: string, deviceId: string): Promise<Contract<null | boolean>> {

        const device = await this.devicesRepository.findDeviceByDeviceId(deviceId)
        if (device === null) return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)

        const deleteCount = await this.DevicesModel.deleteOtherDevices(userId, deviceId, this.DevicesModel)
        if (deleteCount === 0) return new Contract(null, ErrorEnums.DEVICES_NOT_DELETE)

        return new Contract(true, null)
    }

    async deleteSpecialDevice(deviceId: string, userId: string): Promise<Contract<null | boolean>> {

        const device = await this.devicesRepository.findDeviceByDeviceId(deviceId)
        if (device === null) return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
        if (device.checkOwner(userId) === false) return new Contract(null, ErrorEnums.FOREIGN_DEVICE)

        const deleteCount = await this.DevicesModel.deleteDevice(deviceId, this.DevicesModel)
        if (deleteCount === 0) return new Contract(null, ErrorEnums.DEVICE_NOT_DELETE)

        return new Contract(true, null)
    }


}

