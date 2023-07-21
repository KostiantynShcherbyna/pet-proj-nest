import { Injectable } from "@nestjs/common"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "src/contract"
import { DevicesRepository } from "src/repositories/devices.repository"
import { DevicesModel } from "src/schemas/devices.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"

export class DeleteOtherDevicesCommand {
    constructor(public userId: string, public deviceId: string) { }
}


@CommandHandler(DeleteOtherDevicesCommand)
export class DeleteOtherDevices implements ICommandHandler<DeleteOtherDevicesCommand>{
    constructor(
        protected DevicesModel: DevicesModel,
        protected devicesRepository: DevicesRepository,
    ) {
    }

    async execute(command: DeleteOtherDevicesCommand): Promise<Contract<null | boolean>> {

        const device = await this.devicesRepository.findDeviceByDeviceId(command.deviceId)
        if (device === null) return new Contract(null, ErrorEnums.DEVICE_NOT_FOUND)

        const deleteCount = await this.DevicesModel.deleteOtherDevices(command.userId, command.deviceId, this.DevicesModel)
        if (deleteCount === 0) return new Contract(null, ErrorEnums.DEVICES_NOT_DELETE)

        return new Contract(true, null)
    }

}