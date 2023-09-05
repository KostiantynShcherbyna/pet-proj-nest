import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"
import { DeviceEntity } from "../../application/entites/sql/device.entity"

interface ICreateDeviceDto {
  deviceId: string
  ip: string
  title: string
  userId: string
  lastActiveDate: string
  expireAt: string
}

interface IUpdatedActiveDateDto {
  deviceId: string
  lastActiveDate: string
  expireAt: string
}

interface IDeleteOtherDevicesDto {
  userId: string
  deviceId: string
}

@Injectable()
export class DevicesRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findDeviceByDeviceId(deviceId: string) {
    const device = await this.dataSource.createQueryBuilder(DeviceEntity, "d")
      .select([
        `d.DeviceId as "deviceId"`,
        `d.Ip as "ip"`,
        `d.Title as "title"`,
        `d.LastActiveDate as "lastActiveDate"`,
        `d.UserId as "userId"`,
        `d.ExpireAt as "expireAt"`
      ])
      .where(`d.DeviceId = :deviceId`, { deviceId })
      .getRawOne()
    return device ? device : null
  }

  async createDevice({ deviceId, ip, title, userId, lastActiveDate, expireAt }: ICreateDeviceDto): Promise<string> {
    const result = await this.dataSource.createQueryBuilder(DeviceEntity, "d")
      .insert()
      .values({
        DeviceId: deviceId,
        Ip: ip,
        Title: title,
        UserId: userId,
        LastActiveDate: lastActiveDate,
        ExpireAt: expireAt
      })
      .execute()
    return result.identifiers[0].DeviceId
  }

  async updateActiveDate({ deviceId, lastActiveDate, expireAt }: IUpdatedActiveDateDto): Promise<number | null> {
    const result = await this.dataSource.createQueryBuilder(DeviceEntity, "d")
      .update()
      .set({ LastActiveDate: lastActiveDate, ExpireAt: expireAt })
      .where(`d.DeviceId = :deviceId`, { deviceId })
      .execute()
    return result.affected ? result.affected : null
  }

  async deleteDevice(deviceId: string): Promise<number | null> {
    const result = await this.dataSource.createQueryBuilder(DeviceEntity, "d")
      .delete()
      .where(`d.DeviceId = :deviceId`, { deviceId })
      .execute()
    return result.affected ? result.affected : null
  }

  async deleteOtherDevices({ userId, deviceId }: IDeleteOtherDevicesDto): Promise<number | null> {
    const result = await this.dataSource.createQueryBuilder(DeviceEntity, "d")
      .delete()
      .where(`d.DeviceId != :deviceId`, { deviceId })
      .andWhere(`d.UserId = :userId`, { userId })
      .execute()
    return result.affected ? result.affected : null
  }

}
