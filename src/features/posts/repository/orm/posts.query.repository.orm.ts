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
import { DataSource, SelectQueryBuilder } from "typeorm"
import { PostEntity } from "../../application/entites/sql/post.entity"
import { BlogEntity } from "../../../blogs/application/entities/sql/blog.entity"
import { PostLikeEntity } from "../../application/entites/sql/post-like.entity"
import { BanInfoEntity } from "../../../sa/application/entities/sql/ban-info.entity"
import { AccountEntity } from "../../../sa/application/entities/sql/account.entity"


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
    const sortDirection = queryPost.sortDirection === SortDirection.Asc ? SortDirectionOrm.Asc : SortDirectionOrm.Desc
    const offset = (pageNumber - 1) * pageSize

    const totalCount = await this.dataSource.query(`
    select count (*)
    from public."post_entity" a
    left join public."blog_entity" b on b."BlogId" = a."BlogId" 
    where b."IsBanned" = 'false'
    `)

    const pagesCount = Math.ceil(totalCount[0].count / pageSize)

    const posts = await this.dataSource.createQueryBuilder(PostEntity, "p")
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
      .addSelect(qb => this.likesCountBuilder1(qb), `likesCount`)
      .addSelect(qb => this.likesCountBuilder2(qb), `dislikesCount`)
      // .addSelect(qb => this.likesCountBuilder(qb, 'Like', "pl1"), `likesCount`)
      // .addSelect(qb => this.likesCountBuilder(qb, 'Dislike', "pl2"), `dislikesCount`)
      .addSelect(qb => this.newestLikesBuilder(qb), `newestLikes`)
      .leftJoin(BlogEntity, "b", `b.BlogId = p.BlogId`)
      .leftJoin(PostLikeEntity, "pl", `pl.PostId = p.PostId and pl.UserId = :userId`, { userId })
      .where(`b.IsBanned = :isBanned`, { isBanned: false })
      .orderBy(`p."${sortBy}"`, sortDirection)
      .limit(pageSize)
      .offset(offset)
      .getRawMany()

    const mappedPosts = this.changePostsView(posts)

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

  private changePostsView(posts: any[]) {

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
          likesCount: Number(post.likesCount) || 0,
          dislikesCount: Number(post.dislikesCount) || 0,
          myStatus: post.myStatus || LikeStatus.None,
          newestLikes: post.newestLikes,
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

  private likesCountBuilder(qb: SelectQueryBuilder<any>, ls: string, alias: string) {
    return qb
      .select(`count(*)`)
      .from(PostLikeEntity, alias)
      .leftJoin(BanInfoEntity, "b", `b.UserId = ${alias}.UserId`)
      .where(`${alias}.PostId = p.PostId`)
      .andWhere(`${alias}.Status = :likeStatus`, { likeStatus: ls })
      .andWhere(`b.IsBanned = :isBanned`, { isBanned: false })
  }

  private likesCountBuilder1(qb: SelectQueryBuilder<any>) {
    return qb
      .select(`count(*)`)
      .from(PostLikeEntity, "pl1")
      .leftJoin(BanInfoEntity, "b", `b.UserId = pl1.UserId`)
      .where(`pl1.PostId = p.PostId`)
      .andWhere(`pl1.Status = 'Like'`)
      .andWhere(`b.IsBanned = :isBanned`, { isBanned: false })
  }

  private likesCountBuilder2(qb: SelectQueryBuilder<any>) {
    return qb
      .select(`count(*)`)
      .from(PostLikeEntity, "pl2")
      .leftJoin(BanInfoEntity, "b", `b.UserId = pl2.UserId`)
      .where(`pl2.PostId = p.PostId`)
      .andWhere(`pl2.Status = 'Dislike'`)
      .andWhere(`b.IsBanned = :isBanned`, { isBanned: false })
  }

  private newestLikesBuilder(qb: SelectQueryBuilder<any>) {
    return qb.select(`json_agg(to_jsonb("newestLikes")) as "newestLikes"`)
      .from(qb => {
        return qb
          .select([
            `ple.UserId as "userId"`,
            `ple.UserLogin as "login"`,
            `ple.AddedAt as "addedAt"`
          ])
          .from(PostLikeEntity, "ple")
          .leftJoin(BanInfoEntity, "bi", `bi.UserId = ple.UserId`)
          .where(`ple.PostId = p.PostId`)
          .andWhere(`ple.Status = :likeStatus`, { likeStatus: "Like" })
          .andWhere(`bi.IsBanned = :isBanned`, { isBanned: false })
          .groupBy(`ple.UserId, ple.UserLogin, ple.AddedAt`)
          .orderBy(`ple."AddedAt"`, "DESC")
          .limit(3)
      }, "newestLikes")
  }


}