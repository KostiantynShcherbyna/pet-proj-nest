import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { bodyBlogModel } from 'src/models/body/bodyBlogModel';
import { BLOGS_DESCRIPTION_MAX_LENGTH, BLOGS_NAME_MAX_LENGTH, BLOGS_WEBSITEURL_MAX_LENGTH, BLOGS_WEBSITEURL_REGEX } from 'src/utils/constants/constants';


@Schema()
export class Blogs {
    @Prop({
        type: Types.ObjectId
    })
    _id: Types.ObjectId

    @Prop({
        type: String,
        required: true,
        maxlength: BLOGS_NAME_MAX_LENGTH
    })
    name: string;

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
        maxlength: BLOGS_NAME_MAX_LENGTH
    })
    createdAt: string

    @Prop({
        type: Boolean,
        required: true
    })
    isMembership: boolean

    static createBlog(bodyBlogModel: bodyBlogModel, BlogsModel: BlogsModel) {

        const date = new Date().toISOString()

        const newBlogDto = {

            name: bodyBlogModel.name,
            description: bodyBlogModel.description,
            websiteUrl: bodyBlogModel.websiteUrl,
            createdAt: date,
            isMembership: false,
        }

        const newBlog = new BlogsModel(newBlogDto)
        return newBlog
    }

}
export const BlogsSchema = SchemaFactory.createForClass(Blogs);

interface BlogsStatics {
    createBlog(bodyBlogModel: bodyBlogModel, BlogsModel: BlogsModel): Blogs;
}
BlogsSchema.statics.createBlog = Blogs.createBlog


export type BlogsDocument = HydratedDocument<Blogs>;
export type BlogsModel = Model<BlogsDocument> & BlogsStatics;