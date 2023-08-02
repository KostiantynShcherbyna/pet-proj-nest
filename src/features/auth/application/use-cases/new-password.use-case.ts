import { ConfigService } from "@nestjs/config"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { ConfigType } from "src/infrastructure/settings/configuration"
import { Contract } from "src/infrastructure/utils/contract"
import { AuthRepository } from "src/features/auth/infrastructure/auth.repository"
import { UsersRepository } from "src/features/super-admin/infrastructure/users.repository"
import { TokensService } from "src/infrastructure/services/tokens.service"
import { Secrets } from "src/infrastructure/utils/constants"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"

export class NewPasswordCommand {
    constructor(public newPassword: string, public recoveryCode: string) { }
}

@CommandHandler(NewPasswordCommand)
export class NewPassword implements ICommandHandler<NewPasswordCommand>{
    constructor(
        protected tokensService: TokensService,
        protected authRepository: AuthRepository,
        protected usersRepository: UsersRepository,
        protected configService: ConfigService<ConfigType, true>,
    ) {
    }

    async execute(command: NewPasswordCommand): Promise<Contract<null | boolean>> {

        const passwordRecoveryCodeSecret = this.configService.get(Secrets.PASSWORD_RECOVERY_CODE_SECRET, { infer: true })
        const verifiedEmailDto = await this.tokensService.verifyToken(command.recoveryCode, passwordRecoveryCodeSecret)
        if (verifiedEmailDto === null) return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)


        const oldRecoveryCodeDto = await this.authRepository.findRecoveryCode(verifiedEmailDto.email)
        if (oldRecoveryCodeDto === null) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_FOUND)
        if (oldRecoveryCodeDto.checkRecoveryCode(command.recoveryCode) === false) return new Contract(null, ErrorEnums.RECOVERY_CODE_INVALID)


        const emailDto = { "accountData.email": verifiedEmailDto.email }
        const user = await this.usersRepository.findUser(emailDto)
        if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)


        await user.updatePasswordHash(command.newPassword)
        await this.usersRepository.saveDocument(user)

        return new Contract(true, null)
    }


}