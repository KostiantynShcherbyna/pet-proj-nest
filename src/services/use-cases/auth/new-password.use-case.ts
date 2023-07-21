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
        protected tokensService: TokensService,
        protected usersRepository: UsersRepository,
        protected configService: ConfigService<ConfigType, true>,
    ) {
    }

    async execute(newPassword: string, recoveryCode: string): Promise<Contract<null | boolean>> {

        const passwordRecoveryCodeSecret = this.configService.get(Secrets.PASSWORD_RECOVERY_CODE_SECRET, { infer: true })
        const verifiedEmailDto = await this.tokensService.verifyToken(recoveryCode, passwordRecoveryCodeSecret)
        if (verifiedEmailDto === null) return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)


        const oldRecoveryCodeDto = await this.authRepository.findRecoveryCode(verifiedEmailDto.email)
        if (oldRecoveryCodeDto === null) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_FOUND)
        if (oldRecoveryCodeDto.checkRecoveryCode(recoveryCode) === false) return new Contract(null, ErrorEnums.RECOVERY_CODE_INVALID)


        const emailDto = { "accountData.email": verifiedEmailDto.email }
        const user = await this.usersRepository.findUser(emailDto)
        if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)


        await user.updatePasswordHash(newPassword)
        await this.usersRepository.saveDocument(user)

        return new Contract(true, null)
    }


}