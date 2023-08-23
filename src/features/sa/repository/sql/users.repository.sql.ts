import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import {
  Users,
  UsersDocument,
  UsersModel
} from "../../application/entities/mongoose/users.schema"
import { DataSource, QueryRunner } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"

@Injectable()
export class UsersRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async createUser({ login, email, passwordHash, createdAt }: any) {
    const newUserResult = await this.dataSource.query(`
    insert into users."AccountData"("Login", "Email", "PasswordHash", "CreatedAt")
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

  async createConfirmationCode(
    { userId, confirmationCode, expirationDate }: { userId: number, confirmationCode: string, expirationDate: string }
  ) {
    console.log("newConfirmationCode", confirmationCode)
    const createResult = await this.dataSource.query(`
    insert into users."EmailConfirmation"("UserId", "ConfirmationCode", "ExpirationDate")
    values($1, $2, $3)
    `, [userId, confirmationCode, expirationDate])
    return createResult[0]
  }

  // async updateConfirmationCode(
  //   { userId, confirmationCode, expirationDate }: { userId: number, confirmationCode: string, expirationDate: Date }
  // ) {
  //   console.log("newConfirmationCode", confirmationCode)
  //   const updateResult = await this.dataSource.query(`
  //   update users."EmailConfirmation"
  //   set "ConfirmationCode" = $2, "ExpirationDate" = $3
  //   where "UserId" = $1
  //   `, [userId, confirmationCode, expirationDate])
  //   return updateResult[0]
  // }

  async createSentConfirmCodeDate(userId: string, sentDate: string) {
    await this.dataSource.query(`
    insert into users."SentConfirmationCodeDates"("UserId","SentDate")
    values($1, $2)
    `, [userId, sentDate])
  }

  // async findUser({ key, value }) {
  //   const user = await this.dataSource.query(`
  //   select a."UserId" as "userId", "Login" as "login", "Email" as "email", "PasswordHash" as "passwordHash", "CreatedAt" as "createdAt",
  //      b."IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason",
  //      c."ConfirmationCode" as "confirmationCode", "ExpirationDate" as "expirationDate", "IsConfirmed" as "isConfirmed"
  //   from users."AccountData" a
  //   left join users."BanInfo" b on b."UserId" = a."UserId"
  //   left join users."EmailConfirmation" c on c."UserId" = a."UserId"
  //   where ${key} = $1
  //   `, [value])
  //   return user.length ? user[0] : null
  // }

  async findUserByUserId(userId: string) {
    const user = await this.dataSource.query(`
    select a."UserId" as "userId", "Login" as "login", "Email" as "email", "PasswordHash" as "passwordHash", "CreatedAt" as "createdAt",
       b."IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason",
       c."ConfirmationCode" as "confirmationCode", "ExpirationDate" as "expirationDate", "IsConfirmed" as "isConfirmed"
    from users."AccountData" a
    left join users."BanInfo" b on b."UserId" = a."UserId" 
    left join users."EmailConfirmation" c on c."UserId" = a."UserId"
    where a."UserId" = $1
    `, [userId])
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

  // async findUsersByBan(isBanned: boolean) {
  //   const bannedUsersResult = await this.dataSource.query(`
  //   select "UserId" as "userId", "IsBanned" as "isBanned", "BanReason" as "banReason", "BanDate" as "banDate"
  //   from users."BanInfo"
  //   where "IsBanned" = $1
  //   `, [isBanned])
  //   return bannedUsersResult.length ? bannedUsersResult[0] : null
  // }

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

  // async deleteUser(userId: string, queryRunner: QueryRunner) {
  //
  //   //   async deleteUser(userId: string, queryRunner?: QueryRunner) {const queryRunner = this.dataSource.createQueryRunner()
  //   //   await queryRunner.startTransaction();
  //   //   try{
  //   //   this.dataSource.query('', {}, queryRunner)
  //   //
  //   // await this.usersRepository.deleteById(userId, querryRunner)
  //   //   await  queryRunner.commitTransaction()
  //   //   }catch(e){await queryRunner.rollbackTransaction()
  //   //   }
  //
  //   const deleteResults = await this.dataSource.transaction(async manager => {
  //     const result1 = await manager.query(`delete from users."EmailConfirmation" where "UserId" = $1`, [userId])
  //     const result2 = await manager.query(`delete from users."BanInfo" where "UserId" = $1`, [userId])
  //     const result3 = await manager.query(`delete from users."AccountData" where "UserId" = $1`, [userId])
  //     return [result1[1], result2[1], result3[1]]
  //   })
  //   await this.dataSource.query(`
  //       delete
  //       from users."SentConfirmationCodeDates"
  //       where "UserId" = $1
  //       `, [userId])
  //
  //   return deleteResults.every(res => res === 1)
  // }

  async deleteEmailConfirmation(userId: string, queryRunner: QueryRunner) {
    const result = await queryRunner.query(`
    delete from users."EmailConfirmation" where "UserId" = $1
    `, [userId])
    return result[1]
  }

  async deleteBanInfo(userId: string, queryRunner: QueryRunner) {
    const result = await queryRunner.query(`
    delete from users."BanInfo" where "UserId" = $1
    `, [userId])
    return result[1]
  }

  async deleteSentConfirmationCodeDates(userId: string, queryRunner: QueryRunner) {
    const result = await queryRunner.query(`
    delete from users."SentConfirmationCodeDates" where "UserId" = $1
    `, [userId])
    return result[1]
  }

  async deleteDevices(userId: string, queryRunner: QueryRunner) {
    const result = await queryRunner.query(`
    delete from devices."Devices" where "UserId" = $1
    `, [userId])
    return result[1]
  }

  async deleteAccountData(userId: string, queryRunner: QueryRunner) {
    const result = await queryRunner.query(`
    delete from users."AccountData" where "UserId" = $1
    `, [userId])
    return result[1]
  }

  // async deleteUser(userId: string) {
  //   const deleteResults = await Promise.all([
  //       await this.dataSource.query(`
  //       delete
  //       from users."EmailConfirmation"
  //       where "UserId" = $1
  //       `, [userId]),
  //
  //       await this.dataSource.query(`
  //       delete
  //       from users."BanInfo"
  //       where "UserId" = $1
  //       `, [userId]),
  //
  //       await this.dataSource.query(`
  //       delete
  //       from users."AccountData"
  //       where "UserId" = $1
  //       `, [userId]),
  //     ]
  //   )
  //   await this.dataSource.query(`
  //       delete
  //       from users."SentConfirmationCodeDates"
  //       where "UserId" = $1
  //       `, [userId])
  //
  //   return deleteResults.every(res => res[1] === 1)
  // }

  async updateUserBan(userId, isBanned, banReason?, banDate?) {
    const updateResult = isBanned
      ? await this.dataSource.query(`
        update users."BanInfo" 
        set "IsBanned" = $2, "BanReason" = $3, "BanDate" = $4
        where "UserId" = $1
        `, [userId, isBanned, banReason, banDate])
      : await this.dataSource.query(`
        update users."BanInfo" 
        set "IsBanned" = $2, "BanReason" = null, "BanDate" = null
        where "UserId" = $1
        `, [userId, isBanned])
    return updateResult.length ? updateResult[1] : null
  }

  async updatePasswordHash(userId: string, newPasswordHash: string) {
    const updateResult = await this.dataSource.query(`
    update users."AccountData" 
    set "PasswordHash" = $2
    where "UserId" = $1
    `, [userId, newPasswordHash])
    return updateResult.length ? updateResult[1] : null
  }

  async updateConfirmation(props: { userId: string, isConfirm: boolean }) {
    await this.dataSource.query(`
    update users."EmailConfirmation" 
    set "IsConfirmed" = $2
    where "UserId" = $1
    `, [props.userId, props.isConfirm])
  }


}
