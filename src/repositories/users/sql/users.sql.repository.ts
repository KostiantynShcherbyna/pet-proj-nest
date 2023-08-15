import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import {
  Users,
  UsersDocument,
  UsersModel
} from "../../../features/super-admin/application/entities/mongoose/users.schema"
import { DataSource } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"

@Injectable()
export class UsersSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async createUser({ login, email, passwordHash }) {
    const newUserResult = await this.dataSource.query(`
    insert into users."AccountData"("Login", "Email", "PasswordHash", "CreatedAt")
    values($1, $2, $3, CURRENT_TIMESTAMP)
    returning "UserId" as "userId", "Login" as "login", "Email" as "email", "CreatedAt" as "createdAt"
    `, [login, email, passwordHash])
    return newUserResult[0]
  }

  async createEmailConfirmation(
    emailConfirmationDto: {
      userId: number,
      confirmationCode: string,
      expirationDate: Date,
      isConfirmed: boolean
    }
  ) {
    await this.dataSource.query(`
    insert into users."EmailConfirmation"("UserId", "ConfirmationCode", "ExpirationDate", "IsConfirmed")
    values($1, $2, $3, $4)
    `, [
        emailConfirmationDto.userId,
        emailConfirmationDto.confirmationCode,
        emailConfirmationDto.expirationDate,
        emailConfirmationDto.isConfirmed
      ]
    )
  }

  async createBanInfo(userId: number) {
    await this.dataSource.query(`
    insert into users."BanInfo"("UserId", "IsBanned", "BanReason", "BanDate")
    values($1, false, null, null)
    `, [userId])
  }

  async updateConfirmationCode(
    { userId, confirmationCode, expirationDate }: { userId: number, confirmationCode: string, expirationDate: Date }
  ) {
    console.log("newConfirmationCode", confirmationCode)
    const updateResult = await this.dataSource.query(`
    update users."EmailConfirmation"
    set "ConfirmationCode" = $2, "ExpirationDate" = $3
    where "UserId" = $1
    `, [userId, confirmationCode, expirationDate])
    return updateResult[0]
  }

  async createSentConfirmCodeDate(userId: string) {
    await this.dataSource.query(`
    insert into users."SentConfirmationCodeDates"("UserId","SentDate")
    values($1, CURRENT_TIMESTAMP)
    `, [userId])
  }

  async findUser({ key, value }) {
    const user = await this.dataSource.query(`
    select a."UserId" as "userId", "Login" as "login", "Email" as "email", "PasswordHash" as "passwordHash", "CreatedAt" as "createdAt",
       b."IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason",
       c."ConfirmationCode" as "confirmationCode", "ExpirationDate" as "expirationDate", "IsConfirmed" as "isConfirmed"
    from users."AccountData" a
    left join users."BanInfo" b on b."UserId" = a."UserId" 
    left join users."EmailConfirmation" c on c."UserId" = a."UserId"
    where ${key} = $1
    `, [value])
    return user.length ? user[0] : null
  }

  async findUserByConfirmCode(value) {
    const user = await this.dataSource.query(`
    select a."UserId" as "userId", "Login" as "login", "Email" as "email", "PasswordHash" as "passwordHash", "CreatedAt" as "createdAt",
       b."IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason",
       c."ConfirmationCode" as "confirmationCode", "ExpirationDate" as "expirationDate", "IsConfirmed" as "isConfirmed"
    from users."AccountData" a
    left join users."BanInfo" b on b."UserId" = a."UserId" 
    left join users."EmailConfirmation" c on c."UserId" = a."UserId"
    where "ConfirmationCode" = $1
    `, [value])
    return user.length ? user[0] : null
  }

  async findUserByEmail(value) {
    const user = await this.dataSource.query(`
    select a."UserId" as "userId", "Login" as "login", "Email" as "email", "PasswordHash" as "passwordHash", "CreatedAt" as "createdAt",
       b."IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason",
       c."ConfirmationCode" as "confirmationCode", "ExpirationDate" as "expirationDate", "IsConfirmed" as "isConfirmed"
    from users."AccountData" a
    left join users."BanInfo" b on b."UserId" = a."UserId" 
    left join users."EmailConfirmation" c on c."UserId" = a."UserId"
    where "Email" = $1
    `, [value])
    return user.length ? user[0] : null
  }

  async findBannedUsers() {
    const bannedUsers = await this.dataSource.query(`
    select "IsBanned"
    from users."BanInfo"
    where "IsBanned" = true
    `)
    return bannedUsers
  }

  async findUserByLoginOrEmail(userAuthData: { login: string, email: string }) {
    const foundUser = await this.dataSource.query(`
    select a."UserId" as "userId", "Login" as "login", "Email" as "email", "PasswordHash" as "passwordHash", "CreatedAt" as "createdAt",
       b."IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason",
       c."ConfirmationCode" as "confirmationCode", "ExpirationDate" as "expirationDate", "IsConfirmed" as "isConfirmed"
    from users."AccountData" a
    left join users."BanInfo" b on b."UserId" = a."UserId" 
    left join users."EmailConfirmation" c on c."UserId" = a."UserId"
    where "Login" = $1 or "Email" = $2
    `, [userAuthData.login, userAuthData.email])
    return foundUser.length ? foundUser[0] : null
  }

  async deleteUser(id: number) {
    // await this.dataSource.transaction(async manager => {
    //   await manager.query(`delete from users."EmailConfirmation" where "UserId" = $1`, [id])
    //   await manager.query(`delete from users."BanInfo" where "UserId" = $1`, [id])
    //   await manager.query(`delete from users."Users" where "UserId" = $1`, [id])
    // })
    await this.dataSource.query(`
    delete 
    from users."EmailConfirmation"
    where "UserId" = $1
    `, [id])
  }

  async updateUserBan(id: number, userBan: any) {
    await this.dataSource.query(`
    update users."AccountData" 
    set "IsBanned" = $2, "BanReason" = $3, "BanDate" = CURRENT_TIMESTAMP
    where "UserId" = $1
    `, [id, userBan.isBanned, userBan.banReason])
  }

  async updatePasswordHash(id: number, newPasswordHash: string) {
    await this.dataSource.query(`
    update users."AccountData" 
    set "PasswordHash" = $2
    where "Id" = $1
    `, [id, newPasswordHash])
  }

  async updateConfirmation(props: { userId: number, isConfirm: boolean }) {
    await this.dataSource.query(`
    update users."EmailConfirmation" 
    set "IsConfirmed" = $2
    where "UserId" = $1
    `, [props.userId, props.isConfirm])
  }


}
