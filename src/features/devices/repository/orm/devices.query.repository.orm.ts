import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"
import { DeviceEntity } from "../../application/entites/sql/device.entity"

@Injectable()
export class DevicesQueryRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findDevicesByUserId2(userId: string) {
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

  async findDevicesByUserId(userId: string) {
    const devices = await this.dataSource.createQueryBuilder(DeviceEntity, "d")
      .select([
        `d.DeviceId as "deviceId"`,
        `d.Ip as "ip"`,
        `d.Title as "title"`,
        `d.LastActiveDate as "lastActiveDate"`
      ])
      .where(`d.Userid = :userId`, { userId })
      .getRawMany()
    return devices ? devices : null
  }


}
