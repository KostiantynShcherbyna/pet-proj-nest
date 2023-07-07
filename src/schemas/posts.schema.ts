import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { BodyPostModel } from 'src/models/body/BodyPostModel';
import { POSTS_CONTENT_MAX_LENGTH, POSTS_SHORTDESCRIPTION_MAX_LENGTH, POSTS_TITLE_MAX_LENGTH, myStatusEnum, } from 'src/utils/constants/constants';


// @Schema()
// export class ExtendedLikesInfo {

//     @Prop({
//         type: Number,
//         required: true,
//         default: 0,
//         min: 0,
//     })
//     likesCount: number

//     @Prop({
//         type: Number,
//         required: true,
//         default: 0,
//         min: 0,
//     })
//     dislikesCount: number

//     @Prop(
//         raw([
//             {
//                 userId: {
//                     type: String,
//                     required: true,
//                 },
//                 status: {
//                     type: String,
//                     required: true,
//                     enum: myStatusEnum,
//                     default: myStatusEnum.None,
//                 }
//             }
//         ])
//     )
//     like: string

//     @Prop(
//         raw([
//             {
//                 addedAt: {
//                     type: String,
//                     required: true,
//                 },
//                 userId: {
//                     type: String,
//                     required: true,
//                 },
//                 login: {
//                     type: String,
//                     required: true,
//                 }
//             }
//         ]))
//     newestLikes: 

// }
// export const PostsSchema = SchemaFactory.createForClass(Posts);


export interface IExtendedLikesInfo {
    likesCount: number
    dislikesCount: number
    like: ILike[]
    newestLikes: INewestLikes[]
}
export interface ILike {
    userId: string
    status: string
}
export interface INewestLikes {
    addedAt: string
    userId: string
    login: string
}


@Schema()
export class Posts {

    _id: Types.ObjectId

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
        }))
    extendedLikesInfo: IExtendedLikesInfo

    static createPost(bodyPostModel: BodyPostModel, blogName: string, PostsModel: PostsModel) {

        const date = new Date().toISOString()

        const newPostDto = {
            _id: new Types.ObjectId(),
            title: bodyPostModel.title,
            shortDescription: bodyPostModel.shortDescription,
            content: bodyPostModel.content,
            blogId: bodyPostModel.blogId,
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

    updatePost(bodyPostDto: BodyPostModel) {
        this.title = bodyPostDto.title
        this.shortDescription = bodyPostDto.shortDescription
        this.content = bodyPostDto.content
        this.blogId = bodyPostDto.blogId
    }

}
export const PostsSchema = SchemaFactory.createForClass(Posts);

interface PostsStatics {
    createPost(bodyPostModel: BodyPostModel, blogName: string, PostsModel: PostsModel): Posts
}
PostsSchema.statics.createPost = Posts.createPost
PostsSchema.methods.updatePost = Posts.prototype.updatePost


export type PostsDocument = HydratedDocument<Posts>;
export type PostsModel = Model<PostsDocument> & PostsStatics
