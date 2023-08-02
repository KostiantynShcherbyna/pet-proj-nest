import { BlogsDocument as any } from "src/infrastructure/schemas/blogs.schema"
import { CommentsDocument } from "src/infrastructure/schemas/comments.schema"
import { Devices } from "src/infrastructure/schemas/devices.schema"
import { PostsDocument } from "src/infrastructure/schemas/posts.schema"
import { UsersDocument } from "src/infrastructure/schemas/users.schema"
import { GetCommentsOutputModel } from "src/features/comments/api/models/output/get-comments.output-model"
import { LikeStatus } from "../utils/constants"
import { BannedBlogUsersDocument } from "src/infrastructure/schemas/banned-blog-users.schema"
import { Types } from "mongoose"
import { PostsComments, PostsCommentsDocument } from "src/infrastructure/schemas/posts-comments.schema"
// import { Posts } from "src/schemas/posts.schema"


export const dtoManager = {
  // ↓↓↓ BLOGS
  changeBlogView(data: any) {
    return {
      id: data._id.toString(),
      name: data.name,
      description: data.description,
      websiteUrl: data.websiteUrl,
      createdAt: data.createdAt,
      isMembership: false,
    }
  },

  createBlogView(blog: any) {
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
  changeSABlogsView(data: any[]) {
    return data.map(i => {
      return {
        id: i._id.toString(),
        name: i.name,
        description: i.description,
        websiteUrl: i.websiteUrl,
        createdAt: i.createdAt,
        isMembership: false,
        blogOwnerInfo: i.blogOwnerInfo,
        banInfo: i.banInfo
      }
    })
  },
  createBannedBlogUsersView(bannedUsers: BannedBlogUsersDocument[]) {
    return bannedUsers.map(bannedUsers => {
      return {
        id: bannedUsers.userId,
        login: bannedUsers.login,
        banInfo: {
          isBanned: true,
          banDate: bannedUsers.banDate,
          banReason: bannedUsers.banReason,
        }
      }
    })

  },




  //  ↓↓↓ POSTS
  changePostView(post: PostsDocument, myStatus: string) {
    const newestLikes = (post: PostsDocument) => post.extendedLikesInfo.newestLikes
      .slice(-3)
      .map(like => {
        return {
          addedAt: like.addedAt,
          userId: like.userId,
          login: like.login
        }
      })
      .reverse()

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

  changePostsView(posts: PostsDocument[], userId?: string) {
    const myStatus = (post: PostsDocument) => post.extendedLikesInfo.like.find(like => like.userId === userId)?.status
      || LikeStatus.None
    const newestLikes = (post: PostsDocument) => post.extendedLikesInfo.newestLikes
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

  changePostsCommentsView(postsCommentsDocuments: PostsCommentsDocument[], userId: string) {

    const myStatusFunc = (comment: PostsCommentsDocument) => comment.likesInfo.likes.find(like => like.userId === userId)?.status || LikeStatus.None

    return postsCommentsDocuments.map(postsCommentsDocument => {
      return {
        id: postsCommentsDocument._id.toString(),
        content: postsCommentsDocument.content,
        commentatorInfo: postsCommentsDocument.commentatorInfo,
        createdAt: postsCommentsDocument.createdAt,
        likesInfo: {
          likesCount: postsCommentsDocument.likesInfo.likesCount,
          dislikesCount: postsCommentsDocument.likesInfo.dislikesCount,
          myStatus: myStatusFunc(postsCommentsDocument),
        },
        postInfo: postsCommentsDocument.postInfo
      }
    })
  },



  // ↓↓↓ COMMENTS
  changeCommentView(data: CommentsDocument, myStatus: string): GetCommentsOutputModel {
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

  changeCommentsView(comments: CommentsDocument[], userId?: string): GetCommentsOutputModel[] {
    // Looking for a myStatus of Like in each comment
    const myStatusFunc = (comment: CommentsDocument) => comment.likesInfo.likes.find(like => like.userId === userId)?.status || LikeStatus.None

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



  // ↓↓↓ USERS
  createUserView(data: UsersDocument) {
    return {
      id: data._id.toString(),
      login: data.accountData.login,
      email: data.accountData.email,
      createdAt: data.accountData.createdAt,
    }
  },

  changeUserView(data: UsersDocument) {
    return {
      userId: data._id.toString(),
      login: data.accountData.login,
      email: data.accountData.email,
    }
  },

  changeUsersView(data: UsersDocument[]) {
    return data.map(i => {
      return {
        id: i._id.toString(),
        login: i.accountData.login,
        email: i.accountData.email,
        createdAt: i.accountData.createdAt,
        banInfo: {
          banDate: i.accountData.banInfo.banDate,
          banReason: i.accountData.banInfo.banReason,
          isBanned: i.accountData.banInfo.isBanned,
        }
      }
    })
  },



  // ↓↓↓ DEVICES
  createDevicesView(data: Devices[]) {
    return data.map(i => {
      return {
        ip: i.ip,
        title: i.title,
        lastActiveDate: i.lastActiveDate,
        deviceId: i.deviceId,
      }
    })
  },


}

