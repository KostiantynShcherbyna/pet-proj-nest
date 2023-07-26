import { Injectable, Inject } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { dtoManager } from "src/utils/managers/dto.manager"
import { ILike } from "src/schemas/posts.schema"
import { LikeStatus, PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, SORT_BY_DEFAULT, SortDirection } from "src/utils/constants/constants"
import { CommentView, CommentsView } from "src/views/comment.view"
import { Comments, CommentsModel } from "src/schemas/comments.schema"
import { PostsQueryRepository } from "./posts.query.repository"
import { QueryCommentInputModel } from "src/input-models/query/query-comment.input-model"
import { UsersRepository } from "../users.repository"
import { Contract } from "src/contract"
import { ErrorEnums } from "src/utils/errors/error-enums"
// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    protected postsQueryRepository: PostsQueryRepository,
    protected usersRepository: UsersRepository,
  ) {
  }

  async findComment(commentId: string, userId?: string): Promise<Contract<null | CommentView>> {

    const foundComment = await this.CommentsModel.findById(commentId)
    if (foundComment === null)
      return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)



    const bannedUsers = await this.usersRepository.findBannedUsers()
    const bannedUserIds = bannedUsers.map(user => user._id.toString())

    let likesCountMy: number = 0
    let dislikesCountMy: number = 0

    const trueLikes = foundComment.likesInfo.like.filter(like => {
      if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Like) likesCountMy++
      if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Dislike) dislikesCountMy++
      return !bannedUserIds.includes(like.userId)
    })

    const commentCopy = new this.CommentsModel(foundComment)

    commentCopy.likesInfo.likesCount -= likesCountMy
    commentCopy.likesInfo.dislikesCount -= dislikesCountMy
    commentCopy.likesInfo.like = trueLikes






    // if (userId) {
    //   const foundUser = await this.usersRepository.findUser(userId)
    //   if (foundUser === null)
    //     return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    //   if (foundUser.accountData.banInfo.isBanned === true)
    //     return new Contract(null, ErrorEnums.USER_IS_BANNED)
    // }

    // Looking for a Like if userId is defined
    let like: ILike | undefined
    if (userId) {
      like = foundComment.likesInfo.like.find(like => like.userId === userId)
    }

    // Mapping dto
    const commentView = dtoManager.changeCommentView(commentCopy, like?.status || LikeStatus.None)
    return new Contract(commentView, null)
  }


  async findComments(postId: string, query: QueryCommentInputModel, userId?: string): Promise<Contract<null | CommentsView>> {

    // if (userId) {
    //   const foundUser = await this.usersRepository.findUser(userId)
    //   if (foundUser === null)
    //     return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    //   if (foundUser.accountData.banInfo.isBanned === true)
    //     return new Contract(null, ErrorEnums.USER_IS_BANNED)
    // }


    const foundPost = await this.postsQueryRepository.findPost(postId, userId)
    if (foundPost === null)
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

      const trueLikes = comment.likesInfo.like.filter(like => {
        if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Like) likesCount++
        if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Dislike) dislikesCount++
        return !bannedUserIds.includes(like.userId)
      })

      const commentCopy = new this.CommentsModel(comment)
      commentCopy.likesInfo.likesCount -= likesCount
      commentCopy.likesInfo.dislikesCount -= dislikesCount
      commentCopy.likesInfo.like = trueLikes

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