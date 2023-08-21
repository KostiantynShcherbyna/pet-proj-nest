import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"
import { QueryUserSAInputModel } from "../../api/models/input/get-users.query.input-model"
import {
  BanStatus,
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
  SEARCH_EMAIL_TERM_DEFAULT,
  SEARCH_LOGIN_TERM_DEFAULT,
  SORT_BY_DEFAULT_SQL,
  SortDirection,
} from "../../../../infrastructure/utils/constants"
import { dtoManager } from "../../../../infrastructure/adapters/output-model.adapter"

@Injectable()
export class UsersQueryRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findMe(value) {
    const user = await this.dataSource.query(`
    select a."UserId" as "userId", "Login" as "login", "Email" as "email"
    from users."AccountData" a
    where a."UserId" = $1
    `, [value])
    return user.length ? user[0] : null
  }

  async findUsersByEmail(value) {
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


  async findUsers(query: QueryUserSAInputModel) {
    let isBanned: boolean | null = null
    if (query.banStatus === BanStatus.Banned) isBanned = true
    if (query.banStatus === BanStatus.NotBanned) isBanned = false
    const searchLoginTerm = query.searchLoginTerm || SEARCH_LOGIN_TERM_DEFAULT
    const searchEmailTerm = query.searchEmailTerm || SEARCH_EMAIL_TERM_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const sortDirection = query.sortDirection || SortDirection.Desc
    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const offset = (pageNumber - 1) * pageSize

    const usersTotalCount = await this.dataSource.query(`
    select count(*)
    from users."AccountData" a
    left join users."BanInfo" b on b."UserId" = a."UserId"
    where (a."Login" ilike $2 or a."Email" ilike $3)
    and (b."IsBanned" = $1 OR $1 IS NULL)
    `, [isBanned, `%${searchLoginTerm}%`, `%${searchEmailTerm}%`,])

    const pagesCount = Math.ceil(usersTotalCount[0].count / pageSize)

    const queryForm = `
    select a."UserId" as "id", "Login" as "login", "Email" as "email", "CreatedAt" as "createdAt",
           b."IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason"
    from users."AccountData" a
    left join users."BanInfo" b on b."UserId" = a."UserId"
    where (a."Login" ilike $2 or a."Email" ilike $3)
    and (b."IsBanned" = $1 or $1 IS NULL)
    order by "${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $4
    offset $5
    `

    const users = await this.dataSource.query(
      queryForm, [
        isBanned, // 1
        `%${searchLoginTerm}%`, // 2
        `%${searchEmailTerm}%`, // 3
        pageSize, // 4
        offset, // 5
      ])
    const mappedUsers = dtoManager.changeUsersSqlView(users)

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(usersTotalCount[0].count),
      items: mappedUsers
    }
  }

  async findUsersByUserId(userId: number) {
    const userResult = await this.dataSource.query(`
    select a."UserId" as "userId", "Login" as "login", "Email" as "email", "CreatedAt" as "createdAt",
           b."IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason",
           c."ConfirmationCode" as "confirmationCode", "ExpirationDate" as "expirationDate", "IsConfirmed" as "isConfirmed"
    from users."AccountData" a
    left join users."BanInfo" b on b."UserId" = a."UserId" 
    left join users."EmailConfirmation" c on c."UserId" = a."UserId"
    where a."UserId" = $1
    `, [userId])
    if (!userResult.length) return null
    return this.createUserView(userResult[0])
  }

  private createUserView(user: any) {
    return {
      id: user.userId.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        banDate: user.banDate,
        banReason: user.banReason,
        isBanned: user.isBanned,
      }
    }
  }

}
