// import { Posts, PostsModel } from "src/schemas/posts.schema"

import { Injectable } from "@nestjs/common"
import { BlogsRepositoryOrm } from "./blogs.repository.orm"
import { BlogsOutputModel } from "../../../blogger/api/models/output/create-blogger-blog.output-model"
import { GetBlogsQueryInputModel } from "../../api/models/input/get-blogs.query.input-model"
import {
  LikeStatus,
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT, SEARCH_LOGIN_TERM_DEFAULT,
  SEARCH_NAME_TERM_DEFAULT,
  SORT_BY_DEFAULT_SQL,
  SortDirection, SortDirectionOrm
} from "../../../../infrastructure/utils/constants"
import { Contract } from "../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource, Repository } from "typeorm"
import { GetPostsQueryInputModel } from "../../../posts/api/models/input/get-posts.query.input-model"
import { PostsView } from "../../../blogger/api/models/output/create-blogger-post.output-model"
import { UsersRepositoryOrm } from "../../../sa/repository/typeorm/users.repository.orm"
import { BannedBlogUsersView } from "../../../blogger/api/models/output/get-banned-blog-users.output-model"
import { GetPostsCommentsQueryInputModel } from "../../api/models/input/get-posts-comments.query.input-model"
import { BannedBlogUsersDocument } from "../../application/entities/mongoose/banned-blog-users.schema"
import { BlogEntity } from "../../application/entities/sql/blog.entity"
import { PostEntity } from "../../../posts/application/entites/typeorm/post.entity"
import { BanBlogUserEntity } from "../../application/entities/sql/ban-blog-user.entity"
import { AccountEntity } from "../../../sa/application/entities/sql/account.entity"
import { BanInfoEntity } from "../../../sa/application/entities/sql/ban-info.entity"

