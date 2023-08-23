import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Comments, CommentsDocument, CommentsModel } from "../../application/entities/mongoose/comments.schema"
import { Contract } from "../../../../infrastructure/utils/contract"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource, QueryRunner } from "typeorm"
import { LikeStatus } from "../../../../infrastructure/utils/constants"


@Injectable()
export class CommentsRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findComment(commentId: string) {
    const result = await this.dataSource.query(`
    select "CommentId" as "commentId", "PostId" as "postId", "Content" as "content",
           "UserId" as "userId", "UserLogin" as "userLogin", "LikesCount" as 'likesCount',
           "DislikesCount" as "dislikesCount", "CreatedAt" as "createdAt"
    from comments."Comments"
    where "CommentId" = $1
    `, [commentId])
    return result.length ? result[0] : null
  }

  async findCommentLike({ commentId, userId }) {
    const result = await this.dataSource.query(`
    select a."Status" as "myStatus", "CommentId" as "commentId", "LikeId" as "likeId", "UserId" as "userId"
    from comments."Likes" a
    where "CommentId" = $1
    and "UserId" = $2
    `, [commentId, userId])
    return result.length ? result[0] : null
  }

  async updateComment({ commentId, content }, queryRunner: QueryRunner): Promise<string> {
    const result = await queryRunner.query(`
    update comments."Comments"
    set "Content" = $2
    where "CommentId" = $1
    `, [commentId, content])
    return result.length ? result[1] : null
  }

  async createLike({ status, commentId, userId }, queryRunner: QueryRunner): Promise<string> {
    const result = await queryRunner.query(`
    insert into comments."Likes"("Status", "CommentId", "UserId")
    values($1, $2, $3)
    `, [status, commentId, userId])
    return result.length ? result[1] : null
  }

  async updateLike({ status, commentId, userId }, queryRunner: QueryRunner): Promise<string> {
    const queryForm = `
    update comments."Likes"
    set "Status" = $1
    where "CommentId" = $2
    and "UserId" = $3
    `
    const result = await queryRunner.query(queryForm, [status, commentId, userId])
    return result.length ? result[1] : null
  }

  async setNoneToLike({ commentId, userId }, queryRunner: QueryRunner) {
    const queryForm = `
      update comments."Comments"
      set "LikesCount" = "LikesCount" + 1
      where "CommentId" = $1
      and "UserId" = $2
    `
    const result = await queryRunner.query(queryForm, [commentId, userId])
    return result.length ? result[1] : null

  }

  async setNoneToDislike({ commentId, userId }, queryRunner: QueryRunner) {
    const queryForm = `
      update comments."Comments"
      set "DislikesCount" = "DislikesCount" + 1
      where "CommentId" = $1
      and "UserId" = $2
    `
    const result = await queryRunner.query(queryForm, [commentId, userId])
    return result.length ? result[1] : null

  }

  async setLikeToNone({ commentId, userId }, queryRunner: QueryRunner) {
    const queryForm = `
      update comments."Comments"
      set "LikesCount" = "LikesCount" - 1
      where "CommentId" = $1
      and "UserId" = $2
    `
    const result = await queryRunner.query(queryForm, [commentId, userId])
    return result.length ? result[1] : null

  }

  async setLikeToDislike({ commentId, userId }, queryRunner: QueryRunner) {
    const queryForm = `
      update comments."Comments"
      set "LikesCount" = "LikesCount" - 1, "DislikesCount" = "DislikesCount" + 1
      where "CommentId" = $1
      and "UserId" = $2
    `
    const result = await queryRunner.query(queryForm, [commentId, userId])
    return result.length ? result[1] : null

  }

  async setDislikeToNone({ commentId, userId }, queryRunner: QueryRunner) {
    const queryForm = `
      update comments."Comments"
      set "DislikesCount" = "DislikesCount" - 1
      where "CommentId" = $1
      and "UserId" = $2
    `
    const result = await queryRunner.query(queryForm, [commentId, userId])
    return result.length ? result[1] : null

  }

  async setDislikeToLike({ commentId, userId }, queryRunner: QueryRunner) {
    const queryForm = `
      update comments."Comments"
      set "DislikesCount" = "DislikesCount" - 1, "LikesCount" = "LikesCount" + 1
      where "CommentId" = $1
      and "UserId" = $2
    `
    const result = await queryRunner.query(queryForm, [commentId, userId])
    return result.length ? result[1] : null

  }

}
