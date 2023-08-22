import { Injectable } from "@nestjs/common"
import { Contract } from "../../../../infrastructure/utils/contract"
import {
  CreateBloggerPostOutputModel,
  PostsView
} from "../../../blogger/api/models/output/create-blogger-post.output-model"
import { GetPostsQueryInputModel } from "../../api/models/input/get-posts.query.input-model"
import {
  LikeStatus,
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
  SORT_BY_DEFAULT_SQL,
  SortDirection
} from "../../../../infrastructure/utils/constants"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"


@Injectable()
export class PostsQueryRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
  ) {
  }


  async findPosts(queryPost: GetPostsQueryInputModel, userId?: string): Promise<null | PostsView> {

    const pageSize = +queryPost.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +queryPost.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = queryPost.sortBy || SORT_BY_DEFAULT_SQL
    const sortDirection = queryPost.sortDirection || SortDirection.Desc
    const offset = (pageNumber - 1) * pageSize

    const totalCount = await this.dataSource.query(`
    select count (*)
    from posts."Posts" a
    left join blogs."Blogs" b on b."BlogId" = a."BlogId" 
    where b."IsBanned" = 'false'
    `)

    const pagesCount = Math.ceil(totalCount[0].count / pageSize)

    const queryForm = `
    select a."PostId" as "postId", "Title" as "title", "ShortDescription" as "shortDescription", "Content" as "content",
             "BlogName" as "blogName", a."BlogId" as "blogId", a."CreatedAt" as "createdAt",
           b."LikesCount" as "likesCount", "DislikesCount" as "dislikesCount",
           c."Status" as "myStatus",
           d."AddedAt" as "addedAt", "Login" as "login"
    from posts."Posts" a
    left join posts."ExtendedLikesInfo" b on b."PostId" = a."PostId"
    left join posts."Likes" c on c."PostId" = a."PostId"
    left join posts."NewestLikes" d on d."PostId" = a."PostId"
    left join blogs."Blogs" e on e."BlogId" = a."BlogId" 
    where e."IsBanned" = 'false'
    order by "${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $1
    offset $2
    `

    const foundPosts = await this.dataSource.query(queryForm, [
      pageSize, // 1
      offset, // 2
    ])

    const mappedPosts = this.changePostsView(foundPosts, userId)

    const postsView = {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount[0].count),
      items: mappedPosts
    }

    return postsView
  }

  async findPostsOfBlog(blogId: string, queryPost: GetPostsQueryInputModel, userId?: string): Promise<null | PostsView> {

    const pageSize = +queryPost.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +queryPost.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = queryPost.sortBy || SORT_BY_DEFAULT_SQL
    const sortDirection = queryPost.sortDirection || SortDirection.Desc
    const offset = (pageNumber - 1) * pageSize

    const totalCount = await this.dataSource.query(`
    select count (*)
    from posts."Posts"
    `)

    const pagesCount = Math.ceil(totalCount[0].count / pageSize)

    const queryForm = `
    select a."PostId" as "postId", "Title" as "title", "ShortDescription" as "shortDescription", "Content" as "content",
             "BlogName" as "blogName","BlogId" as "blogId", "CreatedAt" as "createdAt",
           b."LikesCount" as "likesCount", "DislikesCount" as "dislikesCount",
           c."Status" as "myStatus",
           d."AddedAt" as "addedAt", "Login" as "login"
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
      totalCount: Number(totalCount[0].count),
      items: mappedPosts
    }

    return postsView
  }


  async findPost(postId: string, userId?: string): Promise<null | CreateBloggerPostOutputModel> {

    const queryForm = `
    select a."PostId" as "postId", "Title" as "title", "ShortDescription" as "shortDescription", "Content" as "content",
             "BlogName" as "blogName", a."BlogId" as "blogId", a."CreatedAt" as "createdAt"
    from posts."Posts" a
    left join blogs."Blogs" b on b."BlogId" = a."BlogId" 
    where a."PostId" = $1
    and b."IsBanned" = 'false'
    `
    const foundPost = await this.dataSource.query(queryForm, [postId])
    return foundPost.length ? this.changePostView(foundPost[0]) : null
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
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [],
        },
      }
    })
  }

  private changePostView(post: any) {
    return {
      id: post.postId,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    }
  }


}