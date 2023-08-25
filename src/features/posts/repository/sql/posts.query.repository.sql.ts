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
           (select "Status" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $3) as "myStatus",
           (select "UserId" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $3) as "userId",
           (select "UserLogin" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $3) as "userLogin"
    from posts."Posts" a
    left join blogs."Blogs" b on b."BlogId" = a."BlogId" 
    where a."BlogId" = $1
    and b."IsBanned" = 'false'
    order by "${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $2
    offset $3
    `

    const newestLikesQueryForm = `
    select  a."UserId" as "userId", a."UserLogin" as "userLogin", a."AddedAt" as "addedAt", a."PostId" as "postId"
    from posts."Likes" a
    left join posts."Posts" b on b."PostId" = a."PostId"
    left join blogs."Blogs" c on c."BlogId" = b."BlogId"
    where a."Status" = 'Like'
    and c."IsBanned" = 'false'
    order by a."AddedAt" ${sortDirection}
    limit $1
    `

    const foundPosts = await this.dataSource.query(queryForm, [
      blogId, // 1
      pageSize, // 2
      offset, // 3
    ])

    const foundNewestLikes = await this.dataSource.query(newestLikesQueryForm, [
      pageSize, // 1
    ])

    const mappedPosts = this.changePostsView(foundPosts, foundNewestLikes)

    const postsView = {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount[0].count),
      items: mappedPosts
    }

    return postsView
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
             "LikesCount" as "likesCount", "DislikesCount" as "dislikesCount",
           (select "Status" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $3) as "myStatus",
           (select "UserId" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $3) as "userId",
           (select "UserLogin" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $3) as "userLogin"
    from posts."Posts" a
    left join blogs."Blogs" b on b."BlogId" = a."BlogId" 
    where b."IsBanned" = 'false'
    order by "${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $1
    offset $2
    `
    const newestLikesQueryForm = `
    select  a."UserId" as "userId", a."UserLogin" as "userLogin", a."AddedAt" as "addedAt", a."PostId" as "postId"
    from posts."Likes" a
    left join posts."Posts" b on b."PostId" = a."PostId"
    left join blogs."Blogs" c on c."BlogId" = b."BlogId"
    where a."Status" = 'Like'
    and c."IsBanned" = 'false'
    order by a."AddedAt" ${sortDirection}
    limit $1
    `

    const foundPosts = await this.dataSource.query(queryForm, [
      pageSize, // 1
      offset, // 2
      userId // 3
    ])
    const foundNewestLikes = await this.dataSource.query(newestLikesQueryForm, [
      pageSize, // 1
    ])

    const mappedPosts = this.changePostsView(foundPosts, foundNewestLikes)

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

    const pageSize = 3
    // const sortBy = SORT_BY_DEFAULT_SQL
    const sortDirection = SortDirection.Desc

    const postQueryForm = `
    select a."PostId" as "postId", "Title" as "title", "ShortDescription" as "shortDescription", "Content" as "content",
             "BlogName" as "blogName", a."BlogId" as "blogId", a."CreatedAt" as "createdAt",
             "LikesCount" as "likesCount", "DislikesCount" as "dislikesCount",
           (select "Status" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $2) as "myStatus",
           (select "UserId" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $2) as "userId",
           (select "UserLogin" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $2) as "userLogin"
    from posts."Posts" a
    left join blogs."Blogs" b on b."BlogId" = a."BlogId" 
    where a."PostId" = $1
    and b."IsBanned" = 'false'
    `
    const newestLikesQueryForm = `
    select  a."UserId" as "userId", a."UserLogin" as "userLogin", a."AddedAt" as "addedAt"
    from posts."Likes" a
    left join posts."Posts" b on b."PostId" = a."PostId"
    left join blogs."Blogs" c on c."BlogId" = b."BlogId"
    where a."PostId" = $1
    and a."Status" = 'Like'
    and c."IsBanned" = 'false'
    order by a."AddedAt" ${sortDirection}
    limit $2
    `
    const foundPost = await this.dataSource.query(postQueryForm, [postId, userId])
    const newestLikes = await this.dataSource.query(newestLikesQueryForm, [postId, pageSize])
    return foundPost.length ? this.changePostView(foundPost[0], newestLikes) : null
  }

  private changePostsView(posts: any[], foundNewestLikes: any[]) {
    // const myStatus = (post: PostsDocument) => post.extendedLikesInfo.like.find(like => like.userId === userId)?.status
    //   || LikeStatus.None

    return posts.map(post => {
      const newestLikes = foundNewestLikes.filter(newestLike => newestLike.postId === post.postId)
      const mappedNewestLikes = newestLikes.map(newestLike => {
        return {
          addedAt: newestLike.addedAt,
          userId: newestLike.userId,
          login: newestLike.userLogin
        }
      })

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
          newestLikes: mappedNewestLikes,
        },
      }
    })
  }

  private changePostView(post: any, newestLikes: any[]) {
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
        newestLikes: newestLikes,
      },
    }
  }


}