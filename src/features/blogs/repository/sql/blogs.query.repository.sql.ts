// import { Posts, PostsModel } from "src/schemas/posts.schema"

import { Injectable } from "@nestjs/common"
import { BlogsRepositorySql } from "./blogs.repository.sql"
import { BlogsOutputModel } from "../../../blogger/api/models/output/create-blogger-blog.output-model"
import { GetBlogsQueryInputModel } from "../../api/models/input/get-blogs.query.input-model"
import {
  LikeStatus,
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT, SEARCH_LOGIN_TERM_DEFAULT,
  SEARCH_NAME_TERM_DEFAULT,
  SORT_BY_DEFAULT_SQL,
  SortDirection
} from "../../../../infrastructure/utils/constants"
import { Contract } from "../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { GetPostsQueryInputModel } from "../../../posts/api/models/input/get-posts.query.input-model"
import { PostsView } from "../../../blogger/api/models/output/create-blogger-post.output-model"
import { UsersRepositorySql } from "../../../sa/repository/sql/users.repository.sql"
import { BannedBlogUsersView } from "../../../blogger/api/models/output/get-banned-blog-users.output-model"
import { GetPostsCommentsQueryInputModel } from "../../api/models/input/get-posts-comments.query.input-model"
import { BannedBlogUsersDocument } from "../../application/entities/mongoose/banned-blog-users.schema"

