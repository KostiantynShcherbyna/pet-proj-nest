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
  SortDirection, SortDirectionOrm
} from "../../../../infrastructure/utils/constants"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { PostEntity } from "../../application/entites/sql/post.entity"
import { BlogEntity } from "../../../blogs/application/entities/sql/blog.entity"
import { PostLikeEntity } from "../../application/entites/sql/post-like.entity"
import { BanInfoEntity } from "../../../sa/application/entities/sql/ban-info.entity"


@Injectable()
export class PostsQueryRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
  ) {
  }

  async findPosts(queryPost: GetPostsQueryInputModel, userId?: string): Promise<null | PostsView> {

    const pageSize = +queryPost.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +queryPost.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = queryPost.sortBy.charAt(0).toUpperCase() + queryPost.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const sortDirection = queryPost.sortDirection || SortDirection.Desc
    const offset = (pageNumber - 1) * pageSize

    const totalCount = await this.dataSource.query(`
    select count (*)
    from public."post_entity" a
    left join public."blog_entity" b on b."BlogId" = a."BlogId" 
    where b."IsBanned" = 'false'
    `)

    const pagesCount = Math.ceil(totalCount[0].count / pageSize)

    const queryForm = `
        select a."PostId" as "postId", "Title" as "title", "ShortDescription" as "shortDescription", "Content" as "content",
             "BlogName" as "blogName", a."BlogId" as "blogId", a."CreatedAt" as "createdAt",
           (select "Status" from public."post_like_entity" where "PostId" = a."PostId" and "UserId" = $3) as "myStatus",
           (select "UserId" from public."post_like_entity" where "PostId" = a."PostId" and "UserId" = $3) as "userId",
           (select "UserLogin" from public."post_like_entity" where "PostId" = a."PostId" and "UserId" = $3) as "userLogin",
           (
            select count(*)
            from public."post_like_entity" u
            left join public."ban_info_entity" d on d."UserId" = u."UserId"
            where u."Status" = 'Like'
            and d."IsBanned" = 'false'
            and a."PostId" = u."PostId"
           ) as "likesCount", 
           (
            select count(*)
            from public."post_like_entity" u
            left join public."ban_info_entity" d on d."UserId" = u."UserId"
            where u."Status" = 'Dislike'
            and d."IsBanned" = 'false'
            and a."PostId" = u."PostId"
           ) as "dislikesCount"
    from public."post_entity" a
    left join public."blog_entity" b on b."BlogId" = a."BlogId" 
    where b."IsBanned" = 'false'
    order by a."${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $1
    offset $2
    `

    const newestLikesQueryForm = `
    select  a."UserId" as "userId", a."UserLogin" as "userLogin", a."AddedAt" as "addedAt", a."PostId" as "postId"
    from public."post_like_entity" a
    left join public."ban_info_entity" c on c."UserId" = a."UserId"
    where a."Status" = 'Like'
    and c."IsBanned" = 'false'
    order by "AddedAt" ${sortDirection}
    `

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

    const sortDirection = SortDirectionOrm.Desc

    const post = await this.dataSource.createQueryBuilder(PostEntity, "p")
      .select([
        `p.PostId as "postId"`,
        `p.Content as "content"`,
        `p.Title as "title"`,
        `p.ShortDescription as "shortDescription"`,
        `p.BlogId as "blogId"`,
        `p.BlogName as "blogName"`,
        `p.CreatedAt as "createdAt"`,
        `pl.Status as "myStatus"`,
        `pl.UserId as "userId"`,
        `pl.UserLogin as "userLogin"`
      ])
      .leftJoin(BlogEntity, "b", `b.BlogId = p.BlogId`)
      .leftJoin(PostLikeEntity, "pl", `pl.PostId = p.PostId and pl.UserId = :userId`, { userId })
      .where(`p.PostId = :postId`, { postId })
      .andWhere(`b.IsBanned = :isBanned`, { isBanned: false })
      .getRawOne()
    const likesCount = await this.dataSource.createQueryBuilder(PostLikeEntity, "p")
      .leftJoin(BanInfoEntity, "b", `b.UserId = p.UserId`)
      .where(`p.PostId = :postId`, { postId })
      .andWhere(`p.Status = :likeStatus`, { likeStatus: "Like" })
      .andWhere(`b.IsBanned = :isBanned`, { isBanned: false })
      .getCount()
    const dislikesCount = await this.dataSource.createQueryBuilder(PostLikeEntity, "p")
      .leftJoin(BanInfoEntity, "b", `b.UserId = p.UserId`)
      .where(`p.PostId = :postId`, { postId })
      .andWhere(`p.Status = :likeStatus`, { likeStatus: "Dislike" })
      .andWhere(`b.IsBanned = :isBanned`, { isBanned: false })
      .getCount()
    const newestLikes = await this.dataSource.createQueryBuilder(PostLikeEntity, "p")
      .select([
        `p.UserId as "userId"`,
        `p.UserLogin as "login"`,
        `p.AddedAt as "addedAt"`
      ])
      .leftJoin(BanInfoEntity, "b", `b.UserId = p.UserId`)
      .where(`p.PostId = :postId`, { postId })
      .andWhere(`p.Status = :likeStatus`, { likeStatus: "Like" })
      .andWhere(`b.IsBanned = :isBanned`, { isBanned: false })
      .orderBy(`p."AddedAt"`, sortDirection)
      .limit(3)
      .getRawMany()

    return post ? this.changePostView({ ...post, likesCount, dislikesCount }, newestLikes) : null
  }

  private changePostsView(posts: any[], foundNewestLikes: any[]) {

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
          likesCount: Number(post.likesCount) || 0,
          dislikesCount: Number(post.dislikesCount) || 0,
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
        likesCount: Number(post.likesCount) || 0,
        dislikesCount: Number(post.dislikesCount) || 0,
        myStatus: post.myStatus || LikeStatus.None,
        newestLikes: newestLikes,
      },
    }
  }


}