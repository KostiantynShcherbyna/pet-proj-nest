import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { RecoveryCodes, RecoveryCodesModel } from "../../application/entities/mongoose/recovery-code.schema"
import { DataSource } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"

@Injectable()
export class AuthRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findLastRecoveryCodeByEmail(email: string) {
    const recoveryCodes = await this.dataSource.query(`
    select "RecoveryCodeId" as "recoveryCodeId",
     "Email" as "email",
     "RecoveryCode" as "recoveryCode",
     "Active" as "active"
    from public."recovery_code_entity"
    where "Email" = $1
    `, [email])
    return recoveryCodes.length ? recoveryCodes[recoveryCodes.length - 1] : null
  }

  async createPasswordRecoveryCode({ email, recoveryCode, active }) {
    const newRecoveryCode = await this.dataSource.query(`
    insert into public."recovery_code_entity"("Email", "RecoveryCode", "Active")
    values($1, $2, $3)
    returning "RecoveryCodeId", "Email", "RecoveryCode"
    `, [email, recoveryCode, active])
    return newRecoveryCode.length ? newRecoveryCode[0] : null
  }

  async deactivatePasswordRecoveryCode(recoveryCodeId: number) {
    const deactivateResult = await this.dataSource.query(`
    update public."recovery_code_entity"
    set "Active" = false
    where "RecoveryCodeId" = $1
    `, [recoveryCodeId])
    return deactivateResult.length ? deactivateResult[0] : null
  }

}
