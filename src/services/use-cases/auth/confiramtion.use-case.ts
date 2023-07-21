import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Types } from "mongoose"
import { ConfigType } from "src/configuration"
import { Contract } from "src/contract"
import { BodyAuthModel } from "src/models/body/body-auth.model"
import { BodyRegistrationModel } from "src/models/body/body-registration.model"
import { BodyUserModel } from "src/models/body/body-user.model"
import { DeviceSessionModel } from "src/models/request/device-session.model"
import { AuthRepository } from "src/repositories/auth.repository"
import { DevicesRepository } from "src/repositories/devices.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { DevicesModel } from "src/schemas/devices.schema"
import { RecoveryCodesModel } from "src/schemas/recovery-code.schema"
import { UsersDocument, UsersModel } from "src/schemas/users.schema"
import { TokensService } from "src/services/tokens.service"
import { Secrets } from "src/utils/constants/constants"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { emailAdapter } from "src/utils/managers/email.adapter"
import { TokensView } from "src/views/tokens.view"
import { UserView } from "src/views/user.view"

@Injectable()
export class Confirmation {
    constructor(
        protected usersRepository: UsersRepository,
    ) {
    }

    async execute(code: string): Promise<Contract<null | boolean>> {

        const confirmationCodeDto = ["emailConfirmation.confirmationCode", code]
        const user = await this.usersRepository.findUser(confirmationCodeDto)
        if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)
        if (user.checkConfirmation() === true) return new Contract(null, ErrorEnums.USER_EMAIL_CONFIRMED)
        if (user.checkExpiration() === false) return new Contract(null, ErrorEnums.CONFIRMATION_CODE_EXPIRED)

        user.updateUserConfirmation()
        await this.usersRepository.saveDocument(user)

        return new Contract(true, null)
    }


}