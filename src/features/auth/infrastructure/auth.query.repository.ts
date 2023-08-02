import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Devices, DevicesModel } from "src/features/auth/application/entity/devices.schema"
import { dtoManager } from "src/infrastructure/adapters/output-model.adapter"
import { GetDevicesOutputModel } from "src/features/devices/api/models/output/get-devices.output-model"

@Injectable()
export class AuthQueryRepository {
    constructor(
        @InjectModel(Devices.name) protected DevicesModel: DevicesModel
    ) { }

    async findDevicesByUserIdView(userId: string): Promise<GetDevicesOutputModel[]> {

        const devices = await this.DevicesModel.find({ userId: userId })
        const devicesView = dtoManager.createDevicesView(devices)

        return devicesView
    }


}