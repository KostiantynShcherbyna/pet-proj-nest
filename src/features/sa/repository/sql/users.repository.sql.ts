import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import {
  Users,
  UsersDocument,
  UsersModel
} from "../../application/entities/mongoose/users.schema"
import { DataSource, QueryRunner } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"

interface ICreateConfirmationCodeDto {
  userId: number,
  confirmationCode: string,
  expirationDate: string,
  isConfirmed: boolean
}

@Injectable()
export class UsersRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async createUser({ login, email, passwordHash, createdAt }: any, queryRunner: QueryRunner) {
    const newUserResult = await queryRunner.query(`
    insert into public."account_entity"("Login", "Email", "PasswordHash", "CreatedAt")
    values($1, $2, $3, $4)
    returning "UserId" as "userId", "Login" as "login", "Email" as "email", "CreatedAt" as "createdAt"
    `, [login, email, passwordHash, createdAt])
    return newUserResult[0]
  }

  async createEmailConfirmation(
    emailConfirmationDto: {
      userId: number,
      confirmationCode: string | null,
      expirationDate: string | null,
      isConfirmed: boolean
    },
    queryRunner: QueryRunner
  ) {
    await queryRunner.query(`
    insert into public."email_confirmation_entity"("UserId", "ConfirmationCode", "ExpirationDate", "IsConfirmed")
    values($1, $2, $3, $4)
    `, [
        emailConfirmationDto.userId,
        emailConfirmationDto.confirmationCode,
        emailConfirmationDto.expirationDate,
        emailConfirmationDto.isConfirmed
      ]
    )
  }

  async createBanInfo(userId: number, queryRunner: QueryRunner) {
    await queryRunner.query(`
    insert into public."ban_info_entity"("UserId", "IsBanned", "BanReason", "BanDate")
    values($1, false, null, null)
    `, [userId])
  }

  async createConfirmationCode(
    { userId, confirmationCode, expirationDate, isConfirmed }: ICreateConfirmationCodeDto
  ) {
    console.log("newConfirmationCode", confirmationCode)
    const createResult = await this.dataSource.query(`
    insert into public."email_confirmation_entity"("UserId", "ConfirmationCode", "ExpirationDate", "IsConfirmed")
    values($1, $2, $3, $4)
    `, [userId, confirmationCode, expirationDate, isConfirmed])
    return createResult[0]
  }

  // async createConfirmationCode(
  //   { userId, confirmationCode, expirationDate, isConfirmed }: ICreateConfirmationCodeDto
  // ) {
  //   console.log("newConfirmationCode", confirmationCode)
  //   const createResult = await this.dataSource.query(`
  //   insert into public."email_confirmation_entity"("UserId", "ConfirmationCode", "ExpirationDate", "IsConfirmed")
  //   values($1, $2, $3, $4)
  //   `, [userId, confirmationCode, expirationDate, isConfirmed])
  //   return createResult[0]
  // }

  async createSentConfirmCodeDate(userId: string, sentDate: string) {
    await this.dataSource.query(`
    insert into public."sent_confirmation_code_date_entity"("UserId","SentDate")
    values($1, $2)
    `, [userId, sentDate])
  }

  async findUserByUserId(userId: string) {
    const user = await this.dataSource.query(`
    select a."UserId" as "userId", "Login" as "login", "Email" as "email", "PasswordHash" as "passwordHash", "CreatedAt" as "createdAt",
       b."IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason",
       c."ConfirmationCode" as "confirmationCode", "ExpirationDate" as "expirationDate", "IsConfirmed" as "isConfirmed"
    from public."account_entity" a
    left join public."ban_info_entity" b on b."UserId" = a."UserId" 
    left join public."email_confirmation_entity" c on c."UserId" = a."UserId"
    where a."UserId" = $1
    `, [userId])
    return user.length ? user[0] : null
  }

  async findUserByConfirmCode(value) {
    const user = await this.dataSource.query(`
    select a."UserId" as "userId", "Login" as "login", "Email" as "email", "PasswordHash" as "passwordHash", "CreatedAt" as "createdAt",
       b."IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason",
       c."ConfirmationCode" as "confirmationCode", "ExpirationDate" as "expirationDate", "IsConfirmed" as "isConfirmed"
    from public."account_entity" a
    left join public."ban_info_entity" b on b."UserId" = a."UserId" 
    left join public."email_confirmation_entity" c on c."UserId" = a."UserId"
    where "ConfirmationCode" = $1
    `, [value])
    return user.length ? user[0] : null
  }

  async findUserByEmail(value) {
    const user = await this.dataSource.query(`
    select a."UserId" as "userId", "Login" as "login", "Email" as "email", "PasswordHash" as "passwordHash", "CreatedAt" as "createdAt",
       b."IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason",
       c."ConfirmationCode" as "confirmationCode", "ExpirationDate" as "expirationDate", "IsConfirmed" as "isConfirmed"
    from public."account_entity" a
    left join public."ban_info_entity" b on b."UserId" = a."UserId" 
    left join public."email_confirmation_entity" c on c."UserId" = a."UserId"
    where "Email" = $1
    `, [value])
    return user.length ? user[0] : null
  }

  async findUserByLoginOrEmail(userAuthData: { login: string, email: string }) {
    const foundUser = await this.dataSource.query(`
    select a."UserId" as "userId", "Login" as "login", "Email" as "email", "PasswordHash" as "passwordHash", "CreatedAt" as "createdAt",
       b."IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason",
       c."ConfirmationCode" as "confirmationCode", "ExpirationDate" as "expirationDate", "IsConfirmed" as "isConfirmed"
    from public."account_entity" a
    left join public."ban_info_entity" b on b."UserId" = a."UserId" 
    left join public."email_confirmation_entity" c on c."UserId" = a."UserId"
    where "Login" = $1 or "Email" = $2
    `, [userAuthData.login, userAuthData.email])
    return foundUser.length ? foundUser[0] : null
  }

  async deleteEmailConfirmation(userId: string, queryRunner: QueryRunner) {
    const result = await queryRunner.query(`
    delete from public."email_confirmation_entity" where "UserId" = $1
    `, [userId])
    return result[1]
  }

  async deleteBanInfo(userId: string, queryRunner: QueryRunner) {
    const result = await queryRunner.query(`
    delete from public."ban_info_entity" where "UserId" = $1
    `, [userId])
    return result[1]
  }

  async deleteSentConfirmationCodeDates(userId: string, queryRunner: QueryRunner) {
    const result = await queryRunner.query(`
    delete from public."sent_confirmation_code_date_entity" where "UserId" = $1
    `, [userId])
    return result[1]
  }

  async deleteDevices(userId: string, queryRunner: QueryRunner) {
    const result = await queryRunner.query(`
    delete from public."device_entity" where "UserId" = $1
    `, [userId])
    return result[1]
  }

  async deleteAccountData(userId: string, queryRunner: QueryRunner) {
    const result = await queryRunner.query(`
    delete from public."account_entity" where "UserId" = $1
    `, [userId])
    return result[1]
  }

  async updateUserBan(userId, isBanned, banReason?, banDate?) {
    const updateResult = isBanned
      ? await this.dataSource.query(`
        update public."ban_info_entity" 
        set "IsBanned" = $2, "BanReason" = $3, "BanDate" = $4
        where "UserId" = $1
        `, [userId, isBanned, banReason, banDate])
      : await this.dataSource.query(`
        update public."ban_info_entity" 
        set "IsBanned" = $2, "BanReason" = null, "BanDate" = null
        where "UserId" = $1
        `, [userId, isBanned])
    return updateResult.length ? updateResult[1] : null
  }

  async updatePasswordHash(userId: string, newPasswordHash: string) {
    const updateResult = await this.dataSource.query(`
    update public."account_entity" 
    set "PasswordHash" = $2
    where "UserId" = $1
    `, [userId, newPasswordHash])
    return updateResult.length ? updateResult[1] : null
  }

  async updateConfirmation(props: { userId: string, isConfirm: boolean }) {
    await this.dataSource.query(`
    update public."email_confirmation_entity" 
    set "IsConfirmed" = $2
    where "UserId" = $1
    `, [props.userId, props.isConfirm])
  }


}
