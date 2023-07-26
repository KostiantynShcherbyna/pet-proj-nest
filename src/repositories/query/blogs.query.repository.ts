import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { QueryBlogInputModel } from "src/input-models/query/query-blog.input-model"
import { BlogsView, BlogView } from "src/views/blog.view"
import { Blogs, BlogsModel } from "src/schemas/blogs.schema"
import { dtoManager } from "src/utils/managers/dto.manager"
import { PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, SEARCH_NAME_TERM_DEFAULT, SORT_BY_DEFAULT, SORT_DIRECTION_DEFAULT, SortDirection } from "../../utils/constants/constants"
import { UsersRepository } from "../users.repository"
import { Types } from "mongoose"
import { Contract } from "src/contract"
import { ErrorEnums } from "src/utils/errors/error-enums"

// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    protected usersRepository: UsersRepository,
  ) {
  }

  async findBlog(id: string): Promise<null | BlogView> {
    const foundBlog = await this.BlogsModel.findById(id)
    if (foundBlog === null) return null

    const foundBlogView = dtoManager.changeBlogView(foundBlog)
    return foundBlogView
  }


  async findBlogs(query: QueryBlogInputModel, userId?: string): Promise<null | BlogsView> {

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
          { name: { $regex: searchNameTerm, $options: "ix" } },
        ]
      })

      : await this.BlogsModel.countDocuments({
        name: { $regex: searchNameTerm, $options: "ix" }
      })

    const pagesCount = Math.ceil(totalCount / pageSize)



    const requestedBlogs = userId
      ? await this.BlogsModel.find({
        $and: [
          { "blogOwnerInfo.userId": userId },
          { name: { $regex: searchNameTerm, $options: "ix" } },
        ]
      })
        .sort({ [sortBy]: sortDirection })
        .limit(pageSize)
        .skip(skippedBlogsCount)
        .lean()

      : await this.BlogsModel.find({
        name: { $regex: searchNameTerm, $options: "ix" }
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


  // async findBloggerBlogs(query: QueryBlogInputModel, userId: string): Promise<Contract<null | BlogsView>> {

  //   // const user = await this.usersRepository.findUser(["_id", new Types.ObjectId(userId)])
  //   // if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)
  //   // if (user.accountData.banInfo.isBanned === true) return new Contract(null, ErrorEnums.USER_IS_BANNED)

  //   const searchNameTerm = query.searchNameTerm || SEARCH_NAME_TERM_DEFAULT
  //   const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
  //   const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
  //   const sortBy = query.sortBy || SORT_BY_DEFAULT
  //   const sortDirection = query.sortDirection === SortDirection.Asc
  //     ? 1
  //     : -1

  //   const skippedBlogsCount = (pageNumber - 1) * pageSize

  //   const totalCount = await this.BlogsModel.countDocuments(
  //     {
  //       $and: [
  //         { "blogOwnerInfo.userId": userId },
  //         { name: { $regex: searchNameTerm, $options: "ix" } },
  //       ]
  //     }
  //   )

  //   const pagesCount = Math.ceil(totalCount / pageSize)

  //   const requestedBlogs = await this.BlogsModel.find(
  //     {
  //       $and: [
  //         { "blogOwnerInfo.userId": userId },
  //         { name: { $regex: searchNameTerm, $options: "ix" } },
  //       ]
  //     }
  //   )
  //     .sort({ [sortBy]: sortDirection })
  //     .limit(pageSize)
  //     .skip(skippedBlogsCount)
  //     .lean()

  //   const mappedBlogs = dtoManager.changeBlogsView(requestedBlogs)

  //   const blogsView = {
  //     pagesCount: pagesCount,
  //     page: pageNumber,
  //     pageSize: pageSize,
  //     totalCount: totalCount,
  //     items: mappedBlogs
  //   }

  //   return new Contract(blogsView, null)
  // }

  async findSABlogs(query: QueryBlogInputModel): Promise<BlogsView> {

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
}