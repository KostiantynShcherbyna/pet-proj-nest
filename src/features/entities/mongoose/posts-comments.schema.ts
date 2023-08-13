import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose"
import {
  COMMENT_CONTENT_MAX_LENGTH,
  COMMENT_CONTENT_MIN_LENGTH,
  LikeStatus
} from "../../../infrastructure/utils/constants"
import { UsersDocument } from "./users.schema"
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

export interface IPostInfo {
  id: string
  title: string
  blogId: string
  blogName: string
}


@Schema()
export class PostsComments {

  // @Prop({
  //   type: String,
  //   required: true,
  // })
  // commentId: string

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

  @Prop(
    raw({
      id: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      blogId: {
        type: String,
        required: true,
      },
      blogName: {
        type: String,
        required: true,
      },
    }),
  )
  postInfo: IPostInfo

  static createPostComment(
    postId: string,
    content: string,
    user: UsersDocument,
    PostsCommentsModel: PostsCommentsModel,
    commentId: Types.ObjectId,
    title: string,
    blogId: string,
    blogName: string,
    createdAt: string,
  ): PostsCommentsDocument {

    const newComment = {
      _id: commentId,
      content: content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.accountData.login,
      },
      createdAt: createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        likes: [],
      },
      postInfo: {
        id: postId,
        title: title,
        blogId: blogId,
        blogName: blogName
      }
    }
    const newCommentInsertResult = new PostsCommentsModel(newComment)
    return newCommentInsertResult
  }

  static async deletePostComments(postId: string, PostsCommentsModel: PostsCommentsModel): Promise<number> {
    const deletePostCommentsResult = await PostsCommentsModel.deleteMany({ "postInfo.id": postId })
    return deletePostCommentsResult.deletedCount
  }

  // static async updatePostComments(postId: string, title: string, PostsCommentsModel: PostsCommentsModel) {
  //   const updatePostCommentsResult = await PostsCommentsModel.updateMany({ "postInfo.id": postId }, { "postInfo.title": title })
  //   return updatePostCommentsResult.modifiedCount
  // }
  // updatePostComment(title: string) {
  //   this.postInfo.title = title
  // }

  // checkCommentator(userId: string) {
  //   return this.commentatorInfo.userId === userId
  // }


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

interface PostsCommentsStatics {
  createPostComment(
    postId: string,
    content: string,
    user: UsersDocument,
    PostsCommentsModel: PostsCommentsModel,
    commentId: Types.ObjectId,
    title: string,
    blogId: string,
    blogName: string,
    createdAt: string,
  ): PostsCommentsDocument

  deletePostComments(
    commentId: string,
    PostsCommentsModel: PostsCommentsModel,
  ): Promise<number>

  updatePostComments(
    commentId: string,
    PostsCommentsModel: PostsCommentsModel,
  ): Promise<number>
}

export const PostsCommentsSchema = SchemaFactory.createForClass(PostsComments)
PostsCommentsSchema.statics.createPostComment = PostsComments.createPostComment
// PostsCommentsSchema.methods.checkCommentator = PostsComments.prototype.checkCommentator
// PostsCommentsSchema.methods.updatePostComment = PostsComments.prototype.updatePostComment
PostsCommentsSchema.methods.createOrUpdateLike = PostsComments.prototype.createOrUpdateLike

export type PostsCommentsDocument = HydratedDocument<PostsComments>
export type PostsCommentsModel = Model<PostsCommentsDocument> & PostsCommentsStatics
