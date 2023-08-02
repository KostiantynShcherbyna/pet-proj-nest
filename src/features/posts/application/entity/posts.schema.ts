import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose"
import { HydratedDocument, Model, Types } from "mongoose"
import { UpdatePostBodyInputModel } from "src/features/posts/api/models/input/update-post.body.input-model"
import {
  POSTS_CONTENT_MAX_LENGTH,
  POSTS_SHORTDESCRIPTION_MAX_LENGTH,
  POSTS_TITLE_MAX_LENGTH,
  LikeStatus
} from "src/infrastructure/utils/constants"
import { UsersDocument } from "../../../super-admin/application/entity/users.schema"
import { CreatePostBodyDto } from "../../../../infrastructure/dto/create-post-body.dto"


export interface IExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  like: ILike[];
  newestLikes: INewestLikes[];
}

export interface ILike {
  userId: string;
  status: string;
}

export interface INewestLikes {
  addedAt: string;
  userId: string;
  login: string;
}


@Schema()
export class Posts {

  @Prop({
    type: String,
    required: true,
    maxlength: POSTS_TITLE_MAX_LENGTH
  })
  title: string

  @Prop({
    type: String,
    required: true,
    maxlength: POSTS_SHORTDESCRIPTION_MAX_LENGTH
  })
  shortDescription: string

  @Prop({
    type: String,
    maxlength: POSTS_CONTENT_MAX_LENGTH
  })
  content: string

  @Prop({
    type: String,
    required: true
  })
  blogId: string

  @Prop({
    type: String,
    required: true
  })
  blogName: string

  @Prop({
    type: String,
    required: true
  })
  createdAt: string

  @Prop(
    raw({
      likesCount: {
        type: Number,
        required: true,
        default: 0,
        min: 0
      },
      dislikesCount: {
        type: Number,
        required: true,
        default: 0,
        min: 0
      },
      like: [
        {
          userId: {
            type: String,
            required: true
          },
          status: {
            type: String,
            required: true,
            enum: LikeStatus,
            default: LikeStatus.None
          }
        }
      ],
      newestLikes: [
        {
          addedAt: {
            type: String,
            required: true
          },
          userId: {
            type: String,
            required: true
          },
          login: {
            type: String,
            required: true
          }
        }
      ]
    }))
  extendedLikesInfo: IExtendedLikesInfo

  static createPost(bodyBlogPost: CreatePostBodyDto, blogId: string, blogName: string, PostsModel: PostsModel): PostsDocument {

    const date = new Date().toISOString()

    const newPostDto = {
      title: bodyBlogPost.title,
      shortDescription: bodyBlogPost.shortDescription,
      content: bodyBlogPost.content,
      blogId: blogId,
      blogName: blogName,
      createdAt: date,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        like: [],
        newestLikes: []
      }
    }

    const newPost = new PostsModel(newPostDto)
    return newPost
  }

  static async deletePost(id: string, PostsModel: PostsModel): Promise<number> {
    const deletedPostResult = await PostsModel.deleteOne({ _id: new Types.ObjectId(id) })
    return deletedPostResult.deletedCount
  }


  updatePost(bodyPostDto: UpdatePostBodyInputModel) {
    this.title = bodyPostDto.title
    this.shortDescription = bodyPostDto.shortDescription
    this.content = bodyPostDto.content
    this.blogId = bodyPostDto.blogId
  }

  createOrUpdateLike(user: UsersDocument, newLikeStatus: string) {

    const like = this.extendedLikesInfo.like.find(like => like.userId === user.id)
    if (!like) {
      const newLikeDto = {
        userId: user.id,
        status: newLikeStatus
      }

      if (newLikeStatus === LikeStatus.Like) {
        this.extendedLikesInfo.likesCount++

        const newDate = new Date(Date.now()).toISOString()
        const newestLikesDto = {
          addedAt: newDate,
          userId: user._id.toString(),
          login: user.accountData.login //    TODO
        }
        this.extendedLikesInfo.like.push(newLikeDto)
        this.extendedLikesInfo.newestLikes.push(newestLikesDto)

      } else {
        this.extendedLikesInfo.dislikesCount++
        this.extendedLikesInfo.like.push(newLikeDto)
      }

      return
    }

    if (like.status === newLikeStatus) return

    // Looking for matches in Old status and New status
    if (like.status === LikeStatus.None && newLikeStatus === LikeStatus.Like) {
      this.extendedLikesInfo.likesCount++
      like.status = newLikeStatus

      const newDate = new Date(Date.now()).toISOString()
      const newestLikesDto = {
        addedAt: newDate,
        userId: user._id.toString(),
        login: user.accountData.login
      }
      this.extendedLikesInfo.newestLikes.push(newestLikesDto)

      return
    }
    if (like.status === LikeStatus.None && newLikeStatus === LikeStatus.Dislike) {
      this.extendedLikesInfo.dislikesCount++
      like.status = newLikeStatus
      return
    }
    if (like.status === LikeStatus.Like && newLikeStatus === LikeStatus.None) {
      const newArray = this.extendedLikesInfo.newestLikes.filter(like => like.userId !== user._id.toString())
      this.extendedLikesInfo.newestLikes = newArray
      this.extendedLikesInfo.likesCount--
      like.status = newLikeStatus
      return
    }
    if (like.status === LikeStatus.Like && newLikeStatus === LikeStatus.Dislike) {
      const newArray = this.extendedLikesInfo.newestLikes.filter(like => like.userId !== user._id.toString())
      this.extendedLikesInfo.newestLikes = newArray
      this.extendedLikesInfo.likesCount--
      this.extendedLikesInfo.dislikesCount++
      like.status = newLikeStatus
      return
    }
    if (like.status === LikeStatus.Dislike && newLikeStatus === LikeStatus.None) {
      this.extendedLikesInfo.dislikesCount--
      like.status = newLikeStatus
      return
    }
    if (like.status === LikeStatus.Dislike && newLikeStatus === LikeStatus.Like) {
      this.extendedLikesInfo.dislikesCount--
      this.extendedLikesInfo.likesCount++
      like.status = newLikeStatus

      const newDate = new Date(Date.now()).toISOString()
      const newestLikesDto = {
        addedAt: newDate,
        userId: user._id.toString(),
        login: user.accountData.login
      }
      this.extendedLikesInfo.newestLikes.push(newestLikesDto)

      return
    }
  }

}

interface PostsStatics {
  createPost(bodyBlogPost: CreatePostBodyDto, blogId: string, blogName: string, PostsModel: PostsModel): PostsDocument;

  deletePost(id: string, PostsModel: PostsModel): Promise<number>
}

export const PostsSchema = SchemaFactory.createForClass(Posts)
PostsSchema.statics.createPost = Posts.createPost
PostsSchema.methods.updatePost = Posts.prototype.updatePost
PostsSchema.methods.createOrUpdateLike = Posts.prototype.createOrUpdateLike

export type PostsDocument = HydratedDocument<Posts>;
export type PostsModel = Model<PostsDocument> & PostsStatics
