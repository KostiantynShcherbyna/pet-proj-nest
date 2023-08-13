import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Devices, DevicesModel } from "../../entities/mongoose/devices.schema"
import { GetDevicesOutputModel } from "../../devices/api/models/output/get-devices.output-model"
import { dtoManager } from "../../../infrastructure/adapters/output-model.adapter"

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