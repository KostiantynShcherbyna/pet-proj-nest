import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"

@Injectable()
export class DevicesQueryRepositorySql {
  constructor(
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
