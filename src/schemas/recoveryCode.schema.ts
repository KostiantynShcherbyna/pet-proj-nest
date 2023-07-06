import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export interface IRecoveryCode {
    email: string,
    recoveryCode: string
}


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

    static createRecoveryCode(email: string, RecoveryCodesModel: RecoveryCodesModel): RecoveryCodesDocument {

        // const passwordRecoveryCode = this.jwtServiceMngs.createToken({ email: email }, settings.PASSWORD_RECOVERY_CODE, "5m") // TODO

        const passwordRecoveryCode = "TODO"
        const recoveryCodeDto = {
            email: email,
            recoveryCode: passwordRecoveryCode
        }

        const newRecoveryCode = new RecoveryCodesModel(recoveryCodeDto)
        return newRecoveryCode
    }

    updateRecoveryCode() {
        // const newRecoveryCode = this.jwtServiceMngs.createToken({ email: email }, settings.PASSWORD_RECOVERY_CODE, "5m") // TODO
        const newRecoveryCode = "a"
        return this.recoveryCode = newRecoveryCode
    }


    checkRecoveryCode(newRecoveryCode: string) {
        return this.recoveryCode === newRecoveryCode
    }
}
export const RecoveryCodesSchema = SchemaFactory.createForClass(RecoveryCodes)

interface RecoveryCodesStatics {
    createRecoveryCode(email: string, RecoveryCodesModel: RecoveryCodesModel): RecoveryCodesDocument
}
RecoveryCodesSchema.statics.createRecoveryCode = RecoveryCodes.createRecoveryCode
RecoveryCodesSchema.methods.updateRecoveryCode = RecoveryCodes.prototype.updateRecoveryCode
RecoveryCodesSchema.methods.checkRecoveryCode = RecoveryCodes.prototype.checkRecoveryCode

export type RecoveryCodesDocument = HydratedDocument<RecoveryCodes>
export type RecoveryCodesModel = Model<RecoveryCodesDocument> & RecoveryCodesStatics