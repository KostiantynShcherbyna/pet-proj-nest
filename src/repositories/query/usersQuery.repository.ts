import { Injectable, Inject } from "@nestjs/common"
import { BlogsRepository } from "../blogs.repository"
import { InjectModel } from "@nestjs/mongoose"
import { dtoModify } from "src/utils/modify/dtoModify"
import { Users, UsersModel } from "src/schemas/users.schema"
import { queryUserModel } from "src/models/query/queryUserModel"
import { usersView } from "src/views/userView"
// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class UsersQueryRepository {
    constructor(
        @InjectModel(Users.name) protected UsersModel: UsersModel,
    ) { }

    async findUsers(query: queryUserModel): Promise<usersView> {

        const PAGE_SIZE_DEFAULT = 10
        const PAGE_NUMBER_DEFAULT = 1
        const SEARCH_LOGIN_TERM_DEFAULT = '' // is Null ????
        const SEARCH_EMAIL_TERM_DEFAULT = '' // is Null ????
        const SORT_BY_DEFAULT = 'createdAt'
        const SORT_DIRECTION_DEFAULT = -1

        const searchLoginTerm = query.searchLoginTerm || SEARCH_LOGIN_TERM_DEFAULT
        const searchEmailTerm = query.searchEmailTerm || SEARCH_EMAIL_TERM_DEFAULT
        const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
        const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
        const sortBy = query.sortBy || SORT_BY_DEFAULT
        const sortDirection = query.sortDirection === "asc" ? 1 : SORT_DIRECTION_DEFAULT

        const skippedUsersCount = (pageNumber - 1) * pageSize

        const totalCount = await this.UsersModel.countDocuments(
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

        const mappedUsers = dtoModify.changeUsersView(requestedUsers)

        return {
            pagesCount: pagesCount,
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: mappedUsers
        }
    }


}