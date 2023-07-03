import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { POSTS_CONTENT_MAX_LENGTH, POSTS_SHORTDESCRIPTION_MAX_LENGTH, POSTS_TITLE_MAX_LENGTH, myStatusEnum, } from 'src/utils/constants/constants';



export interface IExtendedLikesInfo {
    likesCount: number
    dislikesCount: number
    like: {
        userId: string
        status: string
    }[]
    newestLikes: {
        addedAt: string
        userId: string
        login: string
    }[]
}


@Schema()
export class Posts {
    @Prop({
        type: String,
        required: true,
        maxlength: POSTS_TITLE_MAX_LENGTH,
    })
    title: string

    @Prop({
        type: String,
        required: true,
        maxlength: POSTS_SHORTDESCRIPTION_MAX_LENGTH,
    })
    shortDescription: string

    @Prop({
        type: String,
        maxlength: POSTS_CONTENT_MAX_LENGTH,
    })
    content: string

    @Prop({
        type: String,
        required: true,
    })
    blogId: string

    @Prop({
        type: String,
        required: true,
    })
    blogName: string

    @Prop({
        type: String,
        required: true,
    })
    createdAt: string

    @Prop({
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
        like: [
            {
                userId: {
                    type: String,
                    required: true,
                },
                status: {
                    type: String,
                    required: true,
                    enum: myStatusEnum,
                    default: myStatusEnum.None,
                }
            }
        ],
        newestLikes: [
            {
                addedAt: {
                    type: String,
                    required: true,
                },
                userId: {
                    type: String,
                    required: true,
                },
                login: {
                    type: String,
                    required: true,
                }
            }
        ]
    })
    extendedLikesInfo: IExtendedLikesInfo

}
export type PostsDocument = HydratedDocument<Posts>;

export const PostsSchema = SchemaFactory.createForClass(Posts);
export type PostsModel = Model<PostsDocument>
