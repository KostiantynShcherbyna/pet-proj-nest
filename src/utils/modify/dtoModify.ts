import { ObjectId, WithId } from "mongodb"
import { myStatusEnum } from "../constants/constants"
import { HydratedDocument } from "mongoose"
import { Blogs } from "src/schemas/blogs.schema"
import { Posts } from "src/schemas/posts.schema"
import { Comments } from "src/schemas/comments.schema"
import { commentView } from "src/views/commentView"
import { Users } from "src/schemas/users.schema"
// import { Posts } from "src/schemas/posts.schema"


export const dtoModify = {

    // ↓↓↓ BLOGS
    changeBlogView(data: Blogs) {

        return {
            id: data._id.toString(),
            name: data.name,
            description: data.description,
            websiteUrl: data.websiteUrl,
            createdAt: data.createdAt,
            isMembership: false,
        }

    },

    // changeBlogsView(data: WithId<blogType>[]) {

    //     return data.map(i => {
    //         return {
    //             id: i._id.toString(),
    //             name: i.name,
    //             description: i.description,
    //             websiteUrl: i.websiteUrl,
    //             createdAt: i.createdAt,
    //             isMembership: false,
    //         }
    //     })

    // },
    changeBlogsView(data: any[]) {

        return data.map(i => {
            return {
                id: i._id.toString(),
                name: i.name,
                description: i.description,
                websiteUrl: i.websiteUrl,
                createdAt: i.createdAt,
                isMembership: false,
            }
        })

    },

    createBlogView(blog: Blogs, mId: ObjectId) {

        const createdBlog = {
            id: mId.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: false,
        }

        return createdBlog
    },

    createBlogViewMngs(blog: Blogs) {

        const createdBlog = {
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: false,
        }

        return createdBlog
    },

    //     // ↓↓↓ POSTS
    //     changePostView(data: WithId<Posts>) {

    //         return {
    //             id: data._id.toString(),
    //             title: data.title,
    //             shortDescription: data.shortDescription,
    //             content: data.content,
    //             blogId: data.blogId,
    //             blogName: data.blogName,
    //             createdAt: data.createdAt,
    //         }

    //     },

    changePostViewMngs(post: Posts, myStatus: string) {

        const newestLikes = (post: Posts) => post.extendedLikesInfo.newestLikes
            .slice(-3)
            .map(like => {
                return {
                    addedAt: like.addedAt,
                    userId: like.userId,
                    login: like.login
                }
            }).reverse()


        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt,
            extendedLikesInfo: {
                likesCount: post.extendedLikesInfo.likesCount,
                dislikesCount: post.extendedLikesInfo.dislikesCount,
                myStatus: myStatus,
                newestLikes: newestLikes(post),
            },

        }

    },


    //     changePostsView(posts: WithId<Posts>[]) {

    //         return posts.map(post => {
    //             return {
    //                 id: post._id.toString(),
    //                 title: post.title,
    //                 shortDescription: post.shortDescription,
    //                 content: post.content,
    //                 blogId: post.blogId,
    //                 blogName: post.blogName,
    //                 createdAt: post.createdAt
    //             }
    //         })

    //     },

    changePostsViewMngs(posts: Posts[], userId?: string) {

        const myStatus = (post: Posts) => post.extendedLikesInfo.like.find(like => like.userId === userId)?.status || myStatusEnum.None
        const newestLikes = (post: Posts) => post.extendedLikesInfo.newestLikes
            .slice(-3)
            .map(like => {
                return {
                    addedAt: like.addedAt,
                    userId: like.userId,
                    login: like.login
                }
            }).reverse()


        return posts.map(post => {
            return {
                id: post._id.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    likesCount: post.extendedLikesInfo.likesCount,
                    dislikesCount: post.extendedLikesInfo.dislikesCount,
                    myStatus: myStatus(post),
                    newestLikes: newestLikes(post),
                },

            }
        })

    },


    //     createPostView(post: Posts, mongoId: ObjectId) {

    //         return {
    //             id: mongoId.toString(),
    //             title: post.title,
    //             shortDescription: post.shortDescription,
    //             content: post.content,
    //             blogId: post.blogId,
    //             blogName: post.blogName,
    //             createdAt: post.createdAt
    //         }

    //     },

    //     createPostViewMngs(post: Posts, id: ObjectId) {

    //         return {
    //             id: id.toString(),
    //             title: post.title,
    //             shortDescription: post.shortDescription,
    //             content: post.content,
    //             blogId: post.blogId,
    //             blogName: post.blogName,
    //             createdAt: post.createdAt
    //         }

    //     },

    // }
    //     // ↓↓↓ POST COMMENTS

    changeCommentView(data: Comments, myStatus: string): commentView {

        return {
            id: data._id.toString(),
            content: data.content,
            commentatorInfo: {
                userId: data.commentatorInfo.userId,
                userLogin: data.commentatorInfo.userLogin,
            },
            createdAt: data.createdAt,
            likesInfo: {
                likesCount: data.likesInfo.likesCount,
                dislikesCount: data.likesInfo.dislikesCount,
                myStatus: myStatus,
            },
        }

    },



    changeCommentsView(comments: Comments[], userId?: string): commentView[] {

        // Looking for a myStatus of Like in each comment
        const myStatusFunc = (comment: Comments) => comment.likesInfo.like.find(like => like.userId === userId)?.status || myStatusEnum.None

        return comments.map(comment => {
            return {
                id: comment._id.toString(),
                content: comment.content,
                commentatorInfo: {
                    userId: comment.commentatorInfo.userId,
                    userLogin: comment.commentatorInfo.userLogin,
                },
                createdAt: comment.createdAt,
                likesInfo: {
                    likesCount: comment.likesInfo.likesCount,
                    dislikesCount: comment.likesInfo.dislikesCount,
                    myStatus: myStatusFunc(comment),
                },
            }
        })


    },


    // //     createCommentView(data: IComment, mongoId: ObjectId, myStatus: string): commentView {

    // //         return {

    // //             id: mongoId.toString(),
    // //             content: data.content,
    // //             commentatorInfo: {
    // //                 userId: data.commentatorInfo.userId,
    // //                 userLogin: data.commentatorInfo.userLogin,
    // //             },
    // //             createdAt: data.createdAt,
    // //             likesInfo: {
    // //                 likesCount: data.likesInfo.likesCount,
    // //                 dislikesCount: data.likesInfo.dislikesCount,
    // //                 myStatus: myStatus,
    // //             },
    // //         }


    // //     },

    // //     // createCommentViewMngs(data: IComment, id: string): commentView {

    // //     //     return {

    // //     //         id: id,
    // //     //         content: data.content,
    // //     //         commentatorInfo: {
    // //     //             userId: data.commentatorInfo.userId,
    // //     //             userLogin: data.commentatorInfo.userLogin,
    // //     //         },
    // //     //         createdAt: data.createdAt,
    // //     //         likesInfo: {
    // //     //             likesCount: data.likesInfo.likesCount,
    // //     //             dislikesCount: data.likesInfo.dislikesCount,
    // //     //             myStatus: data.likesInfo.myStatus,
    // //     //         },
    // //     //     }

    // //     // },


    // //     // ↓↓↓ USERS
    changeUserView(data: Users) {

        return {
            userId: data._id.toString(),
            login: data.accountData.login,
            email: data.accountData.email,
        }


    },



    changeUsersView(data: Users[]) {

        return data.map(i => {
            return {
                id: i._id.toString(),
                login: i.accountData.login,
                email: i.accountData.email,
                createdAt: i.accountData.createdAt,
            }
        })
    },




    createUserView(data: Users) {

        return {
            id: data._id.toString(),
            login: data.accountData.login,
            email: data.accountData.email,
            createdAt: data.accountData.createdAt,
        }
    }
}




// //     // ↓↓↓ DEVICES

// //     createDevicesView(data: WithId<IDevice>[]) {

// //         return data.map(i => {
// //             return {
// //                 ip: i.ip,
// //                 title: i.title,
// //                 lastActiveDate: i.lastActiveDate,
// //                 deviceId: i.deviceId,
// //             }
// //         })

// //     },
// //     createDeviceView(data: WithId<IDevice>) {

// //         return {
// //             ip: data.ip,
// //             title: data.title,
// //             lastActiveDate: data.lastActiveDate,
// //             deviceId: data.deviceId,
// //         }


// //     },

// // }
