import { Injectable, Inject } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { dtoManager } from "src/utils/managers/dto.manager"
import { ILike } from "src/schemas/posts.schema"
import { MyStatus, PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, SORT_BY_DEFAULT, SortDirection } from "src/utils/constants/constants"
import { CommentView, CommentsView } from "src/views/comment.view"
import { Comments, CommentsModel } from "src/schemas/comments.schema"
import { PostsQueryRepository } from "./posts.query.repository"
// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    @Inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository,
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
    const commentView = dtoManager.changeCommentView(foundComment, like?.status || MyStatus.None)
    return commentView
  }


  async findComments( postId, query, userId?): Promise < null | CommentsView > {

    const foundPost = await this.postsQueryRepository.findPost(postId, userId)
    if(foundPost === null) return null

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
const mappedComments = dtoManager.changeCommentsView(comments, userId,)

return {
  pagesCount: pagesCount,
  page: pageNumber,
  pageSize: pageSize,
  totalCount: totalCount,
  items: mappedComments
}
  }

}