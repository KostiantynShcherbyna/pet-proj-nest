import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Model } from "mongoose"
import { JwtService } from "@nestjs/jwt"
import { TokensService } from "src/services/tokens.service"
import { configuration } from "src/configuration"
import { PASSWORD_HASH_EXPIRES_TIME } from "src/utils/constants/constants"


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

  @Prop({
    type: Boolean,
    required: true,
  })
  active: boolean

  static async createPasswordRecovery(
    email: string,
    passwordRecoveryCodeSecret: string,
    tokensService: TokensService,
    RecoveryCodesModel: RecoveryCodesModel,
  ): Promise<RecoveryCodesDocument> {


    const newPasswordRecoveryCode = await tokensService
      .createToken(
        { email },
        passwordRecoveryCodeSecret,
        PASSWORD_HASH_EXPIRES_TIME
      )
    const recoveryCodeDto = {
      email: email,
      recoveryCode: newPasswordRecoveryCode,
      active: true,
    }

    const newRecoveryCodeDocument = new RecoveryCodesModel(recoveryCodeDto)
    return newRecoveryCodeDocument
  }


  async deactivatePasswordRecovery() {
    this.active = false
    return
  }


  checkRecoveryCode(newRecoveryCode: string) {
    return this.recoveryCode === newRecoveryCode
  }
}
interface RecoveryCodesStatics {
  createPasswordRecovery(
    email: string,
    passwordRecoveryCodeSecret: string,
    tokensService: TokensService,
    RecoveryCodesModel: RecoveryCodesModel,
  ): Promise<RecoveryCodesDocument>
}

export const RecoveryCodesSchema = SchemaFactory.createForClass(RecoveryCodes)
RecoveryCodesSchema.statics.createPasswordRecovery = RecoveryCodes.createPasswordRecovery
RecoveryCodesSchema.methods.deactivatePasswordRecovery = RecoveryCodes.prototype.deactivatePasswordRecovery
RecoveryCodesSchema.methods.checkRecoveryCode = RecoveryCodes.prototype.checkRecoveryCode

export type RecoveryCodesDocument = HydratedDocument<RecoveryCodes>
export type RecoveryCodesModel = Model<RecoveryCodesDocument> & RecoveryCodesStatics