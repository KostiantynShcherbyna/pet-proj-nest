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
  SortDirection, SortDirectionOrm,
} from "../../../../infrastructure/utils/constants"
import { dtoManager } from "../../../../infrastructure/adapters/output-model.adapter"
import { AccountEntity } from "../../application/entities/sql/account.entity"
import { EmailConfirmationEntity } from "../../application/entities/sql/email-confirmation.entity"

@Injectable()
export class UsersQueryRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findMe(userId) {
    const user = await this.dataSource.createQueryBuilder(AccountEntity, "a")
      .select([
        `a.UserId as "userId"`,
        `a.Login as "login"`,
        `a.Email as "email"`
      ])
      .where(`a.UserId = :userId`, { userId })
      .getRawOne()
    return user ? user : null
  }


  async findUsers(query: QueryUserSAInputModel) {
    const searchLoginTerm = query.searchLoginTerm || SEARCH_LOGIN_TERM_DEFAULT
    const searchEmailTerm = query.searchEmailTerm || SEARCH_EMAIL_TERM_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const sortDirection = query.sortDirection === SortDirection.Asc ? SortDirectionOrm.Asc : SortDirectionOrm.Desc
    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const offset = (pageNumber - 1) * pageSize

    const [users, totalCount] = await this.dataSource.createQueryBuilder(AccountEntity, "a")
      .where(`a.Login ilike :login`, { login: `%${searchLoginTerm}%` })
      .orWhere(`a.Email ilike :email`, { email: `%${searchEmailTerm}%` })
      .orderBy(`a."${sortBy}"`, sortDirection)
      .limit(pageSize)
      .offset(offset)
      .getManyAndCount()

    const mappedUsers = this.createUsersView(users)

    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount),
      items: mappedUsers
    }
  }

  async findUserByUserId(userId: number) {
    const user = await this.dataSource.createQueryBuilder(AccountEntity, "a")
      .select([
        `a.UserId as "id"`,
        `a.Login as "login"`,
        `a.Email as "email"`,
        `a.CreatedAt as "createdAt"`
      ])
      .where(`a.UserId = :userId`, { userId })
      .getRawOne()
    return user ? user : null
  }

  private createUsersView(users: AccountEntity[]) {
    return users.map(user => {
      return {
        id: user.UserId,
        login: user.Login,
        email: user.Email,
        createdAt: user.CreatedAt
      }
    })
  }


}
