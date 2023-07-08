import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';


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

    static async createRecoveryCode(email: string, RecoveryCodesModel: RecoveryCodesModel, jwtService: JwtService): Promise<RecoveryCodesDocument> {

        // const passwordRecoveryCode = this.jwtServiceMngs.createToken({ email: email }, settings.PASSWORD_RECOVERY_CODE, "5m") // TODO
        const passwordRecoveryCode = await jwtService.signAsync({ email: email })
        const recoveryCodeDto = {
            email: email,
            recoveryCode: passwordRecoveryCode
        }

        const newRecoveryCodeDocument = new RecoveryCodesModel(recoveryCodeDto)
        return newRecoveryCodeDocument
    }

    async updateRecoveryCode(email: string, jwtService: JwtService): Promise<any> {
        // const newRecoveryCode = this.jwtServiceMngs.createToken({ email: email }, settings.PASSWORD_RECOVERY_CODE, "5m") // TODO
        const newRecoveryCode = await jwtService.signAsync({ email: email })
        this.recoveryCode = newRecoveryCode

        return this
    }


    checkRecoveryCode(newRecoveryCode: string) {
        return this.recoveryCode === newRecoveryCode
    }
}
export const RecoveryCodesSchema = SchemaFactory.createForClass(RecoveryCodes)

interface RecoveryCodesStatics {
    createRecoveryCode(email: string, RecoveryCodesModel: RecoveryCodesModel, jwtService: JwtService): Promise<RecoveryCodesDocument>
}
RecoveryCodesSchema.statics.createRecoveryCode = RecoveryCodes.createRecoveryCode
RecoveryCodesSchema.methods.updateRecoveryCode = RecoveryCodes.prototype.updateRecoveryCode
RecoveryCodesSchema.methods.checkRecoveryCode = RecoveryCodes.prototype.checkRecoveryCode

export type RecoveryCodesDocument = HydratedDocument<RecoveryCodes>
export type RecoveryCodesModel = Model<RecoveryCodesDocument> & RecoveryCodesStatics