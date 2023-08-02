import { ConfigService } from "@nestjs/config"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { ConfigType } from "src/infrastructure/settings/configuration"
import { Contract } from "src/infrastructure/utils/contract"
import { LoginBodyInputModel } from "src/features/auth/api/models/input/login.body.input-model"
import { AuthRepository } from "src/features/auth/infrastructure/auth.repository"
import { DevicesRepository } from "src/features/devices/infrastructure/devices.repository"
import { UsersRepository } from "src/features/users/infrastructure/users.repository"
import { Devices, DevicesModel } from "src/infrastructure/schemas/devices.schema"
import { RecoveryCodes, RecoveryCodesModel } from "src/infrastructure/schemas/recovery-code.schema"
import { Users, UsersModel } from "src/infrastructure/schemas/users.schema"
import { TokensService } from "src/infrastructure/services/tokens.service"
import { Secrets } from "src/infrastructure/utils/constants"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"
import { LoginOutputModel } from "src/features/auth/api/models/output/login.output-model"

export class LoginCommand {
    constructor(
        public loginBody: LoginBodyInputModel,
        public deviceIp: string,
        public userAgent: string
    ) { }
}

@CommandHandler(LoginCommand)
export class Login implements ICommandHandler<LoginCommand>{
    constructor(
        @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
        @InjectModel(Users.name) protected UsersModel: UsersModel,
        @InjectModel(RecoveryCodes.name) protected RecoveryCodesModel: RecoveryCodesModel,
        protected tokensService: TokensService,
        protected usersRepository: UsersRepository,
        protected devicesRepository: DevicesRepository,
        protected authRepository: AuthRepository,
        protected configService: ConfigService<ConfigType, true>,
    ) {
    }

    async execute(command: LoginCommand): Promise<Contract<null | LoginOutputModel>> {
        // ↓↓↓ CHECK IN LOGIN-LOCAL-STRATEGY
        const user = await this.usersRepository.findUserLoginOrEmail({
            login: command.loginBody.loginOrEmail,
            email: command.loginBody.loginOrEmail
        })
        if (user === null)
            return new Contract(null, ErrorEnums.USER_NOT_FOUND)
        if (user.accountData.banInfo.isBanned === true)
            return new Contract(null, ErrorEnums.USER_IS_BANNED)


        const checkConfirmationAndHashContract = await user.checkConfirmationAndHash(
            user.accountData.passwordHash,
            command.loginBody.password
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
                deviceIp: command.deviceIp,
                userAgent: command.userAgent,
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