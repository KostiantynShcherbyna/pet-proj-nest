import { ConfigService, ConfigType } from "@nestjs/config"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { RecoveryCodes, RecoveryCodesModel } from "../../entities/mongoose/recovery-code.schema"
import { InjectModel } from "@nestjs/mongoose"
import { TokensService } from "../../../../../infrastructure/services/tokens.service"
import { AuthRepository } from "../../../../../repositories/auth/mongoose/auth.repository"
import { EmailAdapter } from "../../../../../infrastructure/adapters/email.adapter"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { Secrets } from "../../../../../infrastructure/utils/constants"


export class PasswordRecoveryCommand {
  constructor(public email: string) {
  }
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecovery implements ICommandHandler<PasswordRecoveryCommand> {
  constructor(
    @InjectModel(RecoveryCodes.name) protected RecoveryCodesModel: RecoveryCodesModel,
    protected tokensService: TokensService,
    protected authRepository: AuthRepository,
    protected emailAdapter: EmailAdapter,
    protected configService: ConfigService<ConfigType<any>, true>,
  ) {
  }

  async execute(command: PasswordRecoveryCommand): Promise<Contract<null | boolean>> {

    // if (oldRecoveryCode === null) return new Contract(null, ErrorEnums.CONFIRMATION_CODE_EXPIRED)

    const passwordRecoveryCodeSecret = this.configService.get(Secrets.PASSWORD_RECOVERY_CODE_SECRET, { infer: true })
    const newRecoveryCodeDocument = await this.RecoveryCodesModel.createPasswordRecovery(
      command.email, passwordRecoveryCodeSecret, this.tokensService, this.RecoveryCodesModel,
    )
    await this.authRepository.saveDocument(newRecoveryCodeDocument)

    const oldRecoveryCode = await this.authRepository.findRecoveryCode(command.email)
    if (oldRecoveryCode !== null) oldRecoveryCode.deactivatePasswordRecovery()

    // SENDING PASSWORD RECOVERY ↓↓↓
    const isSend = await this.emailAdapter.sendPasswordRecovery(newRecoveryCodeDocument.email, newRecoveryCodeDocument.recoveryCode)
    if (isSend === false) {
      const deletedResult = await this.RecoveryCodesModel.deleteOne({ email: command.email })
      if (deletedResult.deletedCount === 0) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_DELETE)
      return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
    }

    return new Contract(true, null)
  }


}