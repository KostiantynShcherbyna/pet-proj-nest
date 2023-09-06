import { Injectable } from "@nestjs/common"
import { Contract } from "../../../../infrastructure/utils/contract"
import { GetCommentsOutputModel } from "../../api/models/output/get-comments.output-model"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import {
  LikeStatus,
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
  SORT_BY_DEFAULT_SQL,
  SortDirection, SortDirectionOrm
} from "../../../../infrastructure/utils/constants"
import { GetPostsCommentsQueryInputModel } from "../../../blogs/api/models/input/get-posts-comments.query.input-model"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource, SelectQueryBuilder } from "typeorm"
import { UsersRepositoryOrm } from "../../../sa/repository/orm/users.repository.orm"
import { PostsQueryRepositoryOrm } from "../../../posts/repository/orm/posts.query.repository.orm"
import { CommentEntity } from "../../application/entities/sql/comment.entity"
import { CommentLikeEntity } from "../../application/entities/sql/comment-like.entity"
import { BanInfoEntity } from "../../../sa/application/entities/sql/ban-info.entity"
import { PostLikeEntity } from "../../../posts/application/entites/sql/post-like.entity"
import { PostEntity } from "../../../posts/application/entites/sql/post.entity"


@Injectable()
export class CommentsQueryRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected usersSqlRepository: UsersRepositoryOrm,
    protected postsQueryRepositorySql: PostsQueryRepositoryOrm,
  ) {
  }

  async findAllBlogComments(query: GetPostsCommentsQueryInputModel, userId: string) {

    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortDirection = query.sortDirection || SortDirection.Desc
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const offset = (pageNumber - 1) * pageSize

    const commentsTotalCount = await this.dataSource.query(`
    select count(*)
    from public."comment_entity" a
    left join public."post_entity" b on b."PostId" = a."PostId"
    left join public."blog_entity" c on c."BlogId" = b."BlogId"
    where c."UserId" = $1
    `, [userId])

    const pagesCount = Math.ceil(commentsTotalCount[0].count / pageSize)

    const queryForm = `
    select a."CommentId" as "id", a."Content" as "content", a."CreatedAt" as "createdAt",
           a."UserId" as "userId", a."UserLogin" as "userLogin",
           b."PostId" as "postId", b."Title" as "title", b."BlogId" as "blogId", b."BlogName" as "blogName",
           (select "Status" from public."comment_like_entity" where "CommentId" = a."CommentId" and "UserId" = $1) as "myStatus",
           (
            select count(*)
            from public."comment_like_entity" a
            left join public."comment_entity" b on b."CommentId" = a."CommentId"
            left join public."post_entity" c on c."PostId" = b."PostId"
            left join public."ban_info_entity" d on d."UserId" = a."UserId"
            left join public."blog_entity" e on e."BlogId" = c."BlogId"
            where a."Status" = 'Like'
            and d."IsBanned" = 'false'
            and e."UserId" = $1
           ) as "likesCount", 
           (
            select count(*)
            from public."comment_like_entity" a
            left join public."comment_entity" b on b."CommentId" = a."CommentId"
            left join public."post_entity" c on c."PostId" = b."PostId"
            left join public."ban_info_entity" d on d."UserId" = a."UserId"
            left join public."blog_entity" e on e."BlogId" = c."BlogId"
            where a."Status" = 'Dislike'
            and d."IsBanned" = 'false'
            and e."UserId" = $1
           ) as "dislikesCount"
    from public."comment_entity" a
    left join public."post_entity" b on b."PostId" = a."PostId"
    left join public."blog_entity" c on c."BlogId" = b."BlogId"
    where c."UserId" = $1
    order by a."${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $2
    offset $3
    `
    const comments = await this.dataSource.query(
      queryForm, [
        userId, // 1
        pageSize, // 2
        offset, // 3
      ])
    const blogCommentsView = this.blogCommentsView(comments)

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(commentsTotalCount[0].count),
      items: blogCommentsView
    }
  }


  async findComments({ postId, query, userId }) {

    const foundPost = await this.postsQueryRepositorySql.findPost(postId, userId)
    if (!foundPost) return new Contract(null, ErrorEnums.POST_NOT_FOUND)

    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const sortDirection = query.sortDirection === SortDirection.Asc ? SortDirectionOrm.Asc : SortDirectionOrm.Desc
    const offset = (pageNumber - 1) * pageSize

    const totalCount = await this.dataSource.createQueryBuilder()
      .from(CommentEntity, "a")
      .where(`a.PostId = :postId`, { postId })
      .getCount()

    const comments = await this.dataSource.createQueryBuilder()
      .select([
        `a."PostId" as "postId"`,
        `a."Content" as "content"`,
        `a."CreatedAt" as "createdAt"`,
        `a."CommentId" as "commentId"`,
        `a."UserId" as "userId"`,
        `a."UserLogin" as "userLogin"`
      ])
      .addSelect(qb => this.likesCountBuilder1(qb), `likesCount`)
      .addSelect(qb => this.likesCountBuilder2(qb), `dislikesCount`)
      .leftJoin(CommentLikeEntity, "pl", `pl.CommentId = a.CommentId and pl.UserId = :userId`, { userId })
      .from(CommentEntity, "a")
      .where(`a.PostId = :postId`, { postId })
      .orderBy(`a."${sortBy}"`, sortDirection)
      .limit(pageSize)
      .offset(offset)
      .getRawMany()

    const commentsView = this.postCommentsView(comments)
    const pagesCount = Math.ceil(totalCount / pageSize)

    return new Contract({
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount),
      items: commentsView
    }, null)
  }

  async findComment({ commentId, userId }) {
    const comment = await this.dataSource.createQueryBuilder()
      .select([
        `a."PostId" as "postId"`,
        `a."Content" as "content"`,
        `a."CreatedAt" as "createdAt"`,
        `a."CommentId" as "commentId"`,
        `a."UserId" as "userId"`,
        `a."UserLogin" as "userLogin"`
      ])
      .addSelect(qb => this.likesCountBuilder1(qb), `likesCount`)
      .addSelect(qb => this.likesCountBuilder2(qb), `dislikesCount`)
      .leftJoin(CommentLikeEntity, "pl", `pl.CommentId = a.CommentId and pl.UserId = :userId`, { userId })
      .from(CommentEntity, "a")
      .where(`a.CommentId = :commentId`, { commentId })
      .getRawOne()

    return comment
      ? new Contract(this.changeCommentView(comment), null)
      : new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)
  }


  private blogCommentsView(comments: any[]) {

    return comments.map(comment => {
      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: Number(comment.likesCount),
          dislikesCount: Number(comment.dislikesCount),
          myStatus: comment.myStatus || LikeStatus.None,
        },
        postInfo: {
          id: comment.postId,
          title: comment.title,
          blogId: comment.blogId,
          blogName: comment.blogName,
        }
      }
    })
  }

  private postCommentsView(comments: any[]): GetCommentsOutputModel[] {
    // Looking for a myStatus of Like in each comment

    return comments.map(comment => {
      return {
        id: comment.commentId,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: Number(comment.likesCount),
          dislikesCount: Number(comment.dislikesCount),
          myStatus: comment.myStatus || LikeStatus.None,
        },
      }
    })
  }

  private changeCommentView(comment: any): GetCommentsOutputModel {
    return {
      id: comment.commentId,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: Number(comment.likesCount),
        dislikesCount: Number(comment.dislikesCount),
        myStatus: comment.myStatus || LikeStatus.None,
      },
    }
  }


  private likesCountBuilder1(qb: SelectQueryBuilder<any>) {
    return qb
      .select(`count(*)`)
      .from(CommentLikeEntity, "le1")
      .where(`le1.LikeId = a.CommentId`)
      .andWhere(`le1.Status = 'Like'`)
  }

  private likesCountBuilder2(qb: SelectQueryBuilder<any>) {
    return qb
      .select(`count(*)`)
      .from(CommentLikeEntity, "le2")
      .where(`le2.LikeId = a.CommentId`)
      .andWhere(`le2.Status = 'Dislike'`)
  }


}