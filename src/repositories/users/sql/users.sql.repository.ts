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
    @InjectModel(Users.name) protected UsersModel: UsersModel,
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async createUser({ login, email, passwordHash }) {
    const newUserResult = await this.dataSource.query(`
    insert into users."AccountData"("Login", "Email", "PasswordHash", "PasswordRecoveryCode")
    values($1, $2, null, $3)
    returning "UserId", "Login", "Email", "CreatedAt"
    `, [login, email, passwordHash])
    return newUserResult
  }

  async createEmailConfirmation(userId: number) {
    await this.dataSource.query(`
    insert into users."EmailConfirmation"("UserId", "ConfirmationCode", "ExpirationDate", "IsConfirmed")
    values(${userId}, null, null, true)
    `)
  }

  async updateConfirmationCode(
    { id, newConfirmationCode }: { id: number, newConfirmationCode: string }
  ) {
    const updateResult = await this.dataSource.query(`
    update users."EmailConfirmation"
    set "ConfirmationCode" = S2
    where "UserId" = $1
    `, [id, newConfirmationCode])
    return updateResult[0]
  }

  async createBanInfo(userId: number) {
    await this.dataSource.query(`
    insert into users."BanInfo"("UserId", "IsBanned", "BanReason", "BanDate")
    values(${userId}, false, null, null)
    `)
  }

  async createSentEmailDate(userId: string) {
    await this.dataSource.query(`
    insert into users."SentConfirmationCodeDates"("UserId","SentDate")
    values(${userId}, CURRENT_TIMESTAMP)
    `)
  }

  async findUser({ key, value }) {
    const user = await this.dataSource.query(`
    select a."UserId", "Login", "Email", "PasswordHash", "CreatedAt",
           b."IsBanned", "BanDate", "BanReason"
           c."ConfirmationCode", "ExpirationDate", "IsConfirmed",
    from users."AccountData" a
    left join users."BanInfo" b on b."UserId" = a."UserId"
    left join users."EmailConfirmation" c on c."UserId" = a."UserId"
    where $1 = $2
    `, [key, value])

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

  async findUserLoginOrEmail(userAuthData: { login: string, email: string }) {
    const foundUser = await this.dataSource.query(`
    select a."UserId", "Login", "Email", "PasswordHash", "CreatedAt",
           b."IsBanned", "BanDate", "BanReason"
           c."ConfirmationCode", "ExpirationDate", "IsConfirmed",
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
