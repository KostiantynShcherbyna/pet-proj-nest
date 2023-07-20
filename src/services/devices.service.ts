import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Contract } from "src/contract"
import { BodyPostModel } from "src/models/body/body-post.model"
import { DeviceSessionModel } from "src/models/request/device-session.model"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { DevicesRepository } from "src/repositories/devices.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { Devices, DevicesModel } from "src/schemas/devices.schema"
import { Posts, PostsModel } from "src/schemas/posts.schema"
import { MyStatus } from "src/utils/constants/constants"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { dtoManager } from "src/utils/managers/dto.manager"
import { PostView } from "src/views/post.view"

@Injectable()
export class DevicesService {
    constructor(
        @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
        @Inject(DevicesRepository) protected devicesRepository: DevicesRepository,
    ) { }

    async deleteOtherDevices(userId: string, deviceId: string): Promise<Contract<null | boolean>> {

        const device = await this.devicesRepository.findDeviceByDeviceId(deviceId)
        if (device === null) return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)

        const deleteCount = await this.DevicesModel.deleteOtherDevices(userId, deviceId, this.DevicesModel)
        if (deleteCount === 0) return new Contract(null, ErrorEnums.DEVICES_NOT_DELETE)

        return new Contract(true, null)
    }

    async deleteSpecialDevice(deviceId: string, userId: string): Promise<Contract<null | boolean>> {

        const device = await this.devicesRepository.findDeviceByDeviceId(deviceId)
        if (device === null) return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)
        if (device.checkOwner(userId) === false) return new Contract(null, ErrorEnums.FOREIGN_DEVICE_NOT_DELETE)

        const deleteCount = await this.DevicesModel.deleteDevice(deviceId, this.DevicesModel)
        if (deleteCount === 0) return new Contract(null, ErrorEnums.DEVICE_NOT_DELETE)

        return new Contract(true, null)
    }


}

