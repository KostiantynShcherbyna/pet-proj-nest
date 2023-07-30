import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { BannedBlogUsers, BannedBlogUsersModel } from "src/schemas/banned-blog-users.schema"
import { dtoManager } from "src/utils/managers/dto.manager"
import { PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, SEARCH_LOGIN_TERM_DEFAULT, SORT_BY_DEFAULT, SortDirection } from "../../utils/constants/constants"

// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class BannedBlogUsersQueryRepository {
  constructor(
    @InjectModel(BannedBlogUsers.name) protected BannedBlogUsersModel: BannedBlogUsersModel,
  ) {
  }


  // async findBannedUsersOfBlog(props: any) {

  //   const searchLoginTerm = props.searchLoginTerm || SEARCH_LOGIN_TERM_DEFAULT
  //   const pageSize = +props.pageSize || PAGE_SIZE_DEFAULT
  //   const pageNumber = +props.pageNumber || PAGE_NUMBER_DEFAULT
  //   const sortBy = props.sortBy || SORT_BY_DEFAULT
  //   const sortDirection = props.sortDirection === SortDirection.Asc
  //     ? 1
  //     : -1

  //   const skippedBannedUsersCount = (pageNumber - 1) * pageSize

  //   const totalCountBannedUsers = await this.BlogsModel.countDocuments(
  //     {
  //       $and: [
  //         { bannedUsers: { $elemMatch: { isBanned: true } } },
  //         { bannedUsers: { $elemMatch: { login: { $regex: searchLoginTerm, $options: 'ix' } } } },
  //       ]
  //     }
  //   )

  //   const pagesCount = Math.ceil(totalCountBannedUsers / pageSize)

  //   const bannedUsers = await this.BlogsModel.find(
  //     {
  //       $and: [
  //         { bannedUsers: { $elemMatch: { isBanned: true } } },
  //         { bannedUsers: { $elemMatch: { login: { $regex: searchLoginTerm, $options: 'ix' } } } },
  //       ]
  //     }
  //   )
  //     .sort({ [sortBy]: sortDirection })
  //     .limit(pageSize)
  //     .skip(skippedBannedUsersCount)
  //     .lean()

  //   const mappedUsers = dtoManager.createBannedBlogUsersView(bannedUsers)

  //   return {
  //     pagesCount: pagesCount,
  //     page: pageNumber,
  //     pageSize: pageSize,
  //     totalCount: totalCountBannedUsers,
  //     items: mappedUsers
  //   }
  // }
  async findBannedUsersOfBlog(props: any) {

    const searchLoginTerm = props.searchLoginTerm || SEARCH_LOGIN_TERM_DEFAULT
    const pageSize = +props.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +props.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = props.sortBy || SORT_BY_DEFAULT
    const sortDirection = props.sortDirection === SortDirection.Asc
      ? 1
      : -1

    const skippedUsersCount = (pageNumber - 1) * pageSize

    const totalCount = await this.BannedBlogUsersModel.countDocuments(
      {
        $and: [
          { blogId: props.blogId },
          { isBanned: true },
          { login: { $regex: searchLoginTerm, $options: 'ix' } },
        ]
      }
    )

    const pagesCount = Math.ceil(totalCount / pageSize)

    const requestedUsers = await this.BannedBlogUsersModel.find(
      {
        $and: [
          { blogId: props.blogId },
          { isBanned: true },
          { login: { $regex: searchLoginTerm, $options: 'ix' } },
        ]
      }
    )
      .sort({ [sortBy]: sortDirection })
      .limit(pageSize)
      .skip(skippedUsersCount)
      .lean()

    const bannedUsersView = dtoManager.createBannedBlogUsersView(requestedUsers)

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: bannedUsersView
    }
  }


}