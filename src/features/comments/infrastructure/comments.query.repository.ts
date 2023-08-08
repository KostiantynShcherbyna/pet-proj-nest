import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { PostsQueryRepository } from "../../posts/infrastructure/posts.query.repository"
import { UsersRepository } from "../../super-admin/infrastructure/users.repository"
import { Comments, CommentsModel, ILike } from "../application/entity/comments.schema"
import { Contract } from "../../../infrastructure/utils/contract"
import { CommentsView, GetCommentsOutputModel } from "../api/models/output/get-comments.output-model"
import { ErrorEnums } from "../../../infrastructure/utils/error-enums"
import {
  LikeStatus,
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
  SORT_BY_DEFAULT, SortDirection
} from "../../../infrastructure/utils/constants"
import { dtoManager } from "../../../infrastructure/adapters/output-model.adapter"
import { GetCommentsQueryInputModel } from "../api/models/input/get-comments.query.input-model"


// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    protected postsQueryRepository: PostsQueryRepository,
    protected usersRepository: UsersRepository,
  ) {
  }

  async findComment(commentId: string, userId?: string): Promise<Contract<null | GetCommentsOutputModel>> {

    // const user = await this.usersRepository.findUser(["_id", new Types.ObjectId(userId)])
    // if (user?.accountData.banInfo.isBanned === true)
    //   return new Contract(null, ErrorEnums.USER_IS_BANNED)
    const bannedUsers = await this.usersRepository.findBannedUsers()
    const bannedUserIds = bannedUsers.map(user => user._id.toString())

    const foundComment = await this.CommentsModel.findById(commentId)
    if (foundComment === null)
      return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)
    if (bannedUserIds.includes(foundComment.commentatorInfo.userId))
      return new Contract(null, ErrorEnums.USER_IS_BANNED)


    let likesCountMy: number = 0
    let dislikesCountMy: number = 0

    const trueLikes = foundComment.likesInfo.likes.filter(like => {
      if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Like) likesCountMy++
      if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Dislike) dislikesCountMy++
      return !bannedUserIds.includes(like.userId)
    })

    // Looking for a Like if userId is defined
    let like: ILike | undefined
    if (userId) {
      like = trueLikes.find(like => like.userId === userId)
    }

    // Mapping dto
    const commentView = dtoManager.changeCommentView(foundComment, like?.status || LikeStatus.None)

    commentView.likesInfo.likesCount -= likesCountMy
    commentView.likesInfo.dislikesCount -= dislikesCountMy

    return new Contract(commentView, null)
  }


  async findComments(postId: string, query: GetCommentsQueryInputModel, userId?: string): Promise<Contract<null | CommentsView>> {

    const foundPost = await this.postsQueryRepository.findPost(postId, userId)
    if (foundPost.error === ErrorEnums.POST_NOT_FOUND)
      return new Contract(null, ErrorEnums.POST_NOT_FOUND)

    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy || SORT_BY_DEFAULT
    const sortDirection = query.sortDirection === SortDirection.Asc
      ? 1
      : -1

    const skippedCommentsCount = (pageNumber - 1) * pageSize

    const bannedUsers = await this.usersRepository.findBannedUsers()
    const bannedUserIds = bannedUsers.map(user => user._id.toString())

    // const commentsTotalCount = await this.CommentsModel.countDocuments({ $and: [{ postId: postId }, { "commentatorInfo.userId": { $nin: bannedUserIds } }] })
    const commentsTotalCount = await this.CommentsModel.countDocuments(
      {
        $and: [
          { postId: postId },
          { "commentatorInfo.userId": { $nin: bannedUserIds } }
        ]
      }
    )


    const pagesCount = Math.ceil(commentsTotalCount / pageSize)


    const comments = await this.CommentsModel.find(
      {
        $and: [
          { postId: postId },
          { "commentatorInfo.userId": { $nin: bannedUserIds } }
        ]
      }
    )
      .sort({ [sortBy]: sortDirection })
      .limit(pageSize)
      .skip(skippedCommentsCount)
      .lean()


    const trueComments = comments.map(comment => {
      let likesCount: number = 0
      let dislikesCount: number = 0

      const trueLikes = comment.likesInfo.likes.filter(like => {
        if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Like) likesCount++
        if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Dislike) dislikesCount++
        return !bannedUserIds.includes(like.userId)
      })

      const commentCopy = { ...comment }
      commentCopy.likesInfo.likesCount -= likesCount
      commentCopy.likesInfo.dislikesCount -= dislikesCount
      commentCopy.likesInfo.likes = trueLikes

      return commentCopy
    })


    // Mapping dto
    const mappedComments = dtoManager.changeCommentsView(trueComments, userId,)

    return new Contract({
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: commentsTotalCount,
      items: mappedComments
    }, null)

  }

}