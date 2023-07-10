import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { COMMENT_CONTENT_MAX_LENGTH, COMMENT_CONTENT_MIN_LENGTH, MyStatus, } from 'src/utils/constants/constants';


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


@Schema()
export class Comments {

    _id: Types.ObjectId

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

    @Prop(
        raw({
            userId: {
                type: String,
                required: true,
            },
            userLogin: {
                type: String,
                required: true,
            }
        }))
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
            like: [
                {
                    userId: {
                        type: String,
                        required: true,
                    },
                    status: {
                        type: String,
                        required: true,
                        enum: MyStatus,
                        default: MyStatus.None,
                    }
                }
            ],
        }))
    likesInfo: ILikesInfo

    checkCommentator(userId: string) {
        return this.commentatorInfo.userId === userId
    }

    updateComment(content: string) {
        this.content = content
    }

    createOrUpdateLike(userId: string, newLikeStatus: string) {

        const like = this.likesInfo.like.find(like => like.userId === userId)
        if (!like) {
            const newLike = {
                userId: userId,
                status: newLikeStatus
            }

            newLikeStatus === MyStatus.Like ? this.likesInfo.likesCount++ : this.likesInfo.dislikesCount++

            this.likesInfo.like.push(newLike)

            return
        }

        if (like.status === newLikeStatus) return

        // Looking for matches in Old status and New status
        if (like.status === MyStatus.None && newLikeStatus === MyStatus.Like) {
            this.likesInfo.likesCount++
            like.status = newLikeStatus
            return
        }
        if (like.status === MyStatus.None && newLikeStatus === MyStatus.Dislike) {
            this.likesInfo.dislikesCount++
            like.status = newLikeStatus
            return
        }
        if (like.status === MyStatus.Like && newLikeStatus === MyStatus.None) {
            this.likesInfo.likesCount--
            like.status = newLikeStatus
            return
        }
        if (like.status === MyStatus.Like && newLikeStatus === MyStatus.Dislike) {
            this.likesInfo.likesCount--
            this.likesInfo.dislikesCount++
            like.status = newLikeStatus
            return
        }
        if (like.status === MyStatus.Dislike && newLikeStatus === MyStatus.None) {
            this.likesInfo.dislikesCount--
            like.status = newLikeStatus
            return
        }
        if (like.status === MyStatus.Dislike && newLikeStatus === MyStatus.Like) {
            this.likesInfo.dislikesCount--
            this.likesInfo.likesCount++
            like.status = newLikeStatus
            return
        }
    }

}
export const CommentsSchema = SchemaFactory.createForClass(Comments)

CommentsSchema.methods.checkCommentator = Comments.prototype.checkCommentator
CommentsSchema.methods.updateComment = Comments.prototype.updateComment

export type CommentsDocument = HydratedDocument<Comments>
export type CommentsModel = Model<CommentsDocument>