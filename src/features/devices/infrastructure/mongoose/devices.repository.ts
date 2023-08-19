import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Devices, DevicesDocument, DevicesModel } from "../../application/entites/mongoose/devices.schema"

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Devices.name) protected DevicesModel: DevicesModel
  ) {
  }

  async findDeviceByDeviceId(deviceId: string) {

    const device = await this.DevicesModel.findOne({ deviceId: deviceId })
    if (device === null) return null

    return device
  }

  async saveDocument(document: DevicesDocument) {
    await document.save()
  }

}
