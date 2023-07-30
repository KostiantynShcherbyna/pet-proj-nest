import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { QueryBlogsInputModel } from "src/input-models/query/query-blogs.input-model"
import { BlogsView, BlogView } from "src/views/blog.view"
import { Blogs, BlogsModel } from "src/schemas/blogs.schema"
import { dtoManager } from "src/utils/managers/dto.manager"
import { PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, SEARCH_LOGIN_TERM_DEFAULT, SEARCH_NAME_TERM_DEFAULT, SORT_BY_DEFAULT, SORT_DIRECTION_DEFAULT, SortDirection } from "../../utils/constants/constants"
import { UsersRepository } from "../users.repository"
import { Types } from "mongoose"
import { Contract } from "src/contract"
import { ErrorEnums } from "src/utils/errors/error-enums"

// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class BlogsQueryRepository {
  BannedBlogUsers: any
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    protected usersRepository: UsersRepository,
  ) {
  }

  async findBlog(id: string): Promise<null | BlogView> {
    const foundBlog = await this.BlogsModel.findById(id)
    if (foundBlog === null) return null
    if (foundBlog.banInfo.isBanned === true) return null

    const foundBlogView = dtoManager.changeBlogView(foundBlog)
    return foundBlogView
  }


  async findBlogs(query: QueryBlogsInputModel, userId?: string): Promise<null | BlogsView> {

    const searchNameTerm = query.searchNameTerm || SEARCH_NAME_TERM_DEFAULT
    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy || SORT_BY_DEFAULT
    const sortDirection = query.sortDirection === SortDirection.Asc
      ? 1
      : -1


    const skippedBlogsCount = (pageNumber - 1) * pageSize


    const totalCount = userId
      ? await this.BlogsModel.countDocuments({
        $and: [
          { "blogOwnerInfo.userId": userId },
          { "banInfo.isBanned": { $ne: true } },
          { name: { $regex: searchNameTerm, $options: "ix" } },
        ]
      })

      : await this.BlogsModel.countDocuments({
        $and: [
          { "banInfo.isBanned": { $ne: true } },
          { name: { $regex: searchNameTerm, $options: "ix" } }
        ]
      })


    const pagesCount = Math.ceil(totalCount / pageSize)


    const requestedBlogs = userId
      ? await this.BlogsModel.find({
        $and: [
          { "blogOwnerInfo.userId": userId },
          { "banInfo.isBanned": { $ne: true } },
          { name: { $regex: searchNameTerm, $options: "ix" } },
        ]
      })
        .sort({ [sortBy]: sortDirection })
        .limit(pageSize)
        .skip(skippedBlogsCount)
        .lean()

      : await this.BlogsModel.find({
        $and: [
          { "banInfo.isBanned": { $ne: true } },
          { name: { $regex: searchNameTerm, $options: "ix" } }
        ]
      })
        .sort({ [sortBy]: sortDirection })
        .limit(pageSize)
        .skip(skippedBlogsCount)
        .lean()


    const mappedBlogs = dtoManager.changeBlogsView(requestedBlogs)


    const blogsView = {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: mappedBlogs
    }

    return blogsView
  }

  async findSABlogs(query: QueryBlogsInputModel): Promise<BlogsView> {

    const searchNameTerm = query.searchNameTerm || SEARCH_NAME_TERM_DEFAULT
    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy || SORT_BY_DEFAULT
    const sortDirection = query.sortDirection === SortDirection.Asc
      ? 1
      : -1

    const skippedBlogsCount = (pageNumber - 1) * pageSize

    const totalCount = await this.BlogsModel.countDocuments(
      {
        $or: [
          { name: { $regex: searchNameTerm, $options: "ix" } },
        ]
      }
    )

    const pagesCount = Math.ceil(totalCount / pageSize)

    const requestedBlogs = await this.BlogsModel.find(
      {
        $or: [
          { name: { $regex: searchNameTerm, $options: "ix" } },
        ]
      }
    )
      .sort({ [sortBy]: sortDirection })
      .limit(pageSize)
      .skip(skippedBlogsCount)
      .lean()

    const mappedBlogs = dtoManager.changeSABlogsView(requestedBlogs)


    const blogsView = {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: mappedBlogs
    }

    return blogsView
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
  // async findBannedUsersOfBlog(props: any) {

  //   const searchLoginTerm = props.searchLoginTerm || SEARCH_LOGIN_TERM_DEFAULT
  //   const pageSize = +props.pageSize || PAGE_SIZE_DEFAULT
  //   const pageNumber = +props.pageNumber || PAGE_NUMBER_DEFAULT
  //   const sortBy = props.sortBy || SORT_BY_DEFAULT
  //   const sortDirection = props.sortDirection === SortDirection.Asc
  //     ? 1
  //     : -1

  //   const skippedUsersCount = (pageNumber - 1) * pageSize

  //   const totalCount = await this.BannedBlogUsers.countDocuments(
  //     {
  //       $and: [
  //         { blogId: props.blogId },
  //         { login: { $regex: searchLoginTerm, $options: 'ix' } },
  //       ]
  //     }
  //   )

  //   const pagesCount = Math.ceil(totalCount / pageSize)

  //   const requestedUsers = await this.BlogsModel.find(
  //     {
  //       $and: [
  //         { blogId: props.blogId },
  //         { login: { $regex: searchLoginTerm, $options: 'ix' } },
  //       ]
  //     }
  //   )
  //     .sort({ [sortBy]: sortDirection })
  //     .limit(pageSize)
  //     .skip(skippedUsersCount)
  //     .lean()

  //   const mappedUsers = dtoManager.createBannedBlogUsersView(requestedUsers)

  //   return {
  //     pagesCount: pagesCount,
  //     page: pageNumber,
  //     pageSize: pageSize,
  //     totalCount: totalCount,
  //     items: mappedUsers
  //   }
  // }


}