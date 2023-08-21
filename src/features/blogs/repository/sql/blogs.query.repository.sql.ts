// import { Posts, PostsModel } from "src/schemas/posts.schema"

import { Injectable } from "@nestjs/common"
import { BlogsRepositorySql } from "./blogs.repository.sql"
import { BlogsOutputModel } from "../../../blogger/api/models/output/create-blogger-blog.output-model"
import { GetBlogsQueryInputModel } from "../../api/models/input/get-blogs.query.input-model"
import {
  LikeStatus,
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
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

@Injectable()
export class BlogsQueryRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected blogsSqlRepository: BlogsRepositorySql,
    protected usersSqlRepository: UsersRepositorySql,
  ) {
  }

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
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $3
    offset $4
    `

    const blogs = await this.dataSource.query(
      queryForm, [
        userId, // 1
        `%${searchNameTerm}%`, // 2
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

    const pagesCount = Math.ceil(totalCount / pageSize)

    const queryForm = `
    select a."PostId" as "postId", "Title" as "title", "ShortDescription" as "shortDescription", "Content" as "content",
             "BlogName" as "blogName", "BlogId" as "blogId", "CreatedAt" as "createdAt",
           b."LikesCount" as "likesCount", "DislikesCount" as "dislikesCount",
           c."Status" as "myStatus",
           d."AddedAt" as "addedAt", "UserId" as "userId", "Login" as "login"
    from posts."Posts" a
    left join posts."ExtendedLikesInfo" b on b."PostId" = a."PostId"
    left join posts."Likes" c on c."PostId" = a."PostId"
    left join posts."NewestLikes" d on d."PostId" = a."PostId"
    where a."BlogId" = $1
    order by "${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
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


  async findBlog(blogId: string) {
    const foundBlogResult = await this.dataSource.query(`
    select "BlogId" as "id", "UserId" as "userId", "UserLogin" as "userLogin", "Name" as "name", "Description" as "description", "WebsiteUrl" as "websiteUrl",
           "CreatedAt" as "createdAt", "IsMembership" as "isMembership"
    from blogs."Blogs"
    where "BlogId" = $1
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

}