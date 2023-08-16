import { ConfigService } from "@nestjs/config"
import { ConfigType } from "src/infrastructure/settings/configuration"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { PASSWORD_HASH_EXPIRES_TIME, Secrets } from "../../../../../infrastructure/utils/constants"
import { AuthSqlRepository } from "../../../../../repositories/auth/sql/auth.sql.repository"
import { TokensService } from "../../../../../infrastructure/services/tokens.service"
import { EmailAdapter } from "../../../../../infrastructure/adapters/email.adapter"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"


export class PasswordRecoverySqlCommand {
  constructor(public email: string) {
  }
}

@CommandHandler(PasswordRecoverySqlCommand)
export class PasswordRecoverySql implements ICommandHandler<PasswordRecoverySqlCommand> {
  constructor(
    protected tokensService: TokensService,
    protected emailAdapter: EmailAdapter,
    protected configService: ConfigService<ConfigType, true>,
    protected authSqlRepository: AuthSqlRepository,
  ) {
  }

  async execute(command: PasswordRecoverySqlCommand): Promise<Contract<null | boolean>> {

    // if (oldRecoveryCode === null) return new Contract(null, ErrorEnums.CONFIRMATION_CODE_EXPIRED)

    const passwordRecoveryCodeSecret = this.configService.get(Secrets.PASSWORD_RECOVERY_CODE_SECRET, { infer: true })
    // const passwordHashExpiresTime = this.configService.get(PASSWORD_HASH_EXPIRES_TIME, { infer: true })

    const recoveryCode = await this.authSqlRepository.findLastRecoveryCodeByEmail(command.email)
    if (recoveryCode !== null) await this.authSqlRepository.deactivatePasswordRecoveryCode(recoveryCode.id)

    const newPasswordRecoveryCode = await this.tokensService.createToken(
      { email: command.email },
      passwordRecoveryCodeSecret,
      PASSWORD_HASH_EXPIRES_TIME
    )

    const newRecoveryCode = await this.authSqlRepository.createPasswordRecoveryCode({
      email: command.email,
      recoveryCode: newPasswordRecoveryCode,
      active: true,
    })
    console.log("newRecoveryCode", newRecoveryCode)
    // SENDING PASSWORD RECOVERY ↓↓↓
    // const isSend = await this.emailAdapter.sendPasswordRecovery(newRecoveryCode.email, newRecoveryCode.recoveryCode)
    // if (!isSend) {
    //   const deletedResult = await this.authSqlRepository.deletePasswordRecoveryCode(newRecoveryCode.id)
    //   if (deletedResult.deletedCount === null) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_DELETE)
    //   return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
    // }



    return new Contract(true, null)
  }


}