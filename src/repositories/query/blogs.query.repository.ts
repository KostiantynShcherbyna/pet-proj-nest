import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { QueryBlogInputModel } from "src/input-models/query/query-blog.input-model"
import { BlogsView, BlogView } from "src/views/blog.view"
import { Blogs, BlogsModel } from "src/schemas/blogs.schema"
import { dtoManager } from "src/utils/managers/dto.manager"
import { PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, SEARCH_NAME_TERM_DEFAULT, SORT_BY_DEFAULT, SORT_DIRECTION_DEFAULT, SortDirection } from "../../utils/constants/constants"

// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel
  ) {
  }

  async findBlog(id: string): Promise<null | BlogView> {
    const foundBlog = await this.BlogsModel.findById(id)
    if (foundBlog === null) return null

    const foundBlogView = dtoManager.changeBlogView(foundBlog)
    return foundBlogView
  }

  async findBlogs(query: QueryBlogInputModel, userId?: string): Promise<BlogsView> {

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
          { "blogOwnerInfo.userId": userId },
          { name: { $regex: searchNameTerm, $options: "ix" } },
        ]
      }
    )

    const pagesCount = Math.ceil(totalCount / pageSize)

    const requestedBlogs = await this.BlogsModel.find(
      {
        $or: [
          { "blogOwnerInfo.userId": userId },
          { name: { $regex: searchNameTerm, $options: "ix" } },
        ]
      }
    )
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
}