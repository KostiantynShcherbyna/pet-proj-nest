import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Devices, DevicesModel } from "src/schemas/devices.schema"
import { dtoManager } from "src/utils/managers/dto.manager"
import { DeviceView } from "src/views/device.view"

@Injectable()
export class AuthQueryRepository {
    constructor(
        @InjectModel(Devices.name) protected DevicesModel: DevicesModel
    ) { }

    async findDevicesByUserIdView(userId: string): Promise<DeviceView[]> {

        const devices = await this.DevicesModel.find({ userId: userId })
        const devicesView = dtoManager.createDevicesView(devices)

        return devicesView
    }


}