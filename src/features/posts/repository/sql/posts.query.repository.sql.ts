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
           (select "Status" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $3) as "myStatus",
           (select "UserId" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $3) as "userId",
           (select "UserLogin" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $3) as "userLogin",
           (
            select count(*)
            from posts."Likes" u
            left join users."BanInfo" d on d."UserId" = u."UserId"
            where u."Status" = 'Like'
            and d."IsBanned" = 'false'
            and a."PostId" = u."PostId"
           ) as "likesCount", 
           (
            select count(*)
            from posts."Likes" u
            left join users."BanInfo" d on d."UserId" = u."UserId"
            where u."Status" = 'Dislike'
            and d."IsBanned" = 'false'
            and a."PostId" = u."PostId"
           ) as "dislikesCount"
    from posts."Posts" a
    left join blogs."Blogs" b on b."BlogId" = a."BlogId" 
    where b."IsBanned" = 'false'
    order by "${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $1
    offset $2
    `


    // const queryForm = `
    // select a."PostId" as "postId", "Title" as "title", "ShortDescription" as "shortDescription", "Content" as "content",
    //          "BlogName" as "blogName", a."BlogId" as "blogId", a."CreatedAt" as "createdAt",
    //        (select "Status" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $3) as "myStatus",
    //        (select "UserId" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $3) as "userId",
    //        (select "UserLogin" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $3) as "userLogin",
    //        (
    //         select count(*)
    //         from posts."Likes" a
    //         left join posts."Posts" b on b."PostId" = a."PostId"
    //         left join users."BanInfo" d on d."UserId" = a."UserId"
    //         where a."Status" = 'Like'
    //         and d."IsBanned" = 'false'
    //        ) as "likesCount",
    //        (
    //         select count(*)
    //         from posts."Likes" a
    //         left join posts."Posts" b on b."PostId" = a."PostId"
    //         left join users."BanInfo" d on d."UserId" = a."UserId"
    //         where a."Status" = 'Dislike'
    //         and d."IsBanned" = 'false'
    //        ) as "dislikesCount"
    // from posts."Posts" a
    // left join blogs."Blogs" b on b."BlogId" = a."BlogId"
    // where b."IsBanned" = 'false'
    // order by "${sortBy}" ${
    //   sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    // } ${sortDirection}
    // limit $1
    // offset $2
    // `
    const newestLikesQueryForm = `
    select  a."UserId" as "userId", a."UserLogin" as "userLogin", a."AddedAt" as "addedAt", a."PostId" as "postId"
    from posts."Likes" a
    left join users."BanInfo" c on c."UserId" = a."UserId"
    where a."Status" = 'Like'
    and c."IsBanned" = 'false'
    order by "AddedAt" ${sortDirection}
    `
    // const newestLikesQueryForm = `
    // select  a."UserId" as "userId", a."UserLogin" as "userLogin", a."AddedAt" as "addedAt", a."PostId" as "postId"
    // from posts."Likes" a
    // left join posts."Posts" b on b."PostId" = a."PostId"
    // left join blogs."Blogs" c on c."BlogId" = b."BlogId"
    // where a."Status" = 'Like'
    // and c."IsBanned" = 'false'
    // order by a."AddedAt" ${sortDirection}
    // limit $1
    // `

    const foundPosts = await this.dataSource.query(queryForm, [
      pageSize, // 1
      offset, // 2
      userId // 3
    ])
    const foundNewestLikes = await this.dataSource.query(newestLikesQueryForm)

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
           (select "Status" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $2) as "myStatus",
           (select "UserId" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $2) as "userId",
           (select "UserLogin" from posts."Likes" where "PostId" = a."PostId" and "UserId" = $2) as "userLogin",
           (
           select count(*)
           from posts."Likes" a
           left join users."BanInfo" b on b."UserId" = a."UserId"
           where "PostId" = $1
           and "Status" = 'Like'
           and b."IsBanned" = 'false'
           ) as "likesCount", 
           (
           select count(*)
           from posts."Likes" a
           left join users."BanInfo" b on b."UserId" = a."UserId"
           where "PostId" = $1
           and "Status" = 'Dislike'
           and b."IsBanned" = 'false'
           ) as "dislikesCount"
    from posts."Posts" a
    left join blogs."Blogs" b on b."BlogId" = a."BlogId" 
    where a."PostId" = $1
    and b."IsBanned" = 'false'
    `
    const newestLikesQueryForm = `
    select a."UserId" as "userId", a."UserLogin" as "login", a."AddedAt" as "addedAt"
    from posts."Likes" a
    left join users."BanInfo" b on b."UserId" = a."UserId"
    where a."PostId" = $1
    and a."Status" = 'Like'
    and b."IsBanned" = 'false'
    order by a."AddedAt" ${sortDirection}
    limit $2
    `
    // const newestLikesQueryForm = `
    // select  a."UserId" as "userId", a."UserLogin" as "login", a."AddedAt" as "addedAt"
    // from posts."Likes" a
    // left join posts."Posts" b on b."PostId" = a."PostId"
    // left join blogs."Blog" c on c."BlogId" = b."BlogId"
    // where a."PostId" = $1
    // and a."Status" = 'Like'
    // and c."IsBanned" = 'false'
    // order by a."AddedAt" ${sortDirection}
    // limit $2
    // `
    const foundPost = await this.dataSource.query(postQueryForm, [postId, userId])
    const newestLikes = await this.dataSource.query(newestLikesQueryForm, [postId, 3])
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
          likesCount: Number(post.likesCount),
          dislikesCount: Number(post.dislikesCount),
          myStatus: post.myStatus || LikeStatus.None,
          newestLikes: mappedNewestLikes.slice(0, 3),
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
        likesCount: Number(post.likesCount),
        dislikesCount: Number(post.dislikesCount),
        myStatus: post.myStatus || LikeStatus.None,
        newestLikes: newestLikes,
      },
    }
  }


}