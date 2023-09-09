import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Comments, CommentsDocument, CommentsModel } from "../../application/entities/mongoose/comments.schema"
import { Contract } from "../../../../infrastructure/utils/contract"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource, QueryRunner, SelectQueryBuilder } from "typeorm"
import { LikeStatus } from "../../../../infrastructure/utils/constants"
import { PostEntity } from "../../../posts/application/entites/typeorm/post.entity"
import { BlogEntity } from "../../../blogs/application/entities/sql/blog.entity"
import { PostLikeEntity } from "../../../posts/application/entites/typeorm/post-like.entity"
import { CommentEntity } from "../../application/entities/sql/comment.entity"
import { BanInfoEntity } from "../../../sa/application/entities/sql/ban-info.entity"
import { CommentLikeEntity } from "../../application/entities/sql/comment-like.entity"


@Injectable()
export class CommentsRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findComment(commentId: string) {
    const comment = await this.dataSource.createQueryBuilder()
      .select([
        `q.CommentId as "commentId"`,
        `q.PostId as "postId"`,
        `q.Content as "content"`,
        `q.UserId as "userId"`,
        `q.UserLogin as "userLogin"`,
        `q.CreatedAt as "createdAt"`
      ])
      .from(CommentEntity, "q")
      .addSelect(qb => this.likesCountBuilder1(qb), `likesCount`)
      .addSelect(qb => this.likesCountBuilder2(qb), `dislikesCount`)
      .where(`q.CommentId = :commentId`, { commentId })
      .getRawOne()
    return comment ? comment : null
  }

  async findCommentLike({ commentId, userId }) {
    const commentLike = await this.dataSource.createQueryBuilder()
      .from(CommentLikeEntity, "q")
      .where(`q.CommentId = :commentId`, { commentId })
      .andWhere(`q.UserId = :userId`, { userId })
      .getRawOne()
    return commentLike ? commentLike : null
  }

  async createComment({ postId, content, date, userId, userLogin }): Promise<string> {
    const result = await this.dataSource.createQueryBuilder()
      .insert()
      .into(CommentEntity)
      .values({
        PostId: postId,
        Content: content,
        CreatedAt: date,
        UserId: userId,
        UserLogin: userLogin
      })
      .execute()
    return result.identifiers[0].CommentId
  }

  async updateComment({ commentId, content }, queryRunner: QueryRunner): Promise<number | null> {
    const result = await queryRunner.manager.createQueryBuilder()
      .update(CommentEntity)
      .set({ Content: content })
      .where(`CommentId = :commentId`, { commentId })
      .execute()
    return result.affected ? result.affected : null
  }

  async createLike({ status, commentId, userId }, queryRunner: QueryRunner): Promise<string> {
    const result = await queryRunner.manager.createQueryBuilder()
      .insert()
      .into(CommentLikeEntity)
      .values({
        Status: status,
        CommentId: commentId,
        UserId: userId
      })
      .execute()
    return result.identifiers[0].LikeId
  }

  async updateLike({ status, commentId, userId }, queryRunner: QueryRunner): Promise<number | null> {
    const result = await queryRunner.manager.createQueryBuilder()
      .update(CommentLikeEntity)
      .set({ Status: status })
      .where(`CommentId = :commentId`, { commentId })
      .andWhere(`UserId = :userId`, { userId })
      .execute()
    return result.affected ? result.affected : null
  }

  async deleteComment(commentId: string, queryRunner: QueryRunner) {
    const result = await queryRunner.manager.createQueryBuilder()
      .delete()
      .from(CommentEntity)
      .where(`CommentId = :commentId`, { commentId })
      .execute()
    return result.affected ? result.affected : null
  }

  async deleteLike(commentId: string, queryRunner: QueryRunner) {
    const result = await queryRunner.manager.createQueryBuilder()
      .delete()
      .from(CommentLikeEntity)
      .where(`CommentId = :commentId`, { commentId })
      .execute()
    return result[1]
  }

  private likesCountBuilder1(qb: SelectQueryBuilder<any>) {
    return qb
      .select(`count(*)`)
      .from(CommentLikeEntity, "le1")
      .where(`le1.LikeId = q.CommentId`)
      .andWhere(`le1.Status = 'Like'`)
  }

  private likesCountBuilder2(qb: SelectQueryBuilder<any>) {
    return qb
      .select(`count(*)`)
      .from(CommentLikeEntity, "le2")
      .where(`le2.LikeId = q.CommentId`)
      .andWhere(`le2.Status = 'Dislike'`)
  }

}
