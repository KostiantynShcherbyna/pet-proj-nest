// import { Posts, PostsModel } from "src/schemas/posts.schema"

import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Blogs, BlogsModel } from "../../application/entities/mongoose/blogs.schema"
import { Posts, PostsDocument, PostsModel } from "../../../posts/application/entites/mongoose/posts.schema"
import { Comments, CommentsModel } from "../../../comments/application/entities/mongoose/comments.schema"
import { BannedBlogUsers, BannedBlogUsersModel } from "../../application/entities/mongoose/banned-blog-users.schema"
import { PostsComments, PostsCommentsModel } from "../../../posts/application/entites/mongoose/posts-comments.schema"
import { BlogsSqlRepository } from "./blogs.sql.repository"
import { UsersRepository } from "../../../sa/repository/mongoose/users.repository"
import {
  BlogsOutputModel,
  CreateBloggerBlogOutputModel
} from "../../../blogger/api/models/output/create-blogger-blog.output-model"
import { dtoManager } from "../../../../infrastructure/adapters/output-model.adapter"
import { GetBlogsQueryInputModel } from "../../api/models/input/get-blogs.query.input-model"
import {
  BanStatus,
  LikeStatus,
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT, SEARCH_EMAIL_TERM_DEFAULT, SEARCH_LOGIN_TERM_DEFAULT,
  SEARCH_NAME_TERM_DEFAULT, SORT_BY_DEFAULT, SORT_BY_DEFAULT_SQL, SortDirection
} from "../../../../infrastructure/utils/constants"
import { GetPostsCommentsQueryInputModel } from "../../api/models/input/get-posts-comments.query.input-model"
import { Contract } from "../../../../infrastructure/utils/contract"
import { BannedBlogUsersView } from "../../../blogger/api/models/output/get-banned-blog-users.output-model"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import { Types } from "mongoose"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { GetPostsQueryInputModel } from "../../../posts/api/models/input/get-posts.query.input-model"
import { PostsView } from "../../../blogger/api/models/output/create-blogger-post.output-model"
import { UsersSqlRepository } from "../../../sa/repository/sql/users.sql.repository"

@Injectable()
export class BlogsSqlQueryRepository {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    @InjectModel(BannedBlogUsers.name) protected BannedBlogUsersModel: BannedBlogUsersModel,
    @InjectModel(PostsComments.name) protected PostsCommentsModel: PostsCommentsModel,
    protected blogsRepository: BlogsSqlRepository,
    protected usersRepository: UsersRepository,
    @InjectDataSource() protected dataSource: DataSource,
    protected blogsSqlRepository: BlogsSqlRepository,
    protected usersSqlRepository: UsersSqlRepository,
  ) {
  }

  async findBlog(blogId: string) {
    const foundBlogResult = await this.dataSource.query(`
    select "BlogId" as "id", "UserId" as "userId", "UserLogin" as "userLogin", "Name" as "name", "Description" as "description", "WebsiteUrl" as "websiteUrl",
           "CreatedAt" as "createdAt", "IsMembership" as "isMembership"
    from blogs."Blogs"
    where "BlogId" = $1
    `, [blogId])
    return foundBlogResult.length ? foundBlogResult[0] : null
  }


  async findBlogPosts(queryPost: GetPostsQueryInputModel, blogId: string, userId?: string): Promise<Contract<null | PostsView>> {

    const blog = await this.blogsSqlRepository.findBlog(blogId)
    if (blog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (blog.isBanned === true) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)

    const pageSize = +queryPost.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +queryPost.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = queryPost.sortBy || SORT_BY_DEFAULT_SQL
    const sortDirection = queryPost.sortDirection || SortDirection.Desc
    const offset = (pageNumber - 1) * pageSize

    // const bannedUsers = await this.usersSqlRepository.findUsersByBan(true)
    // const bannedUserIds = bannedUsers.map(user => user.userId)

    const totalCount = await this.dataSource.query(`
    select count (*)
    from posts."Posts"
    where "BlogId" = $1
    `, [blogId])

    const pagesCount = Math.ceil(totalCount / pageSize)

    const queryForm = `
    select a."PostId" as "postId", "Title" as "title", "ShortDescription" as "shortDescription", "Content" as "content",
             "BlogName" as "blogName","BlogId" as "blogId", "CreatedAt" as "createdAt",
           b."LikesCount" as "likesCount", "DislikesCount" as "dislikesCount",
           c."Status" as "myStatus",
           d."AddedAt" as "addedAt", "UserId" as "userId", "Login" as "login"
    from posts."Posts" a
    left join posts."ExtendedLikesInfo" b
    left join posts."Likes" c
    left join posts."NewestLikes" d
    where a."BlogId" = $1
    order by "${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE 'C'" : ""
    } ${sortDirection}
    limit $2
    offset $3
    `

    const foundPosts = await this.dataSource.query(queryForm, [
      blogId, // 1
      pageSize, // 2
      offset, // 3
    ])

    const mappedPosts = this.changePostsView(foundPosts, userId)

    const postsView = {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: mappedPosts
    }

    return new Contract(postsView, null)
  }


  async findBlogs(query: GetBlogsQueryInputModel, userId?: string): Promise<null | BlogsOutputModel> {

    const searchNameTerm = query.searchNameTerm || SEARCH_NAME_TERM_DEFAULT
    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortDirection = query.sortDirection === SortDirection.Asc
    const sortBy = query.sortBy || SORT_BY_DEFAULT_SQL
    const offset = (pageNumber - 1) * pageSize
      ? 1
      : -1

    const blogsTotalCount = await this.dataSource.query(`
    select count(*)
    from blogs."Blogs" a
    where a."UserId" = $1 OR $1 IS NULL
    and a."Name" ilike $2
    `, [userId, `%${searchNameTerm}%`])

    const pagesCount = Math.ceil(blogsTotalCount[0].count / pageSize)

    const queryForm = `
    select a."BlogId" as "id", "Name" as "name", "Description" as "description", "WebsiteUrl" as "websiteUrl",
             "CreatedAt" as "createdAt", "IsMembership" as "isMembership"
    from blogs."Blogs" a
    where a."UserId" = $1 OR $1 IS NULL
    and a."Name" ilike $2
    order by "${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE 'C'" : ""
    } ${sortDirection}
    limit $4
    offset $5
    `

    const blogs = await this.dataSource.query(
      queryForm, [
        userId, // 1
        `%${searchNameTerm}%`, // 2
        pageSize, // 4
        offset, // 5
      ])
    const mappedBlogs = this.changeBlogsView(blogs)

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(blogsTotalCount[0].count),
      items: mappedBlogs
    }
  }

  private changeBlogsView(blogs: any[]) {
    return blogs.map(blog => {
      return {
        id: blog.blogId.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
      }
    })

  }




  private changePostsView(posts: any[], userId?: string) {
    // const myStatus = (post: PostsDocument) => post.extendedLikesInfo.like.find(like => like.userId === userId)?.status
    //   || LikeStatus.None

    return posts.map(post => {
      return {
        id: post.postId,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: post.likesCount,
          dislikesCount: post.dislikesCount,
          myStatus: post.myStatus || LikeStatus.None,
          newestLikes: [],
        },
      }
    })
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