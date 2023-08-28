import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import {
  Devices,
  DevicesDocument,
  DevicesModel
} from "../../application/entites/mongoose/devices.schema"
import { DataSource } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"
import { randomUUID } from "crypto"
import { addSeconds } from "date-fns"
import { EXPIRE_AT_ACCESS } from "../../../../infrastructure/utils/constants"

@Injectable()
export class DevicesQueryRepositorySql {
  constructor(
    @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findDevicesByUserId(userId: string) {
    const devices = await this.dataSource.query(`
    select "DeviceId" as "deviceId",
     "Ip" as "ip",
     "Title" as "title",
     "LastActiveDate" as "lastActiveDate"
    from public."device_entity"
    where "UserId" = $1
    `, [userId])

    return devices.length ? devices : null
  }


}
