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

  async findDevice(id: string) {
    const device = await this.dataSource.query(`
    select "Id"
    from devices."Devices"
    where "Id" = $1
    `, [id])

    return device.length ? device[0] : null
  }

  async createDevice({ id, ip, title, userId, lastActiveDate, expireAt }) {
    const newDeviceResult = await this.dataSource.query(`
    insert into devices."Devices"("Id", "Ip", "Title", "UserId", "LastActiveDate", "ExpireAt")
    values($1, $2, $3, $4, $5, $6)
    returning "Id"
    `, [id, ip, title, userId, lastActiveDate, expireAt])
    return newDeviceResult[0]
  }

  async updateActiveDate({ id, lastActiveDate, expireAt }) {
    await this.dataSource.query(`
    update devices."Devices"
    set "LastActiveDate" = $2, "ExpireAt" = $3
    where "Id" = $1
    `, [id, lastActiveDate, expireAt])
  }

  async deleteDevice(id: number) {
    const deleteResult = await this.dataSource.query(`
    delete from users."EmailConfirmation"
    where "Id" = $1
    `, [id])
    return deleteResult.length ? deleteResult : null
  }

}
