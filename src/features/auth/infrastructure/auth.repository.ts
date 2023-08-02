import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"

import {
    RecoveryCodes,
    RecoveryCodesDocument,
    RecoveryCodesModel
} from "src/features/auth/application/entitys/recovery-code.schema"

@Injectable()
export class AuthRepository {
    constructor(
        @InjectModel(RecoveryCodes.name) protected RecoveryCodesModel: RecoveryCodesModel,
    ) { }

    async findRecoveryCode(email: string): Promise<null | RecoveryCodesDocument> {

        const recoveryCode = await this.RecoveryCodesModel.findOne({ $and: [{ email: email }, { active: true }] })
        if (recoveryCode === null) return null

        return recoveryCode
    }

    async saveDocument(document: any) {

        await document.save()
    }

}
