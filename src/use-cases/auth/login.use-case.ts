import { ConfigService } from "@nestjs/config"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { ConfigType } from "src/configuration"
import { Contract } from "src/contract"
import { BodyAuthInputModel } from "src/input-models/body/body-auth.input-model"
import { AuthRepository } from "src/repositories/auth.repository"
import { DevicesRepository } from "src/repositories/devices.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { Devices, DevicesModel } from "src/schemas/devices.schema"
import { RecoveryCodes, RecoveryCodesModel } from "src/schemas/recovery-code.schema"
import { Users, UsersModel } from "src/schemas/users.schema"
import { TokensService } from "src/services/tokens.service"
import { Secrets } from "src/utils/constants/constants"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { TokensView } from "src/views/tokens.view"

export class LoginCommand {
    constructor(
        public loginBody: BodyAuthInputModel,
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

    async execute(command: LoginCommand): Promise<Contract<null | TokensView>> {
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