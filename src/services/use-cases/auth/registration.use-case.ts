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
export class Registration {
    constructor(
        protected usersRepository: UsersRepository,
        protected UsersModel: UsersModel,
    ) {
    }


    async execute(registrationBody: BodyRegistrationModel): Promise<Contract<null | boolean>> {

        const user = await this.usersRepository.findUserLoginOrEmail(registrationBody)
        const checkEmailAndLoginContract = user?.checkEmailAndLogin(
            {
                email: user?.accountData.email,
                login: user?.accountData.login,
                inputEmail: registrationBody.email,
                inputLogin: registrationBody.login
            }
        )
        if (checkEmailAndLoginContract?.error === ErrorEnums.USER_EMAIL_EXIST)
            return new Contract(null, ErrorEnums.USER_EMAIL_EXIST)
        if (checkEmailAndLoginContract?.error === ErrorEnums.USER_LOGIN_EXIST)
            return new Contract(null, ErrorEnums.USER_LOGIN_EXIST)


        const newUser = await this.UsersModel.registrationUser(registrationBody, this.UsersModel)
        await this.usersRepository.saveDocument(newUser)

        // SENDING EMAIL ↓↓↓ TODO TO CLASS
        const isSend = await emailAdapter.sendConfirmationCode(newUser)
        if (isSend === false) {
            const deletedUserContract = await this.UsersModel.deleteUser(newUser._id.toString(), this.UsersModel)
            if (deletedUserContract.data === 0) return new Contract(null, ErrorEnums.USER_NOT_DELETE)

            return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
        }


        newUser.addSentDate()
        await this.usersRepository.saveDocument(newUser)

        return new Contract(true, null)
    }


}