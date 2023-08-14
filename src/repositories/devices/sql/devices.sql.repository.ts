import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import {
  Devices,
  DevicesDocument,
  DevicesModel
} from "../../../features/devices/application/entites/mongoose/devices.schema"
import { DataSource } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"

@Injectable()
export class DevicesSqlRepository {
  constructor(
    @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findDevice(deviceId: string) {
    const device = await this.dataSource.query(`
    select "DeviceId"
    from devices."Devices"
    where "DeviceId" = $1
    `, [deviceId])

    return device.length ? device[0] : null
  }

  async updateActiveDate({ lastActiveDate, expireAt, deviceId }) {
    await this.dataSource.query(`
    update devices."Devices"
    set "LastActiveDate" = $1, "ExpireAt" = $2
    where "DeviceId" = $3
    `, [lastActiveDate, expireAt, deviceId])
  }

}
