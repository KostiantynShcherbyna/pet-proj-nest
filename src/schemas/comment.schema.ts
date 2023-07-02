import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { COMMENT_CONTENT_MAX_LENGTH, COMMENT_CONTENT_MIN_LENGTH, myStatusEnum, } from 'src/utils/constants/constants';


export interface ICommentatorInfo {
    userId: string,
    userLogin: string
}
export interface ILikesInfo {
    likesCount: number,
    dislikesCount: number,
    like: ILike[],
}
export interface ILike {
    userId: string,
    status: string,
}


export type CommentsDocument = HydratedDocument<Comments>;

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

    @Prop({
        userId: {
            type: String,
            required: true,
        },
        userLogin: {
            type: String,
            required: true,
        }
    })
    commentatorInfo: ICommentatorInfo

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
    })
    likesInfo: ILikesInfo

}

export const CommentsSchema = SchemaFactory.createForClass(Comments);