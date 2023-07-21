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
        protected authRepository: AuthRepository,
        protected RecoveryCodesModel: RecoveryCodesModel,
        protected tokensService: TokensService,
        protected configService: ConfigService<ConfigType, true>,
    ) {
    }

    async execute(email: string): Promise<Contract<null | boolean>> {

        const oldRecoveryCode = await this.authRepository.findRecoveryCode(email)
        if (oldRecoveryCode === null) return new Contract(null, ErrorEnums.CONFIRMATION_CODE_EXPIRED)

        const passwordRecoveryCodeSecret = this.configService.get(Secrets.PASSWORD_RECOVERY_CODE_SECRET, { infer: true })
        const newRecoveryCodeDocument = await this.RecoveryCodesModel.createPasswordRecovery(email, passwordRecoveryCodeSecret, this.tokensService, this.RecoveryCodesModel,)
        await this.authRepository.saveDocument(newRecoveryCodeDocument)


        oldRecoveryCode.deactivatePasswordRecovery()

        // SENDING PASSWORD RECOVERY ↓↓↓
        const isSend = await emailAdapter.sendPasswordRecovery(newRecoveryCodeDocument.email, newRecoveryCodeDocument.recoveryCode)
        if (isSend === false) {
            const deletedResult = await this.RecoveryCodesModel.deleteOne({ email: email })
            if (deletedResult.deletedCount === 0) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_DELETE)
            return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
        }

        return new Contract(true, null)
    }


}