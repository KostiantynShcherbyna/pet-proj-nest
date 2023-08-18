import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import {
  Devices,
  DevicesDocument,
  DevicesModel
} from "../../../features/devices/application/entites/mongoose/devices.schema"
import { DataSource } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"
import { randomUUID } from "crypto"
import { addSeconds } from "date-fns"
import { EXPIRE_AT_ACCESS } from "../../../infrastructure/utils/constants"

@Injectable()
export class DevicesSqlRepository {
  constructor(
    @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findDeviceByDeviceId(id: string) {
    const devices = await this.dataSource.query(`
    select "DeviceId" as "deviceId",
     "Ip" as "ip",
     "Title" as "title",
     "LastActiveDate" as "lastActiveDate",
     "UserId" as "userId",
     "ExpireAt" as "expireAt"
    from devices."Devices"
    where "DeviceId" = $1
    `, [id])

    return devices.length ? devices[0] : null
  }

  async createDevice({ deviceId, ip, title, userId, lastActiveDate, expireAt }) {
    const newDeviceResult = await this.dataSource.query(`
    insert into devices."Devices"("DeviceId", "Ip", "Title", "UserId", "LastActiveDate", "ExpireAt")
    values($1, $2, $3, $4, $5, $6)
    returning "DeviceId"
    `, [deviceId, ip, title, userId, lastActiveDate, expireAt])
    return newDeviceResult[0]
  }

  async updateActiveDate({ deviceId, lastActiveDate, expireAt }) {
    const updateResult = await this.dataSource.query(`
    update devices."Devices"
    set "LastActiveDate" = $2, "ExpireAt" = $3
    where "DeviceId" = $1
    `, [deviceId, lastActiveDate, expireAt])
    return updateResult.length ? updateResult[1] : null
  }

  async deleteDevice(deviceId: string) {
    const deleteResult = await this.dataSource.query(`
    delete from devices."Devices"
    where "DeviceId" = $1
    `, [deviceId])
    return deleteResult.length ? deleteResult[1] : null
  }

  async deleteOtherDevices({ userId, deviceId }) {
    const deleteResult = await this.dataSource.query(`
    delete from devices."Devices"
    where "UserId" = $1 and "DeviceId" <> $2
//     where "DeviceId" not in (select "DeviceId" from devices."Devices" where "DeviceId" = $1)
    `, [userId, deviceId])
    return deleteResult.length ? deleteResult[1] : null
  }

}
