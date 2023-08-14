import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { TokensService } from "../../../../../infrastructure/services/tokens.service"
import { AuthRepository } from "../../../../../repositories/auth/mongoose/auth.repository"
import { UsersRepository } from "../../../../../repositories/users/mongoose/users.repository"
import { ConfigService, ConfigType } from "@nestjs/config"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { Secrets } from "../../../../../infrastructure/utils/constants"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"

export class NewPasswordCommand {
  constructor(public newPassword: string, public recoveryCode: string) {
  }
}

@CommandHandler(NewPasswordCommand)
export class NewPassword implements ICommandHandler<NewPasswordCommand> {
  constructor(
    protected tokensService: TokensService,
    protected authRepository: AuthRepository,
    protected usersRepository: UsersRepository,
    protected configService: ConfigService<ConfigType<any>, true>,
  ) {
  }

  async execute(command: NewPasswordCommand): Promise<Contract<null | boolean>> {

    const passwordRecoveryCodeSecret = this.configService.get(Secrets.PASSWORD_RECOVERY_CODE_SECRET, { infer: true })
    const verifiedEmailDto = await this.tokensService.verifyToken(command.recoveryCode, passwordRecoveryCodeSecret)
    if (verifiedEmailDto === null) return new Contract(null, ErrorEnums.TOKEN_NOT_VERIFY)

    const oldRecoveryCodeDto = await this.authRepository.findRecoveryCode(verifiedEmailDto.email)
    if (oldRecoveryCodeDto === null) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_FOUND)
    if (oldRecoveryCodeDto.checkRecoveryCode(command.recoveryCode) === false) return new Contract(null, ErrorEnums.RECOVERY_CODE_INVALID)

    const emailDto = ["accountData.email", verifiedEmailDto.email]
    const user = await this.usersRepository.findUser(emailDto)
    if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    await user.updatePasswordHash(command.newPassword)
    await this.usersRepository.saveDocument(user)

    return new Contract(true, null)
  }


}