import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Model } from "mongoose"
import { JwtService } from "@nestjs/jwt"
import { TokensService } from "src/services/tokens.service"
import { settings } from "src/settings"
import { ACCESS_EXPIRES_TIME, PASSWORD_HASH_EXPIRES_TIME } from "src/utils/constants/constants"


// export interface IRecoveryCode {
//   email: string,
//   recoveryCode: string
// }


@Schema()
export class RecoveryCodes {
  @Prop({
    type: String,
    required: true,
  })
  email: string

  @Prop({
    type: String,
    required: true,
  })
  recoveryCode: string

  static async passwordRecovery(
    email: string,
    RecoveryCodesModel: RecoveryCodesModel,
    tokensService: TokensService
  ): Promise<RecoveryCodesDocument> {

    const passwordRecoveryCode = await tokensService
      .createToken(
        { email },
        settings.PASSWORD_RECOVERY_CODE,
        PASSWORD_HASH_EXPIRES_TIME
      )
    const recoveryCodeDto = {
      email: email,
      recoveryCode: passwordRecoveryCode
    }

    const newRecoveryCodeDocument = new RecoveryCodesModel(recoveryCodeDto)
    return newRecoveryCodeDocument
  }


  async updateRecoveryCode(
    email: string,
    tokensService: TokensService
  ): Promise<RecoveryCodes> {

    const newRecoveryCode = await tokensService
      .createToken(
        { email },
        settings.PASSWORD_RECOVERY_CODE,
        PASSWORD_HASH_EXPIRES_TIME
      )
    this.recoveryCode = newRecoveryCode

    return this
  }


  checkRecoveryCode(newRecoveryCode: string) {
    return this.recoveryCode === newRecoveryCode
  }
}

export const RecoveryCodesSchema = SchemaFactory.createForClass(RecoveryCodes)

interface RecoveryCodesStatics {
  passwordRecovery(
    email: string,
    RecoveryCodesModel: RecoveryCodesModel,
    tokensService: TokensService
  ): Promise<RecoveryCodesDocument>
}

RecoveryCodesSchema.statics.passwordRecovery = RecoveryCodes.passwordRecovery

RecoveryCodesSchema.methods.updateRecoveryCode = RecoveryCodes.prototype.updateRecoveryCode
RecoveryCodesSchema.methods.checkRecoveryCode = RecoveryCodes.prototype.checkRecoveryCode

export type RecoveryCodesDocument = HydratedDocument<RecoveryCodes>
export type RecoveryCodesModel = Model<RecoveryCodesDocument> & RecoveryCodesStatics