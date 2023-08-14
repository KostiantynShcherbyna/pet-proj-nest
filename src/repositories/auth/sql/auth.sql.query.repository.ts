import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Devices, DevicesModel } from "../../../features/devices/application/entites/mongoose/devices.schema"
import { GetDevicesOutputModel } from "../../../features/devices/api/models/output/get-devices.output-model"
import { dtoManager } from "../../../infrastructure/adapters/output-model.adapter"

@Injectable()
export class AuthSqlQueryRepository {
    constructor(
        @InjectModel(Devices.name) protected DevicesModel: DevicesModel
    ) { }

    async findDevicesByUserIdView(userId: string): Promise<GetDevicesOutputModel[]> {

        const devices = await this.DevicesModel.find({ userId: userId })
        const devicesView = dtoManager.createDevicesView(devices)

        return devicesView
    }


}