import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { ConfigType } from "src/configuration"
import { Contract } from "src/contract"
import { AuthRepository } from "src/repositories/auth.repository"
import { RecoveryCodes, RecoveryCodesModel } from "src/schemas/recovery-code.schema"
import { TokensService } from "src/services/tokens.service"
import { Secrets } from "src/utils/constants/constants"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { emailAdapter } from "src/utils/managers/email.adapter"


export class PasswordRecoveryCommand {
    constructor(public email: string) { }
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecovery implements ICommandHandler<PasswordRecoveryCommand> {
    constructor(
        @InjectModel(RecoveryCodes.name) protected RecoveryCodesModel: RecoveryCodesModel,
        protected tokensService: TokensService,
        protected authRepository: AuthRepository,
        protected configService: ConfigService<ConfigType, true>,
    ) {
    }

    async execute(comamnd: PasswordRecoveryCommand): Promise<Contract<null | boolean>> {

        const oldRecoveryCode = await this.authRepository.findRecoveryCode(comamnd.email)
        if (oldRecoveryCode === null) return new Contract(null, ErrorEnums.CONFIRMATION_CODE_EXPIRED)

        const passwordRecoveryCodeSecret = this.configService.get(Secrets.PASSWORD_RECOVERY_CODE_SECRET, { infer: true })
        const newRecoveryCodeDocument = await this.RecoveryCodesModel.createPasswordRecovery(comamnd.email, passwordRecoveryCodeSecret, this.tokensService, this.RecoveryCodesModel,)
        await this.authRepository.saveDocument(newRecoveryCodeDocument)


        oldRecoveryCode.deactivatePasswordRecovery()

        // SENDING PASSWORD RECOVERY ↓↓↓
        const isSend = await emailAdapter.sendPasswordRecovery(newRecoveryCodeDocument.email, newRecoveryCodeDocument.recoveryCode)
        if (isSend === false) {
            const deletedResult = await this.RecoveryCodesModel.deleteOne({ email: comamnd.email })
            if (deletedResult.deletedCount === 0) return new Contract(null, ErrorEnums.RECOVERY_CODE_NOT_DELETE)
            return new Contract(null, ErrorEnums.EMAIL_NOT_SENT)
        }

        return new Contract(true, null)
    }


}