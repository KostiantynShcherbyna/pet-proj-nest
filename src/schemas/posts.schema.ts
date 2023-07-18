import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose"
import { HydratedDocument, Model, Types } from "mongoose"
import { BodyPostModel } from "src/models/body/body-post.model"
import {
  POSTS_CONTENT_MAX_LENGTH,
  POSTS_SHORTDESCRIPTION_MAX_LENGTH,
  POSTS_TITLE_MAX_LENGTH,
  MyStatus
} from "src/utils/constants/constants"
import { UsersDocument } from "./users.schema"
import { BodyBlogPostModel } from "src/models/body/body-blog-post.model"
import { Contract } from "src/contract"


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
            enum: MyStatus,
            default: MyStatus.None
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

  static createPost(bodyBlogPost: BodyBlogPostModel, blogId: string, blogName: string, PostsModel: PostsModel): PostsDocument {

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

  static async deletePost(id: string, PostsModel: PostsModel): Promise<Contract<number>> {
    const deletedPostResult = await PostsModel.deleteOne({ _id: new Types.ObjectId(id) })
    return new Contract(deletedPostResult.deletedCount, null)
  }




  updatePost(bodyPostDto: BodyPostModel) {
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

      if (newLikeStatus === MyStatus.Like) {
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
    if (like.status === MyStatus.None && newLikeStatus === MyStatus.Like) {
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
    if (like.status === MyStatus.None && newLikeStatus === MyStatus.Dislike) {
      this.extendedLikesInfo.dislikesCount++
      like.status = newLikeStatus
      return
    }
    if (like.status === MyStatus.Like && newLikeStatus === MyStatus.None) {
      const newArray = this.extendedLikesInfo.newestLikes.filter(like => like.userId !== user._id.toString())
      this.extendedLikesInfo.newestLikes = newArray
      this.extendedLikesInfo.likesCount--
      like.status = newLikeStatus
      return
    }
    if (like.status === MyStatus.Like && newLikeStatus === MyStatus.Dislike) {
      const newArray = this.extendedLikesInfo.newestLikes.filter(like => like.userId !== user._id.toString())
      this.extendedLikesInfo.newestLikes = newArray
      this.extendedLikesInfo.likesCount--
      this.extendedLikesInfo.dislikesCount++
      like.status = newLikeStatus
      return
    }
    if (like.status === MyStatus.Dislike && newLikeStatus === MyStatus.None) {
      this.extendedLikesInfo.dislikesCount--
      like.status = newLikeStatus
      return
    }
    if (like.status === MyStatus.Dislike && newLikeStatus === MyStatus.Like) {
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
  createPost(bodyBlogPost: BodyBlogPostModel, blogId: string, blogName: string, PostsModel: PostsModel): PostsDocument;
  deletePost(id: string, PostsModel: PostsModel): Promise<Contract<number>>
}

export const PostsSchema = SchemaFactory.createForClass(Posts)
PostsSchema.statics.createPost = Posts.createPost
PostsSchema.methods.updatePost = Posts.prototype.updatePost
PostsSchema.methods.createOrUpdateLike = Posts.prototype.createOrUpdateLike

export type PostsDocument = HydratedDocument<Posts>;
export type PostsModel = Model<PostsDocument> & PostsStatics
