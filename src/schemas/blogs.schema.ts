import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BLOGS_DESCRIPTION_MAX_LENGTH, BLOGS_NAME_MAX_LENGTH, BLOGS_WEBSITEURL_MAX_LENGTH, BLOGS_WEBSITEURL_REGEX } from 'src/utils/constants/constants';

export type BlogsDocument = HydratedDocument<Blogs>;

@Schema()
export class Blogs {
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
}

export const BlogsSchema = SchemaFactory.createForClass(Blogs);