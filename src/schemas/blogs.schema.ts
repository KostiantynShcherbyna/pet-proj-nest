import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Model, Types } from 'mongoose'
import { Contract } from 'src/contract'
import { BodyBlogModel } from 'src/models/body/body-blog.model'
import {
  BLOGS_DESCRIPTION_MAX_LENGTH,
  BLOGS_NAME_MAX_LENGTH,
  BLOGS_WEBSITEURL_MAX_LENGTH,
  BLOGS_WEBSITEURL_REGEX,
} from 'src/utils/constants/constants'
import { ErrorEnums } from 'src/utils/errors/error-enums'
import { PostsModel } from './posts.schema'

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

  static createBlog(
    bodyBlog: BodyBlogModel,
    BlogsModel: BlogsModel,
  ): BlogsDocument {
    const date = new Date().toISOString()

    const newBlogDto = {
      name: bodyBlog.name,
      description: bodyBlog.description,
      websiteUrl: bodyBlog.websiteUrl,
      createdAt: date,
      isMembership: false,
    }
    const newBlog = new BlogsModel(newBlogDto)
    return newBlog
  }

  static async deleteBlog(
    id: string,
    BlogsModel: BlogsModel,
    PostsModel: PostsModel,
  ): Promise<Contract<null | number>> {
    const deleteBlogResult = await BlogsModel
      .deleteOne({ _id: new Types.ObjectId(id) })
    if (deleteBlogResult.deletedCount === 0)
      return new Contract(null, ErrorEnums.BLOG_NOT_DELETED)

    const deletePostsResult = await PostsModel.deleteMany({ blogId: id })
    if (deletePostsResult.deletedCount === 0)
      return new Contract(null, ErrorEnums.POSTS_NOT_DELETED)

    return new Contract(deleteBlogResult.deletedCount, null)
  }

  updateBlog(newBlogDto: BodyBlogModel) {
    this.name = newBlogDto.name
    this.description = newBlogDto.description
    this.websiteUrl = newBlogDto.websiteUrl
  }
}

interface BlogsStatics {
  createBlog(
    bodyBlogModel: BodyBlogModel,
    BlogsModel: BlogsModel,
  ): BlogsDocument
  deleteBlog(
    id: string,
    BlogsModel: BlogsModel,
    PostsModel: PostsModel,
  ): Promise<Contract<null | number>>
}

export const BlogsSchema = SchemaFactory.createForClass(Blogs)
BlogsSchema.statics.createBlog = Blogs.createBlog
BlogsSchema.methods.updateBlog = Blogs.prototype.updateBlog

export type BlogsDocument = HydratedDocument<Blogs>
export type BlogsModel = Model<BlogsDocument> & BlogsStatics
