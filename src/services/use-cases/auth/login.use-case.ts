import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ConfigType } from "src/configuration"
import { Contract } from "src/contract"
import { BodyAuthModel } from "src/models/body/body-auth.model"
import { BodyUserModel } from "src/models/body/body-user.model"
import { AuthRepository } from "src/repositories/auth.repository"
import { DevicesRepository } from "src/repositories/devices.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { DevicesModel } from "src/schemas/devices.schema"
import { RecoveryCodesModel } from "src/schemas/recovery-code.schema"
import { UsersDocument, UsersModel } from "src/schemas/users.schema"
import { TokensService } from "src/services/tokens.service"
import { Secrets } from "src/utils/constants/constants"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { TokensView } from "src/views/tokens.view"
import { UserView } from "src/views/user.view"

@Injectable()
export class Login {
    constructor(
        protected DevicesModel: DevicesModel,
        protected UsersModel: UsersModel,
        protected RecoveryCodesModel: RecoveryCodesModel,
        protected usersRepository: UsersRepository,
        protected devicesRepository: DevicesRepository,
        protected authRepository: AuthRepository,
        protected tokensService: TokensService,
        protected configService: ConfigService<ConfigType, true>,
    ) {
    }

    async execute(loginBody: BodyAuthModel, deviceIp: string, userAgent: string): Promise<Contract<null | TokensView>> {
        // ↓↓↓ CHECK IN LOGIN-LOCAL-STRATEGY
        const user = await this.usersRepository.findUserLoginOrEmail({
            login: loginBody.loginOrEmail,
            email: loginBody.loginOrEmail
        })
        if (user === null)
            return new Contract(null, ErrorEnums.USER_NOT_FOUND)


        const checkConfirmationAndHashContract = await user.checkConfirmationAndHash(
            user.accountData.passwordHash,
            loginBody.password
        )
        if (checkConfirmationAndHashContract.error === ErrorEnums.USER_EMAIL_NOT_CONFIRMED)
            return new Contract(null, ErrorEnums.USER_EMAIL_NOT_CONFIRMED)
        if (checkConfirmationAndHashContract.error === ErrorEnums.PASSWORD_NOT_COMPARED)
            return new Contract(null, ErrorEnums.PASSWORD_NOT_COMPARED)
        // ↑↑↑

        const accessJwtSecret = this.configService.get(Secrets.ACCESS_JWT_SECRET)
        const refreshJwtSecret = this.configService.get(Secrets.REFRESH_JWT_SECRET)
        const newTokens = await this.DevicesModel.createDevice(
            {
                deviceIp,
                userAgent,
                userId: user._id.toString(),
                accessJwtSecret,
                refreshJwtSecret
            },
            this.DevicesModel
        )
        await this.devicesRepository.saveDocument(newTokens.refreshEntry)


        const tokensDto = {
            accessJwt: { accessToken: newTokens.accessToken },
            refreshToken: newTokens.refreshToken
        }
        return new Contract(tokensDto, null)
    }


}