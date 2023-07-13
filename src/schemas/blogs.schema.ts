import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Model, Types } from "mongoose"
import { BodyBlogModel } from "src/models/body/BodyBlogModel"
import {
  BLOGS_DESCRIPTION_MAX_LENGTH,
  BLOGS_NAME_MAX_LENGTH,
  BLOGS_WEBSITEURL_MAX_LENGTH,
  BLOGS_WEBSITEURL_REGEX
} from "src/utils/constants/constants"


@Schema()
export class Blogs {

  @Prop({
    type: String,
    required: true,
    maxlength: BLOGS_NAME_MAX_LENGTH
  })
  name: string

  @Prop({
    type: String,
    required: true,
    maxlength: BLOGS_DESCRIPTION_MAX_LENGTH
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
    required: true
  })
  isMembership: boolean

  static createBlog(bodyBlog: BodyBlogModel, BlogsModel: BlogsModel): BlogsDocument {

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

  updateBlog(newBlogDto: BodyBlogModel) {
    this.name = newBlogDto.name
    this.description = newBlogDto.description
    this.websiteUrl = newBlogDto.websiteUrl
  }

}
interface BlogsStatics {
  createBlog(bodyBlogModel: BodyBlogModel, BlogsModel: BlogsModel): BlogsDocument
}
export const BlogsSchema = SchemaFactory.createForClass(Blogs)

BlogsSchema.statics.createBlog = Blogs.createBlog
BlogsSchema.methods.updateBlog = Blogs.prototype.updateBlog

export type BlogsDocument = HydratedDocument<Blogs>;
export type BlogsModel = Model<BlogsDocument> & BlogsStatics;