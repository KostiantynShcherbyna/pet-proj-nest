import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import {
  RecoveryCodes,
  RecoveryCodesDocument,
  RecoveryCodesModel
} from "../../../features/auth/application/entities/mongoose/recovery-code.schema"
import { DataSource } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"

@Injectable()
export class AuthSqlRepository {
  constructor(
    @InjectModel(RecoveryCodes.name) protected RecoveryCodesModel: RecoveryCodesModel,
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findRecoveryCode(email: string) {
    const recoveryCode = await this.dataSource.query(`
    select "Email"
    from users."RecoveryCodes"
    where "Email" = $1
    `, [email])

    return recoveryCode.length ? recoveryCode[0] : null
  }

  async createPasswordRecoveryCode({ email, recoveryCode, active }) {
    const newRecoveryCode = await this.dataSource.query(`
    insert into recoveryCodes."RecoveryCodes"("Email", "RecoveryCode", "Active")
    values($1, $2, $3)
    returning "Id", "Email", "RecoveryCode"
    `, [email, recoveryCode, active])
    return newRecoveryCode.length ? newRecoveryCode[0] : null
  }

  async deactivatePasswordRecoveryCode(id: number) {
    const deactivateResult = await this.dataSource.query(`
    update recoveryCodes."RecoveryCodes"
    set "Active" = false
    where "Active" = $1
    `, [id])
    return deactivateResult.length ? deactivateResult[0] : null
  }

  async deletePasswordRecoveryCode(id: number) {
    const deleteResult = await this.dataSource.query(`
    delete from users."RecoveryCodes"
    where "Id" = $1, 
    `, [id])
    return deleteResult.length ? deleteResult[0] : null
  }

}
