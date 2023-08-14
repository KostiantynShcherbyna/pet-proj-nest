import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose"
import {
  COMMENT_CONTENT_MAX_LENGTH,
  COMMENT_CONTENT_MIN_LENGTH,
  LikeStatus
} from "../../../../../infrastructure/utils/constants"
import { UsersDocument } from "../../../../super-admin/application/entities/mongoose/users.schema"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { HydratedDocument, Model, Types } from "mongoose"


export interface ICommentatorInfo {
  userId: string
  userLogin: string
}
export interface ILikesInfo {
  likesCount: number
  dislikesCount: number
  likes: ILike[]
}
export interface ILike {
  userId: string
  status: string
}

@Schema()
export class Comments {
  @Prop({
    type: String,
    required: true,
  })
  postId: string

  @Prop({
    type: String,
    required: true,
    minlength: COMMENT_CONTENT_MIN_LENGTH,
    maxlength: COMMENT_CONTENT_MAX_LENGTH,
  })
  content: string

  @Prop(
    raw({
      userId: {
        type: String,
        required: true,
      },
      userLogin: {
        type: String,
        required: true,
      },
    }),
  )
  commentatorInfo: ICommentatorInfo

  @Prop({
    type: String,
    required: true,
  })
  createdAt: string

  @Prop(
    raw({
      likesCount: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },
      dislikesCount: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },
      likes: [
        {
          userId: {
            type: String,
            required: true,
          },
          status: {
            type: String,
            required: true,
            enum: LikeStatus,
            default: LikeStatus.None,
          },
        },
      ],
    }),
  )
  likesInfo: ILikesInfo

  static createComment(
    postId: string,
    content: string,
    user: UsersDocument,
    CommentsModel: CommentsModel,
  ): CommentsDocument {

    const date = new Date().toISOString()
    const newComment = {
      postId: postId,
      content: content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.accountData.login,
      },
      createdAt: date,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        likes: [],
      },
    }
    const newCommentInsertResult = new CommentsModel(newComment)
    return newCommentInsertResult
  }

  static async deleteComment(commentId: string, CommentsModel: CommentsModel): Promise<Contract<number>> {
    let deleteCommentResult = await CommentsModel.deleteOne({
      _id: new Types.ObjectId(commentId),
    })
    return new Contract(deleteCommentResult.deletedCount, null)
  }

  checkCommentator(userId: string) {
    return this.commentatorInfo.userId === userId
  }

  updateComment(content: string) {
    this.content = content
  }

  createOrUpdateLike(userId: string, newLikeStatus: string) {
    const like = this.likesInfo.likes.find((like) => like.userId === userId)
    if (!like) {
      const newLike = {
        userId: userId,
        status: newLikeStatus,
      }
      newLikeStatus === LikeStatus.Like
        ? this.likesInfo.likesCount++
        : this.likesInfo.dislikesCount++

      this.likesInfo.likes.push(newLike)
      return
    }

    if (like.status === newLikeStatus) return
    // Looking for matches in Old status and New status
    if (like.status === LikeStatus.None && newLikeStatus === LikeStatus.Like) {
      this.likesInfo.likesCount++
      like.status = newLikeStatus
      return
    }
    if (like.status === LikeStatus.None && newLikeStatus === LikeStatus.Dislike) {
      this.likesInfo.dislikesCount++
      like.status = newLikeStatus
      return
    }
    if (like.status === LikeStatus.Like && newLikeStatus === LikeStatus.None) {
      this.likesInfo.likesCount--
      like.status = newLikeStatus
      return
    }
    if (like.status === LikeStatus.Like && newLikeStatus === LikeStatus.Dislike) {
      this.likesInfo.likesCount--
      this.likesInfo.dislikesCount++
      like.status = newLikeStatus
      return
    }
    if (like.status === LikeStatus.Dislike && newLikeStatus === LikeStatus.None) {
      this.likesInfo.dislikesCount--
      like.status = newLikeStatus
      return
    }
    if (like.status === LikeStatus.Dislike && newLikeStatus === LikeStatus.Like) {
      this.likesInfo.dislikesCount--
      this.likesInfo.likesCount++
      like.status = newLikeStatus
      return
    }
  }
}
interface CommentsStatics {
  createComment(
    postId: string,
    content: string,
    user: UsersDocument,
    CommentsModel: CommentsModel,
  ): CommentsDocument

  deleteComment(
    commentId: string,
    CommentsModel: CommentsModel,
  ): Promise<Contract<number>>
}

export const CommentsSchema = SchemaFactory.createForClass(Comments)
CommentsSchema.statics.createComment = Comments.createComment
CommentsSchema.methods.checkCommentator = Comments.prototype.checkCommentator
CommentsSchema.methods.updateComment = Comments.prototype.updateComment
CommentsSchema.methods.createOrUpdateLike = Comments.prototype.createOrUpdateLike

export type CommentsDocument = HydratedDocument<Comments>
export type CommentsModel = Model<CommentsDocument> & CommentsStatics
