import { Injectable, Inject, NotFoundException } from "@nestjs/common"
import { BlogsRepository } from "../blogs.repository"
import { InjectModel } from "@nestjs/mongoose"
import { QueryBlogInputModel } from "src/input-models/query/query-blog.input-model"
import { BlogView, BlogsView } from "src/views/blog.view"
import { BlogsModel, Blogs } from "src/schemas/blogs.schema"
import { dtoManager } from "src/utils/managers/dto.manager"
import { Types } from "mongoose"
import { QueryPostInputModel } from "src/input-models/query/query-post.input-model"
import { PostView, PostsView } from "src/views/post.view"
import { ILike, Posts, PostsModel } from "src/schemas/posts.schema"
import {
  LikeStatus,
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
  SORT_BY_DEFAULT,
  SORT_DIRECTION_DEFAULT,
  SortDirection
} from "src/utils/constants/constants"
import { Contract } from "src/contract"
import { ErrorEnums } from "src/utils/errors/error-enums"

// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    @Inject(BlogsRepository) protected blogsRepositoryMngs: BlogsRepository
  ) {
  }

  async findPosts(queryPost: QueryPostInputModel, userId: string, blogId?: string,): Promise<Contract<null | PostsView>> {

    if (blogId) {
      const blog = await this.blogsRepositoryMngs.findBlog(blogId)
      if (blog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
      if (blog.blogOwnerInfo.userId !== userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG);
    }

    const pageSize = +queryPost.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +queryPost.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = queryPost.sortBy || SORT_BY_DEFAULT
    const sortDirection = queryPost.sortDirection === SortDirection.Asc
      ? 1
      : -1
    const skippedPostsCount = (pageNumber - 1) * pageSize

    const totalCount = blogId
      ? await this.PostsModel.countDocuments({ blogId: blogId })
      : await this.PostsModel.countDocuments({})

    const pagesCount = Math.ceil(totalCount / pageSize)


    const foundPosts = blogId
      ? await this.PostsModel
        .find({ blogId: blogId })
        .sort({ [sortBy]: sortDirection })
        .limit(pageSize)
        .skip(skippedPostsCount)
        .lean()
      : await this.PostsModel
        .find({})
        .sort({ [sortBy]: sortDirection })
        .limit(pageSize)
        .skip(skippedPostsCount)
        .lean()


    const mappedPosts = dtoManager.changePostsView(foundPosts, userId)

    const postsView = {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: mappedPosts
    }

    return new Contract(postsView, null)
  }

  async findPost(postId: string, userId?: string): Promise<null | PostView> {

    const foundPost = await this.PostsModel.findById(postId)
    if (foundPost === null) return null

    // Looking for a Like if userId is defined
    let like: ILike | undefined
    if (userId) like = foundPost.extendedLikesInfo.like.find(like => like.userId === userId)

    const postView = dtoManager.changePostView(foundPost, like?.status || LikeStatus.None)

    return postView
  }


}