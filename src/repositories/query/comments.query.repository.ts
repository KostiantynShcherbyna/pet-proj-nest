import { Injectable, Inject } from "@nestjs/common"
import { BlogsRepository } from "../blogs.repository"
import { InjectModel } from "@nestjs/mongoose"
import { QueryBlogModel } from "src/models/query/QueryBlogModel"
import { BlogView, BlogsView } from "src/views/BlogView"
import { BlogsModel, Blogs } from "src/schemas/blogs.schema"
import { dtoModify } from "src/utils/modify/dtoModify"
import { Types } from "mongoose"
import { QueryPostModel } from "src/models/query/QueryPostModel"
import { PostView, PostsView } from "src/views/PostView"
import { ILike, Posts, PostsModel } from "src/schemas/posts.schema"
import { MyStatus, PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, SORT_BY_DEFAULT, SORT_DIRECTION_DEFAULT, SortDirection } from "src/utils/constants/constants"
import { QueryCommentModel } from "src/models/query/QueryCommentModel"
import { CommentView, CommentsView } from "src/views/CommentView"
import { Comments, CommentsModel } from "src/schemas/comments.schema"

// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
  ) {
  }

  async findComment(commentId: string, userId?: string): Promise<null | CommentView> {

    const foundComment = await this.CommentsModel.findById(commentId)
    if (foundComment === null) return null

    // Looking for a Like if userId is defined
    let like: ILike | undefined
    if (userId) {
      like = foundComment.likesInfo.like.find(like => like.userId === userId)
    }

    // Mapping dto
    const commentView = dtoModify.changeCommentView(foundComment, like?.status || MyStatus.None)
    return commentView
  }


  async findComments(postId: string, query: QueryCommentModel, userId?: string): Promise<CommentsView> {


    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy || SORT_BY_DEFAULT
    const sortDirection = query.sortDirection === SortDirection.Asc
      ? 1
      : -1

    const skippedCommentsCount = (pageNumber - 1) * pageSize

    const totalCount = await this.CommentsModel.countDocuments({ postId: postId })

    const pagesCount = Math.ceil(totalCount / pageSize)


    const comments = await this.CommentsModel
      .find({ postId: postId })
      .sort({ [sortBy]: sortDirection })
      .limit(pageSize)
      .skip(skippedCommentsCount)
      .lean()

    // Mapping dto
    const mappedComments = dtoModify.changeCommentsView(comments, userId,)

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: mappedComments
    }
  }

}