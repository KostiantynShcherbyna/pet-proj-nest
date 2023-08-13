import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { UsersView } from "src/features/super-admin/api/models/output/create-user.output-model"
import { MeOutputModel } from "src/features/auth/api/models/output/me-output.model"
import { QueryUserSAInputModel } from "src/features/super-admin/api/models/input/get-users.query.input-model"
import { dtoManager } from "../../../infrastructure/adapters/output-model.adapter"
import { Users, UsersModel } from "../../entities/mongoose/users.schema"
import {
  BanStatus, PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT,
  SEARCH_EMAIL_TERM_DEFAULT,
  SEARCH_LOGIN_TERM_DEFAULT, SORT_BY_DEFAULT, SortDirection
} from "../../../infrastructure/utils/constants"

// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(Users.name) protected UsersModel: UsersModel,
  ) {
  }

  async findUser(userId: string): Promise<null | MeOutputModel> {

    const user = await this.UsersModel.findById(userId)
    if (user === null) return null

    const userView = dtoManager.changeUserView(user)
    return userView
  }


  async findUsers(query: QueryUserSAInputModel): Promise<UsersView> {

    let banStatus: any
    if (query.banStatus === BanStatus.All) banStatus = { $in: [true, false] }
    if (query.banStatus === BanStatus.Banned) banStatus = true
    if (query.banStatus === BanStatus.NotBanned) banStatus = false
    const searchLoginTerm = query.searchLoginTerm || SEARCH_LOGIN_TERM_DEFAULT
    const searchEmailTerm = query.searchEmailTerm || SEARCH_EMAIL_TERM_DEFAULT
    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy || SORT_BY_DEFAULT
    const sortDirection = query.sortDirection === SortDirection.Asc
      ? 1
      : -1

    const skippedUsersCount = (pageNumber - 1) * pageSize

    const totalCount = await this.UsersModel.countDocuments(
      {
        $and: [
          { "accountData.banInfo.isBanned": banStatus },
          {
            $or: [
              { "accountData.login": { $regex: searchLoginTerm, $options: "ix" } },
              { "accountData.email": { $regex: searchEmailTerm, $options: "ix" } },
            ]
          }
        ]
      }
    )

    const pagesCount = Math.ceil(totalCount / pageSize)

    const requestedUsers = await this.UsersModel.find(
      {
        $and: [
          { "accountData.banInfo.isBanned": banStatus },
          {
            $or: [
              { "accountData.login": { $regex: searchLoginTerm, $options: "ix" } },
              { "accountData.email": { $regex: searchEmailTerm, $options: "ix" } },
            ]
          }
        ]
      }
    )
      .sort({ ["accountData." + sortBy]: sortDirection })
      .limit(pageSize)
      .skip(skippedUsersCount)
      .lean()

    const mappedUsers = dtoManager.changeUsersView(requestedUsers)

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: mappedUsers
    }
  }


}