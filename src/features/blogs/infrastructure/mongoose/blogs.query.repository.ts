// import { Posts, PostsModel } from "src/schemas/posts.schema"

import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Blogs, BlogsModel } from "../../../blogger/application/entities/mongoose/blogs.schema"
import { Posts, PostsModel } from "../../../blogger/application/entities/mongoose/posts.schema"
import { Comments, CommentsModel } from "../../../comments/application/entities/mongoose/comments.schema"
import { BannedBlogUsers, BannedBlogUsersModel } from "../../../blogger/application/entities/mongoose/banned-blog-users.schema"
import { PostsComments, PostsCommentsModel } from "../../../blogger/application/entities/mongoose/posts-comments.schema"
import { BlogsRepository } from "./blogs.repository"
import { UsersRepository } from "../../../super-admin/infrastructure/mongoose/users.repository"
import {
  BlogsOutputModel,
  CreateBloggerBlogOutputModel
} from "../../../blogger/api/models/output/create-blogger-blog.output-model"
import { dtoManager } from "../../../../infrastructure/adapters/output-model.adapter"
import { GetBlogsQueryInputModel } from "../../api/models/input/get-blogs.query.input-model"
import {
  LikeStatus,
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT, SEARCH_LOGIN_TERM_DEFAULT,
  SEARCH_NAME_TERM_DEFAULT, SORT_BY_DEFAULT, SortDirection
} from "../../../../infrastructure/utils/constants"
import { GetPostsCommentsQueryInputModel } from "../../api/models/input/get-posts-comments.query.input-model"
import { Contract } from "../../../../infrastructure/utils/contract"
import { BannedBlogUsersView } from "../../../blogger/api/models/output/get-banned-blog-users.output-model"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import { Types } from "mongoose"

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    @InjectModel(BannedBlogUsers.name) protected BannedBlogUsersModel: BannedBlogUsersModel,
    @InjectModel(PostsComments.name) protected PostsCommentsModel: PostsCommentsModel,
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
  ) {
  }

  async findBlog(id: string): Promise<null | CreateBloggerBlogOutputModel> {
    const foundBlog = await this.BlogsModel.findById(id)
    if (foundBlog === null) return null
    if (foundBlog.banInfo.isBanned === true) return null

    const foundBlogView = dtoManager.changeBlogView(foundBlog)
    return foundBlogView
  }


  async findBlogs(query: GetBlogsQueryInputModel, userId?: string): Promise<null | BlogsOutputModel> {

    const searchNameTerm = query.searchNameTerm || SEARCH_NAME_TERM_DEFAULT
    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy || SORT_BY_DEFAULT
    const sortDirection = query.sortDirection === SortDirection.Asc
      ? 1
      : -1


    const skippedBlogsCount = (pageNumber - 1) * pageSize


    const totalCount = userId
      ? await this.BlogsModel.countDocuments({
        $and: [
          { "blogOwnerInfo.userId": userId },
          { "banInfo.isBanned": { $ne: true } },
          { name: { $regex: searchNameTerm, $options: "ix" } },
        ]
      })

      : await this.BlogsModel.countDocuments({
        $and: [
          { "banInfo.isBanned": { $ne: true } },
          { name: { $regex: searchNameTerm, $options: "ix" } }
        ]
      })


    const pagesCount = Math.ceil(totalCount / pageSize)


    const requestedBlogs = userId
      ? await this.BlogsModel.find({
        $and: [
          { "blogOwnerInfo.userId": userId },
          { "banInfo.isBanned": { $ne: true } },
          { name: { $regex: searchNameTerm, $options: "ix" } },
        ]
      })
        .sort({ [sortBy]: sortDirection })
        .limit(pageSize)
        .skip(skippedBlogsCount)
        .lean()

      : await this.BlogsModel.find({
        $and: [
          { "banInfo.isBanned": { $ne: true } },
          { name: { $regex: searchNameTerm, $options: "ix" } }
        ]
      })
        .sort({ [sortBy]: sortDirection })
        .limit(pageSize)
        .skip(skippedBlogsCount)
        .lean()


    const mappedBlogs = dtoManager.changeBlogsView(requestedBlogs)


    const blogsView = {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: mappedBlogs
    }

    return blogsView
  }

  async findSABlogs(query: GetBlogsQueryInputModel): Promise<BlogsOutputModel> {

    const searchNameTerm = query.searchNameTerm || SEARCH_NAME_TERM_DEFAULT
    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy || SORT_BY_DEFAULT
    const sortDirection = query.sortDirection === SortDirection.Asc
      ? 1
      : -1

    const skippedBlogsCount = (pageNumber - 1) * pageSize

    const totalCount = await this.BlogsModel.countDocuments(
      {
        $or: [
          { name: { $regex: searchNameTerm, $options: "ix" } },
        ]
      }
    )

    const pagesCount = Math.ceil(totalCount / pageSize)

    const requestedBlogs = await this.BlogsModel.find(
      {
        $or: [
          { name: { $regex: searchNameTerm, $options: "ix" } },
        ]
      }
    )
      .sort({ [sortBy]: sortDirection })
      .limit(pageSize)
      .skip(skippedBlogsCount)
      .lean()

    const mappedBlogs = dtoManager.changeSABlogsView(requestedBlogs)


    const blogsView = {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: mappedBlogs
    }

    return blogsView
  }

  async findBannedBlogUsers(queryBlog: GetPostsCommentsQueryInputModel, blogId: string, ownerId: string): Promise<Contract<null | BannedBlogUsersView>> {

    const ownerBlog = await this.blogsRepository.findBlog(blogId)
    if (ownerBlog === null)
      return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (ownerBlog.blogOwnerInfo.userId !== ownerId)
      return new Contract(null, ErrorEnums.FOREIGN_BLOG)


    const searchLoginTerm = queryBlog.searchLoginTerm || SEARCH_LOGIN_TERM_DEFAULT
    const pageSize = +queryBlog.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +queryBlog.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = queryBlog.sortBy || SORT_BY_DEFAULT
    const sortDirection = queryBlog.sortDirection === SortDirection.Asc
      ? 1
      : -1

    const skippedUsersCount = (pageNumber - 1) * pageSize

    const totalCount = await this.BannedBlogUsersModel.countDocuments(
      {
        $and: [
          { blogId: blogId },
          { isBanned: true },
          { login: { $regex: searchLoginTerm, $options: "ix" } },
        ]
      }
    )

    const pagesCount = Math.ceil(totalCount / pageSize)

    const bannedBlogUsers = await this.BannedBlogUsersModel.find(
      {
        $and: [
          { blogId: blogId },
          { isBanned: true },
          { login: { $regex: searchLoginTerm, $options: "ix" } },
        ]
      }
    )
      .sort({ [sortBy]: sortDirection })
      .limit(pageSize)
      .skip(skippedUsersCount)
      .lean()

    const bannedBlogUsersView = dtoManager.createBannedBlogUsersView(bannedBlogUsers)

    return new Contract({
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: bannedBlogUsersView
    }, null)
  }


  async findPostsComments(queryPost: GetPostsCommentsQueryInputModel, ownerId: string) {

    const pageSize = +queryPost.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +queryPost.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = queryPost.sortBy || SORT_BY_DEFAULT
    const sortDirection = queryPost.sortDirection === SortDirection.Asc
      ? 1
      : -1
    const skippedCount = (pageNumber - 1) * pageSize

    const owner = await this.usersRepository.findUser(["_id", new Types.ObjectId(ownerId)])
    if (owner === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (owner.accountData.banInfo.isBanned === true)
      return new Contract(null, ErrorEnums.BLOG_IS_BANNED)

    const blogObjectIds = await this.BlogsModel
      .find(
        { "blogOwnerInfo.userId": new Types.ObjectId(ownerId) },
        { _id: 1 }
      )
      .lean()

    const blogIds = blogObjectIds.map(blogObjectId => blogObjectId._id.toString())


    const postCommentsTotalCount = await this.PostsCommentsModel
      .countDocuments(
        { "postInfo.blogId": { $in: blogIds } }
      )


    const postComments = await this.PostsCommentsModel
      .find(
        { "postInfo.blogId": { $in: blogIds } }
      )
      .sort({ [sortBy]: sortDirection })
      .limit(pageSize)
      .skip(skippedCount)
      .lean()

    const bannedUsers = await this.usersRepository.findBannedUsers()
    const bannedUserIds = bannedUsers.map(user => user._id.toString())

    // const bannedMeUsers = await this.bannedBlogUsersRepository.findBannedBlogUsers()
    // const bannedMeUserIds = bannedUsers.map(user => user._id.toString())

    const truePostsComments = postComments.map(postComment => {
      let likesCount: number = 0
      let dislikesCount: number = 0

      const trueLikes = postComment.likesInfo.likes.filter(like => {
        if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Like) likesCount++
        if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Dislike) dislikesCount++
        return !bannedUserIds.includes(like.userId)
      })

      const postCommentsCopy = { ...postComment }
      postCommentsCopy.likesInfo.likesCount -= likesCount
      postCommentsCopy.likesInfo.dislikesCount -= dislikesCount
      postCommentsCopy.likesInfo.likes = trueLikes

      return postCommentsCopy
    })

    const postsCommentsPagesCount = Math.ceil(postCommentsTotalCount / pageSize)

    const postsCommentsViews = dtoManager.changePostsCommentsView(truePostsComments, ownerId)

    return {
      pagesCount: postsCommentsPagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: postCommentsTotalCount,
      items: postsCommentsViews
    }


    // const postsComments = await this.postsCommentsRepository.findPostsComments(blogIds)


  }

  // async findPostsComments(queryPost: GetPostsQueryInputModel, ownerId: string) {

  //   const pageSize = +queryPost.pageSize || PAGE_SIZE_DEFAULT
  //   const pageNumber = +queryPost.pageNumber || PAGE_NUMBER_DEFAULT
  //   const sortBy = queryPost.sortBy || SORT_BY_DEFAULT
  //   const sortDirection = queryPost.sortDirection === SortDirection.Asc
  //     ? 1
  //     : -1
  //   const skippedCount = (pageNumber - 1) * pageSize


  //   const blogObjectIds = await this.BlogsModel
  //     .find({ "blogOwnerInfo.userId": new Types.ObjectId(ownerId) }, { _id: true })
  //     .limit(pageSize)
  //     .skip(skippedCount)
  //     .lean()
  //   const blogIds = blogObjectIds.map(blogObjectId => blogObjectId.toString())


  //   const bannedUsers = await this.usersRepository.findBannedUsers()
  //   const bannedUserIds = bannedUsers.map(user => user._id.toString())


  //   const allPosts = await this.PostsModel
  //     .find({ blogId: { $in: { blogIds } } })
  //     .limit(pageSize)
  //     .skip(skippedCount)
  //     .lean()

  //   const truePosts = allPosts.map(post => {
  //     let likesCount: number = 0
  //     let dislikesCount: number = 0

  //     const trueLikes = post.extendedLikesInfo.like.filter(like => {
  //       if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Like) likesCount++
  //       if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Dislike) dislikesCount++
  //       return !bannedUserIds.includes(like.userId)
  //     })

  //     const trueNewestLikes = post.extendedLikesInfo.newestLikes.filter(newestLike => !bannedUserIds.includes(newestLike.userId))

  //     const postCopy = { ...post }
  //     postCopy.extendedLikesInfo.likesCount -= likesCount
  //     postCopy.extendedLikesInfo.dislikesCount -= dislikesCount
  //     postCopy.extendedLikesInfo.like = trueLikes
  //     postCopy.extendedLikesInfo.newestLikes = trueNewestLikes

  //     return postCopy
  //   })

  //   const truePostIds = truePosts.map(truePost => truePost._id.toString())


  //   const commentsTotalCount = await this.CommentsModel
  //     .countDocuments({
  //       $and: [
  //         { postId: { $in: { truePostIds } } },
  //         { "commentatorInfo.userId": { $nin: bannedUserIds } }
  //       ]
  //     })


  //   const comments = await this.CommentsModel
  //     .find({
  //       $and: [
  //         { postId: { $in: { truePostIds } } },
  //         { "commentatorInfo.userId": { $nin: bannedUserIds } }
  //       ]
  //     })
  //     .sort({ [sortBy]: sortDirection })
  //     .limit(pageSize)
  //     .skip(skippedCount)
  //     .lean()

  //   const trueComments = comments.map(comment => {
  //     let likesCount: number = 0
  //     let dislikesCount: number = 0

  //     const trueLikes = comment.likesInfo.like.filter(like => {
  //       if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Like) likesCount++
  //       if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Dislike) dislikesCount++
  //       return !bannedUserIds.includes(like.userId)
  //     })

  //     const commentCopy = new this.CommentsModel(comment)
  //     commentCopy.likesInfo.likesCount -= likesCount
  //     commentCopy.likesInfo.dislikesCount -= dislikesCount
  //     commentCopy.likesInfo.like = trueLikes

  //     return commentCopy
  //   })

  //   const commentsPagesCount = Math.ceil(commentsTotalCount / pageSize)

  // const mappedPosts = dtoManager.changePostsCommentsView(truePosts, trueComments, ownerId)

  //   const postsCommentsView = {
  //     pagesCount: commentsPagesCount,
  //     page: pageNumber,
  //     pageSize: pageSize,
  //     totalCount: commentsTotalCount,
  //     items: mappedPosts
  //   }

  //   return new Contract(postsCommentsView, null)
  // }


  // async findBannedUsersOfBlog(props: any) {

  //   const searchLoginTerm = props.searchLoginTerm || SEARCH_LOGIN_TERM_DEFAULT
  //   const pageSize = +props.pageSize || PAGE_SIZE_DEFAULT
  //   const pageNumber = +props.pageNumber || PAGE_NUMBER_DEFAULT
  //   const sortBy = props.sortBy || SORT_BY_DEFAULT
  //   const sortDirection = props.sortDirection === SortDirection.Asc
  //     ? 1
  //     : -1

  //   const skippedBannedUsersCount = (pageNumber - 1) * pageSize

  //   const totalCountBannedUsers = await this.BlogsModel.countDocuments(
  //     {
  //       $and: [
  //         { bannedUsers: { $elemMatch: { isBanned: true } } },
  //         { bannedUsers: { $elemMatch: { login: { $regex: searchLoginTerm, $options: 'ix' } } } },
  //       ]
  //     }
  //   )

  //   const pagesCount = Math.ceil(totalCountBannedUsers / pageSize)

  //   const bannedUsers = await this.BlogsModel.find(
  //     {
  //       $and: [
  //         { bannedUsers: { $elemMatch: { isBanned: true } } },
  //         { bannedUsers: { $elemMatch: { login: { $regex: searchLoginTerm, $options: 'ix' } } } },
  //       ]
  //     }
  //   )
  //     .sort({ [sortBy]: sortDirection })
  //     .limit(pageSize)
  //     .skip(skippedBannedUsersCount)
  //     .lean()

  //   const mappedUsers = dtoManager.createBannedBlogUsersView(bannedUsers)

  //   return {
  //     pagesCount: pagesCount,
  //     page: pageNumber,
  //     pageSize: pageSize,
  //     totalCount: totalCountBannedUsers,
  //     items: mappedUsers
  //   }
  // }
  // async findBannedUsersOfBlog(props: any) {

  //   const searchLoginTerm = props.searchLoginTerm || SEARCH_LOGIN_TERM_DEFAULT
  //   const pageSize = +props.pageSize || PAGE_SIZE_DEFAULT
  //   const pageNumber = +props.pageNumber || PAGE_NUMBER_DEFAULT
  //   const sortBy = props.sortBy || SORT_BY_DEFAULT
  //   const sortDirection = props.sortDirection === SortDirection.Asc
  //     ? 1
  //     : -1

  //   const skippedUsersCount = (pageNumber - 1) * pageSize

  //   const totalCount = await this.BannedBlogUsers.countDocuments(
  //     {
  //       $and: [
  //         { blogId: props.blogId },
  //         { login: { $regex: searchLoginTerm, $options: 'ix' } },
  //       ]
  //     }
  //   )

  //   const pagesCount = Math.ceil(totalCount / pageSize)

  //   const requestedUsers = await this.BlogsModel.find(
  //     {
  //       $and: [
  //         { blogId: props.blogId },
  //         { login: { $regex: searchLoginTerm, $options: 'ix' } },
  //       ]
  //     }
  //   )
  //     .sort({ [sortBy]: sortDirection })
  //     .limit(pageSize)
  //     .skip(skippedUsersCount)
  //     .lean()

  //   const mappedUsers = dtoManager.createBannedBlogUsersView(requestedUsers)

  //   return {
  //     pagesCount: pagesCount,
  //     page: pageNumber,
  //     pageSize: pageSize,
  //     totalCount: totalCount,
  //     items: mappedUsers
  //   }
  // }

}