@Injectable()
export class BlogsQueryRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected blogsSqlRepository: BlogsRepositorySql,
    protected usersSqlRepository: UsersRepositorySql,
  ) {
  }


  // async findBlogs(query: GetBlogsQueryInputModel, userId?: string): Promise<null | BlogsOutputModel> {
  //
  //   const searchNameTerm = query.searchNameTerm || SEARCH_NAME_TERM_DEFAULT
  //   const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
  //   const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
  //   const sortDirection = query.sortDirection || SortDirection.Desc
  //   const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
  //   const offset = (pageNumber - 1) * pageSize
  //
  //   const blogsTotalCount = await this.dataSource.query(`
  //   select count(*)
  //   from blogs."Blogs" a
  //   where a."Name" ilike $1
  //   and "IsBanned" = 'false'
  //   `, [`%${searchNameTerm}%`])
  //
  //   const pagesCount = Math.ceil(blogsTotalCount[0].count / pageSize)
  //
  //   const queryForm = `
  //   select a."BlogId" as "id", "Name" as "name", "Description" as "description", "WebsiteUrl" as "websiteUrl",
  //            "CreatedAt" as "createdAt", "IsMembership" as "isMembership"
  //   from blogs."Blogs" a
  //   where a."Name" ilike $1
  //   and "IsBanned" = 'false'
  //   order by "${sortBy}" ${
  //     sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
  //   } ${sortDirection}
  //   limit $2
  //   offset $3
  //   `
  //
  //   const blogs = await this.dataSource.query(
  //     queryForm, [
  //       `%${searchNameTerm}%`, // 1
  //       pageSize, // 2
  //       offset, // 3
  //     ])
  //   const mappedBlogs = this.changeBlogsView(blogs)
  //
  //   return {
  //     pagesCount: pagesCount,
  //     page: pageNumber,
  //     pageSize: pageSize,
  //     totalCount: Number(blogsTotalCount[0].count),
  //     items: mappedBlogs
  //   }
  // }


  async findBlogs(query: GetBlogsQueryInputModel, userId?: string): Promise<null | BlogsOutputModel> {

    const searchNameTerm = query.searchNameTerm || SEARCH_NAME_TERM_DEFAULT
    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortDirection = query.sortDirection || SortDirection.Desc
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const offset = (pageNumber - 1) * pageSize

    const blogsTotalCount = await this.dataSource.query(`
    select count(*)
    from blogs."Blogs" a
    where a."Name" ilike $1
    and (a."UserId" = $2 or $2 is Null)
    `, [`%${searchNameTerm}%`, userId])

    const pagesCount = Math.ceil(blogsTotalCount[0].count / pageSize)

    const queryForm = `
    select a."BlogId" as "id", "Name" as "name", "Description" as "description", "WebsiteUrl" as "websiteUrl",
             "CreatedAt" as "createdAt", "IsMembership" as "isMembership"
    from blogs."Blogs" a
    where a."Name" ilike $1
    and (a."UserId" = $2 or $2 is Null)
    order by "${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $3
    offset $4
    `

    const blogs = await this.dataSource.query(
      queryForm, [
        `%${searchNameTerm}%`, // 1
        userId, // 2
        pageSize, // 3
        offset, // 4
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

    const pagesCount = Math.ceil(totalCount[0].count / pageSize)

    const queryForm = `
     select a."PostId" as "id", "Title" as "title", "ShortDescription" as "shortDescription", "Content" as "content",
              "BlogName" as "blogName", a."BlogId" as "blogId", a."CreatedAt" as "createdAt",
            (select "Status" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $1) as "myStatus",
           (
             select count(*)
             from posts."Likes" e
             left join blogs."Blogs" c on c."BlogId" = b."BlogId"
             left join users."BanInfo" d on d."UserId" = e."UserId"
             where e."Status" = 'Like'
             and c."BlogId" = $2
             and d."IsBanned" = 'false'
             and e."PostId" = a."PostId"
           ) as "likesCount", 
           (
            select count(*)
            from posts."Likes" e
            left join blogs."Blogs" c on c."BlogId" = b."BlogId"
            left join users."BanInfo" d on d."UserId" = e."UserId"
            where e."Status" = 'Dislike'
            and c."BlogId" = $2
            and d."IsBanned" = 'false'
            and e."PostId" = a."PostId"
           ) as "dislikesCount"
    from posts."Posts" a
    left join blogs."Blogs" b on b."BlogId" = a."BlogId" 
    where a."BlogId" = $2
    and b."IsBanned" = 'false'
    order by "${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $3
    offset $4
    `

    const newestLikesQueryForm = `
    select a."UserId" as "userId", a."UserLogin" as "userLogin", a."AddedAt" as "addedAt", a."PostId" as "postId"
    from posts."Likes" a
    left join posts."Posts" b on b."PostId" = a."PostId"
    left join blogs."Blogs" c on c."BlogId" = b."BlogId"
    where a."Status" = 'Like'
    and b."BlogId" = $1
    and c."IsBanned" = 'false'
    order by "AddedAt" ${sortDirection}
    `
    // const queryForm = `
    // select a."PostId" as "postId", "Title" as "title", "ShortDescription" as "shortDescription", "Content" as "content",
    //          "BlogName" as "blogName", "BlogId" as "blogId", "CreatedAt" as "createdAt",
    //        b."LikesCount" as "likesCount", "DislikesCount" as "dislikesCount",
    //        c."Status" as "myStatus",
    //        d."AddedAt" as "addedAt", d."UserId" as "userId", "Login" as "login"
    // from posts."Posts" a
    // left join posts."ExtendedLikesInfo" b on b."PostId" = a."PostId"
    // left join posts."Likes" c on c."PostId" = a."PostId"
    // left join posts."NewestLikes" d on d."PostId" = a."PostId"
    // where a."BlogId" = $1
    // order by "${sortBy}" ${
    //   sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    // } ${sortDirection}
    // limit $2
    // offset $3
    // `

    const foundPosts = await this.dataSource.query(queryForm, [
      userId, // 1
      blogId, // 2
      pageSize, // 3
      offset, // 4
    ])
    const foundNewestLikes = await this.dataSource.query(newestLikesQueryForm, [blogId])
    const mappedPosts = this.changePostsView(foundPosts, foundNewestLikes)

    const postsView = {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount[0].count),
      items: mappedPosts
    }

    return new Contract(postsView, null)
  }


  async findPublicBlog(blogId: string) {
    const foundBlogResult = await this.dataSource.query(`
    select "BlogId" as "id", "Name" as "name", "Description" as "description", "WebsiteUrl" as "websiteUrl",
           "CreatedAt" as "createdAt", "IsMembership" as "isMembership"
    from blogs."Blogs"
    where "BlogId" = $1
    and "IsBanned" = 'false'
    `, [blogId])
    return foundBlogResult.length ? foundBlogResult[0] : null
  }

  async findNewBlog(blogId: string) {
    const foundNewBlogResult = await this.dataSource.query(`
    select "BlogId" as "id", "Name" as "name", "Description" as "description", "WebsiteUrl" as "websiteUrl",
           "CreatedAt" as "createdAt", "IsMembership" as "isMembership"
    from blogs."Blogs"
    where "BlogId" = $1
    `, [blogId])
    return foundNewBlogResult.length ? foundNewBlogResult[0] : null
  }


  async findBanBlogUsers(blogId: string, isBanned: boolean, query: GetPostsCommentsQueryInputModel, userId: string): Promise<Contract<null | BannedBlogUsersView>> {

    const blog = await this.blogsSqlRepository.findBlog(blogId)
    if (blog === null)
      return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (blog.userId !== userId)
      return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    const searchLoginTerm = query.searchLoginTerm || SEARCH_LOGIN_TERM_DEFAULT
    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortDirection = query.sortDirection || SortDirection.Desc
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const offset = (pageNumber - 1) * pageSize

    const totalCount = await this.dataSource.query(`
    select count(*)
    from blogs."BanBlogUsers" a
    left join users."AccountData" b on b."UserId" = a."UserId"
    where a."BlogId" = $1
    and a."IsBanned" = $2
    and b."Login" ilike $3
    `, [blogId, isBanned, `%${searchLoginTerm}%`])

    const pagesCount = Math.ceil(totalCount[0].count / pageSize)

    const queryForm = `
    select a."IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason",
           b."Login" as "login", b."UserId" as "id"
    from blogs."BanBlogUsers" a
    left join users."AccountData" b on b."UserId" = a."UserId"
    where a."BlogId" = $1
    and a."IsBanned" = $2
    and b."Login" ilike $3
    order by "${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $4
    offset $5
    `

    const banInfos = await this.dataSource.query(
      queryForm, [
        blogId, // 1
        isBanned, // 2
        `%${searchLoginTerm}%`, // 3
        pageSize, // 4
        offset, // 5
      ])
    const banInfoViews = this.createBanInfoOfBlogViews(banInfos)
    ""
    return new Contract({
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount[0].count),
      items: banInfoViews
    }, null)
  }

  async findBlogsSA(query: GetBlogsQueryInputModel): Promise<null | BlogsOutputModel> {

    const searchNameTerm = query.searchNameTerm || SEARCH_NAME_TERM_DEFAULT
    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortDirection = query.sortDirection || SortDirection.Desc
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const offset = (pageNumber - 1) * pageSize

    const blogsTotalCount = await this.dataSource.query(`
    select count(*)
    from blogs."Blogs" a
    where a."Name" ilike $1
    `, [`%${searchNameTerm}%`])

    const pagesCount = Math.ceil(blogsTotalCount[0].count / pageSize)

    const queryForm = `
    select a."BlogId" as "id", "Name" as "name", "Description" as "description", "WebsiteUrl" as "websiteUrl",
             "CreatedAt" as "createdAt", "IsMembership" as "isMembership", "UserId" as "userId", "UserLogin" as "userLogin",
             "IsBanned" as "isBanned", "BanDate" as "banDate"
    from blogs."Blogs" a
    where a."Name" ilike $1
    order by "${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $2
    offset $3
    `

    const blogs = await this.dataSource.query(
      queryForm, [
        `%${searchNameTerm}%`, // 1
        pageSize, // 2
        offset, // 3
      ])
    const blogsView = this.changeBlogsSAView(blogs)

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(blogsTotalCount[0].count),
      items: blogsView
    }
  }


  private changeBlogsView(blogs: any[]) {
    return blogs.map(blog => {
      return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
      }
    })

  }

  private changeBlogsSAView(blogs: any[]) {
    return blogs.map(blog => {
      return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: false,
        blogOwnerInfo: {
          userId: blog.userId,
          userLogin: blog.userLogin
        },
        banInfo: {
          isBanned: blog.isBanned,
          banDate: blog.banDate
        }
      }
    })
  }


  private changePostsView(posts: any[], foundNewestLikes: any[]) {
    // const myStatus = (post: PostsDocument) => post.extendedLikesInfo.like.find(like => like.userId === userId)?.status
    //   || LikeStatus.None

    return posts.map(post => {
      const newestLikes = foundNewestLikes.filter(newestLike => newestLike.postId === post.id)
      const mappedNewestLikes = newestLikes.map(newestLike => {
        return {
          addedAt: newestLike.addedAt,
          userId: newestLike.userId,
          login: newestLike.userLogin
        }
      })
      return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: Number(post.likesCount),
          dislikesCount: Number(post.dislikesCount),
          myStatus: post.myStatus || LikeStatus.None,
          newestLikes: mappedNewestLikes.slice(0, 3),
        },
      }
    })
  }

  private createBanInfoOfBlogViews(banInfos: any[]) {
    return banInfos.map(banInfo => {
      return {
        id: banInfo.id,
        login: banInfo.login,
        banInfo: {
          isBanned: banInfo.isBanned,
          banDate: banInfo.banDate,
          banReason: banInfo.banReason,
        }
      }
    })

  }

}