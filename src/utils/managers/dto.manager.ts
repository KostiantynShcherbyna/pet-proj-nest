import { BlogsDocument } from "src/schemas/blogs.schema"
import { CommentsDocument } from "src/schemas/comments.schema"
import { Devices } from "src/schemas/devices.schema"
import { PostsDocument } from "src/schemas/posts.schema"
import { UsersDocument } from "src/schemas/users.schema"
import { CommentView } from "src/views/comment.view"
import { LikeStatus } from "../constants/constants"
// import { Posts } from "src/schemas/posts.schema"


export const dtoManager = {
  // ↓↓↓ BLOGS
  changeBlogView(data: BlogsDocument) {
    return {
      id: data._id.toString(),
      name: data.name,
      description: data.description,
      websiteUrl: data.websiteUrl,
      createdAt: data.createdAt,
      isMembership: false,
    }
  },

  createBlogView(blog: BlogsDocument) {
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
  changeSABlogsView(data: BlogsDocument[]) {
    return data.map(i => {
      return {
        id: i._id.toString(),
        name: i.name,
        description: i.description,
        websiteUrl: i.websiteUrl,
        createdAt: i.createdAt,
        isMembership: false,
        blogOwnerInfo: {
          userId: i.blogOwnerInfo.userId,
          userLogin: i.blogOwnerInfo.userLogin,
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



  // ↓↓↓ COMMENTS
  changeCommentView(data: CommentsDocument, myStatus: string): CommentView {
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

  changeCommentsView(comments: CommentsDocument[], userId?: string): CommentView[] {
    // Looking for a myStatus of Like in each comment
    const myStatusFunc = (comment: CommentsDocument) => comment.likesInfo.like.find(like => like.userId === userId)?.status || LikeStatus.None

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
          isBanned: i.accountData.banInfo.isBanned,
          banDate: i.accountData.banInfo.banDate,
          banReason: i.accountData.banInfo.banReason,
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

