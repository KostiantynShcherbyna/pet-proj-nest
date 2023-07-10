import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Contract } from "src/contracts/Contract"
import { BodyPostModel } from "src/models/body/BodyPostModel"
import { DeviceSessionModel } from "src/models/request/DeviceSessionModel"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { DevicesRepository } from "src/repositories/devices.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { Devices, DevicesModel } from "src/schemas/devices.schema"
import { Posts, PostsModel } from "src/schemas/posts.schema"
import { myStatusEnum } from "src/utils/constants/constants"
import { ErrorEnums } from "src/utils/errors/errorEnums"
import { dtoModify } from "src/utils/modify/dtoModify"
import { postView } from "src/views/postView"

@Injectable()
export class DevicesService {
    constructor(
        @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
        @Inject(DevicesRepository) protected devicesRepository: DevicesRepository,
    ) { }

    async deleteOtherDevices(userId: string, deviceId: string): Promise<Contract<null | boolean>> {

        const device = await this.devicesRepository.findDeviceByDeviceId(deviceId)
        if (device === null) return new Contract(null, ErrorEnums.NOT_FOUND_DEVICE)

        const deleteCount = await this.DevicesModel.deleteOtherDevices(userId, deviceId, this.DevicesModel)
        if (deleteCount === 0) return new Contract(null, ErrorEnums.NOT_DELETE_DEVICES)

        return new Contract(true, null)
    }

    async deleteSpecialDevice(deviceId: string, deviceSession: DeviceSessionModel): Promise<Contract<null | boolean>> {

        const device = await this.devicesRepository.findDeviceByDeviceId(deviceId)
        if (device === null) return new Contract(null, ErrorEnums.NOT_FOUND_DEVICE)
        if (device.checkOwner(deviceSession.userId) === false) return new Contract(null, ErrorEnums.NOT_DELETE_FOREIGN_DEVICE)

        const deleteCount = await this.DevicesModel.deleteDevice(deviceId, this.DevicesModel)
        if (deleteCount === 0) return new Contract(null, ErrorEnums.NOT_DELETE_DEVICE)

        return new Contract(true, null)
    }


}

