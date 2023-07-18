import { Injectable, Inject } from "@nestjs/common"
import { BlogsRepository } from "../blogs.repository"
import { InjectModel } from "@nestjs/mongoose"
import { dtoManager } from "src/utils/managers/dto.manager"
import { Users, UsersModel } from "src/schemas/users.schema"
import { QueryUserModel } from "src/models/query/query-user.model"
import { UsersView } from "src/views/UserView"
import { Types } from "mongoose"
import { MeView } from "src/views/MeView"
import { PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, SEARCH_EMAIL_TERM_DEFAULT, SEARCH_LOGIN_TERM_DEFAULT, SORT_BY_DEFAULT, SORT_DIRECTION_DEFAULT, SortDirection } from "src/utils/constants/constants"
// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class UsersQueryRepository {
    constructor(
        @InjectModel(Users.name) protected UsersModel: UsersModel,
    ) { }

    async findUser(userId: string): Promise<null | MeView> {

        const user = await this.UsersModel.findById(userId)
        if (user === null) return null

        const userView = dtoManager.changeUserView(user)
        return userView
    }


    async findUsers(query: QueryUserModel): Promise<UsersView> {

        const searchLoginTerm = query.searchLoginTerm || SEARCH_LOGIN_TERM_DEFAULT
        const searchEmailTerm = query.searchEmailTerm || SEARCH_EMAIL_TERM_DEFAULT
        const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
        const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
        const sortBy = query.sortBy || SORT_BY_DEFAULT
        const sortDirection = query.sortDirection === SortDirection.Asc
            ? 1
            : -1

        const skippedUsersCount = (pageNumber - 1) * pageSize

        const totalCount = await this.UsersModel
            .countDocuments(
                {
                    $or: [
                        { "accountData.login": { $regex: searchLoginTerm, $options: 'ix' } },
                        { "accountData.email": { $regex: searchEmailTerm, $options: 'ix' } }
                    ]
                }
            )

        const pagesCount = Math.ceil(totalCount / pageSize)

        const requestedUsers = await this.UsersModel
            .find(
                {
                    $or: [
                        { "accountData.login": { $regex: searchLoginTerm, $options: 'ix' } },
                        { "accountData.email": { $regex: searchEmailTerm, $options: 'ix' } }
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