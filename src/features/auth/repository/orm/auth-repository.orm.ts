import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { RecoveryCodes, RecoveryCodesModel } from "../../application/entities/mongoose/recovery-code.schema"
import { DataSource } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"
import { RecoveryCodeEntity } from "../../application/entities/sql/recovery-code.entity"

@Injectable()
export class AuthRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findLastRecoveryCodeByEmail(email: string) {
    const builderResult = this.dataSource.createQueryBuilder(RecoveryCodeEntity, "r")
      .select([
        `r.RecoveryCodeId as recoveryCodeId`,
        `r.Email as email`,
        `r.RecoveryCode as recoveryCode`,
        `r.Active as active`
      ])
      .where("r.Email = :email", { email })
    const result = await builderResult.getRawMany()
    return result.length ? result[result.length - 1] : null
    // return recoveryCodes.length ? recoveryCodes[recoveryCodes.length - 1] : null
  }

  async createPasswordRecoveryCode({ email, recoveryCode, active }) {
    const result = await this.dataSource.createQueryBuilder(RecoveryCodeEntity, "r")
      .insert()
      .values({
        Email: email,
        RecoveryCode: recoveryCode,
        Active: active
      })
      .execute()
    return result.identifiers[0].RecoveryCodeId
  }

  async deactivatePasswordRecoveryCode(recoveryCodeId: number) {
    const result = await this.dataSource.createQueryBuilder(RecoveryCodeEntity, "r")
      .update()
      .set({
        Active: false
      })
      .where(`r.RecoveryCodeId = :recoveryCodeId`, { recoveryCodeId })
      .execute()
    return result.raw.length ? result.raw[0] : null
  }


}
