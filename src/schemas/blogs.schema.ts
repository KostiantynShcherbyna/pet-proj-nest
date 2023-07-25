import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Model, Types } from 'mongoose'
import { Contract } from 'src/contract'
import { BodyBlogInputModel } from 'src/input-models/body/body-blog.input-model'
import {
  BLOGS_DESCRIPTION_MAX_LENGTH,
  BLOGS_NAME_MAX_LENGTH,
  BLOGS_WEBSITEURL_MAX_LENGTH,
  BLOGS_WEBSITEURL_REGEX,
} from 'src/utils/constants/constants'
import { ErrorEnums } from 'src/utils/errors/error-enums'
import { PostsModel } from './posts.schema'
import { CreateBlogCommand } from 'src/use-cases/blogger/create-blog.use-case'


@Schema()
export class BlogOwnerInfo {
  @Prop({
    type: String,
    required: true,
  })
  userId: string | null

  @Prop({
    type: String,
    required: true,
  })
  userLogin: string | null
}

@Schema()
export class Blogs {
  @Prop({
    type: String,
    required: true,
    maxlength: BLOGS_NAME_MAX_LENGTH,
  })
  name: string

  @Prop({
    type: String,
    required: true,
    maxlength: BLOGS_DESCRIPTION_MAX_LENGTH,
  })
  description: string

  @Prop({
    type: String,
    required: true,
    maxlength: BLOGS_WEBSITEURL_MAX_LENGTH,
    match: BLOGS_WEBSITEURL_REGEX,
  })
  websiteUrl: string

  @Prop({
    type: String,
    required: true,
  })
  createdAt: string

  @Prop({
    type: Boolean,
    required: true,
  })
  isMembership: boolean

  @Prop({
    required: true,
  })
  blogOwnerInfo: BlogOwnerInfo

  static createBlog(bodyBlog: CreateBlogCommand, login: string, BlogsModel: BlogsModel,): BlogsDocument {
    const date = new Date().toISOString()

    const newBlogDto = {
      name: bodyBlog.name,
      description: bodyBlog.description,
      websiteUrl: bodyBlog.websiteUrl,
      createdAt: date,
      isMembership: false,
      blogOwnerInfo: {
        userid: bodyBlog.userId,
        userLogin: login,
      }
    }
    const newBlog = new BlogsModel(newBlogDto)
    return newBlog
  }

  static async deleteBlog(id: string, BlogsModel: BlogsModel, PostsModel: PostsModel,): Promise<Contract<null | number>> {
    const deleteBlogResult = await BlogsModel.deleteOne({ _id: new Types.ObjectId(id) })
    if (deleteBlogResult.deletedCount === 0)
      return new Contract(null, ErrorEnums.BLOG_NOT_DELETED)

    const deletePostsResult = await PostsModel.deleteMany({ blogId: id })
    if (deletePostsResult.deletedCount === 0)
      return new Contract(null, ErrorEnums.POSTS_NOT_DELETED)

    return new Contract(deleteBlogResult.deletedCount, null)
  }

  updateBlog(newBlogDto: BodyBlogInputModel) {
    this.name = newBlogDto.name
    this.description = newBlogDto.description
    this.websiteUrl = newBlogDto.websiteUrl
  }

  bindBlog(userId: string) {
    this.blogOwnerInfo.userId = userId
  }
}

interface BlogsStatics {
  createBlog(bodyBlogModel: CreateBlogCommand, login: string, BlogsModel: BlogsModel,): BlogsDocument
  deleteBlog(id: string, BlogsModel: BlogsModel, PostsModel: PostsModel,): Promise<Contract<null | number>>
}

export const BlogsSchema = SchemaFactory.createForClass(Blogs)
BlogsSchema.statics.createBlog = Blogs.createBlog
BlogsSchema.methods.updateBlog = Blogs.prototype.updateBlog
BlogsSchema.methods.bindBlog = Blogs.prototype.bindBlog

export type BlogsDocument = HydratedDocument<Blogs>
export type BlogsModel = Model<BlogsDocument> & BlogsStatics
