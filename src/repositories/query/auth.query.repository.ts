import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Devices, DevicesModel } from "src/schemas/devices.schema"
import { dtoModify } from "src/utils/modify/dtoModify"
import { DeviceView } from "src/views/DeviceView"

@Injectable()
export class AuthQueryRepository {
    constructor(
        @InjectModel(Devices.name) protected DevicesModel: DevicesModel
    ) { }

    async findDevicesByUserIdView(userId: string): Promise<DeviceView[]> {

        const devices = await this.DevicesModel.find({ userId: userId })
        const devicesView = dtoModify.createDevicesView(devices)

        return devicesView
    }


}