@Injectable()
export class BlogsQueryRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected blogsSqlRepository: BlogsRepositoryOrm,
    // protected blogsSqlRepositoryOrm: Repository<BlogEntity>,
    protected usersSqlRepository: UsersRepositoryOrm,
  ) {
  }


  async findBlog(blogId: string) {
    const blog = await this.dataSource.createQueryBuilder(BlogEntity, "b")
      .select([
        `b.BlogId as "id"`,
        `b.Name as "name"`,
        `b.Description as "description"`,
        `b.WebsiteUrl as "websiteUrl"`,
        `b.CreatedAt as "createdAt"`,
        `b.IsMembership as "isMembership"`,
      ])
      .where("b.BlogId = :blogId", { blogId })
      .getRawOne()
    return blog ? blog : null
  }

  async findBlogs(query: GetBlogsQueryInputModel, userId?: string): Promise<null | BlogsOutputModel> {

    const searchNameTerm = query.searchNameTerm || SEARCH_NAME_TERM_DEFAULT
    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortDirection = query.sortDirection === SortDirection.Asc ? SortDirectionOrm.Asc : SortDirectionOrm.Desc
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const offset = (pageNumber - 1) * pageSize

    const [blogs, totalCount] = await this.dataSource.createQueryBuilder(BlogEntity, "a")
      .where(`a.Name ilike :name`, { name: `%${searchNameTerm}%` })
      .andWhere(`(a.UserId = :userId or a.UserId = :userId is Null)`, { userId })
      // .andWhere(`a.IsBanned = :isBanned`, { isBanned: false })
      .orderBy(`a."${sortBy}"`, sortDirection)
      .limit(pageSize)
      .offset(offset)
      .getManyAndCount()

    const mappedBlogs = this.changeBlogsView(blogs)
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount),
      items: mappedBlogs
    }
  }

  async findBlogPosts(queryPost: GetPostsQueryInputModel, blogId: string, userId?: string): Promise<Contract<null | PostsView>> {

    const blog = await this.blogsSqlRepository.findBlog(blogId)
    if (blog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    // if (blogs.isBanned === true) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)

    const pageSize = +queryPost.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +queryPost.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = queryPost.sortBy.charAt(0).toUpperCase() + queryPost.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const sortDirection = queryPost.sortDirection || SortDirection.Desc
    const offset = (pageNumber - 1) * pageSize

    // const bannedUsers = await this.usersSqlRepository.findUsersByBan(true)
    // const bannedUserIds = bannedUsers.map(user => user.userId)

    const totalCount = await this.dataSource.query(`
    select count (*)
    from public."post_entity"
    where "BlogId" = $1 
    `, [blogId])

    const pagesCount = Math.ceil(totalCount[0].count / pageSize)

    const queryForm = `
     select a."PostId" as "id", "Title" as "title", "ShortDescription" as "shortDescription", "Content" as "content",
              "BlogName" as "blogName", a."BlogId" as "blogId", a."CreatedAt" as "createdAt",
            (select "Status" from public."post_like_entity" where "PostId" = a."PostId" and "UserId" = $1) as "myStatus",
           (
             select count(*)
             from public."post_like_entity" e
             left join public."blog_entity" c on c."BlogId" = b."BlogId"
             left join public."ban_info_entity" d on d."UserId" = e."UserId"
             where e."Status" = 'Like'
             and c."BlogId" = $2
             and d."IsBanned" = 'false'
             and e."PostId" = a."PostId"
           ) as "likesCount", 
           (
            select count(*)
            from public."post_like_entity" e
            left join public."blog_entity" c on c."BlogId" = b."BlogId"
            left join public."ban_info_entity" d on d."UserId" = e."UserId"
            where e."Status" = 'Dislike'
            and c."BlogId" = $2
            and d."IsBanned" = 'false'
            and e."PostId" = a."PostId"
           ) as "dislikesCount"
    from public."post_entity" a
    left join public."blog_entity" b on b."BlogId" = a."BlogId" 
    where a."BlogId" = $2
    and b."IsBanned" = 'false'
    order by a."${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $3
    offset $4
    `

    const newestLikesQueryForm = `
    select a."UserId" as "userId", a."UserLogin" as "userLogin", a."AddedAt" as "addedAt", a."PostId" as "postId"
    from public."post_like_entity" a
    left join public."post_entity" b on b."PostId" = a."PostId"
    left join public."blog_entity" c on c."BlogId" = b."BlogId"
    where a."Status" = 'Like'
    and b."BlogId" = $1
    and c."IsBanned" = 'false'
    order by "AddedAt" ${sortDirection}
    `

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

  async findNewBlog(blogId: string) {
    const newBlog = await this.dataSource.createQueryBuilder(BlogEntity, "b")
      .select([
        `b.BlogId as "id"`,
        `b.Name as "name"`,
        `b.Description as "description"`,
        `b.WebsiteUrl as "websiteUrl"`,
        `b.CreatedAt as "createdAt"`,
        `b.IsMembership as "isMembership"`
      ])
      .where("b.BlogId = :blogId", { blogId })
      .getRawOne()
    return newBlog ? newBlog : null
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
    const sortDirection = query.sortDirection === SortDirection.Asc ? SortDirectionOrm.Asc : SortDirectionOrm.Desc
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const offset = (pageNumber - 1) * pageSize

    const banInfos = await this.dataSource.createQueryBuilder(BanBlogUserEntity, "b")
      .select([
        `b.IsBanned as "isBanned"`,
        `b.BanDate as "banDate"`,
        `b.BanReason as "banReason"`,
        `b.UserId as "id"`,
        `a.Login as "login"`
      ])
      .leftJoin(AccountEntity, "a", `a.UserId = b.UserId`, { login: `%${searchLoginTerm}%` })
      .where(`b.BlogId = :blogId`, { blogId })
      .andWhere(`b.IsBanned = :isBanned`, { isBanned })
      .orderBy(`a."${sortBy}"`, sortDirection)
      .limit(pageSize)
      .offset(offset)
      .getRawMany()

    const banInfoViews = this.createBanInfoOfBlogViews(banInfos)
    const pagesCount = Math.ceil(1 / pageSize)

    return new Contract({
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(1),
      items: banInfoViews
    }, null)
  }

  async findBlogsSA(query: GetBlogsQueryInputModel): Promise<null | BlogsOutputModel> {

    const searchNameTerm = query.searchNameTerm || SEARCH_NAME_TERM_DEFAULT
    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortDirection = query.sortDirection === SortDirection.Asc ? SortDirectionOrm.Asc : SortDirectionOrm.Desc
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const offset = (pageNumber - 1) * pageSize

    const [blogs, totalCount] = await this.dataSource.createQueryBuilder(BlogEntity, "b")
      .where(`b.Name ilike :name`, { name: `%${searchNameTerm}%` })
      .orderBy(`b.${sortBy}`, sortDirection)
      .limit(pageSize)
      .offset(offset)
      .getManyAndCount()

    const blogsView = this.changeBlogsSAView(blogs)
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount),
      items: blogsView
    }
  }

  private changeBlogsView(blogs: BlogEntity[]) {
    return blogs.map(blog => {
      return {
        id: blog.BlogId,
        name: blog.Name,
        description: blog.Description,
        websiteUrl: blog.WebsiteUrl,
        createdAt: blog.CreatedAt,
        isMembership: blog.IsMembership,
      }
    })

  }

  private changeBlogsSAView(blogs: any[]) {
    return blogs.map(blog => {
      return {
        id: blog.BlogId,
        name: blog.Name,
        description: blog.Description,
        websiteUrl: blog.WebsiteUrl,
        createdAt: blog.CreatedAt,
        isMembership: blog.IsMembership,
        blogOwnerInfo: {
          userId: blog.UserId,
          userLogin: blog.UserLogin
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