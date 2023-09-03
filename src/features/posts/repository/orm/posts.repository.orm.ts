import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource, QueryRunner } from "typeorm"
import { PostEntity } from "../../application/entites/sql/post.entity"
import { PostLikeEntity } from "../../application/entites/sql/post-like.entity"
import { CommentEntity } from "../../../comments/application/entities/sql/comment.entity"

@Injectable()
export class PostsRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async createPost({ title, shortDescription, content, blogName, blogId }): Promise<string> {
    const date = new Date(Date.now()).toISOString()
    const result = await this.dataSource.createQueryBuilder(PostEntity, "p")
      .insert()
      .into(PostEntity)
      .values({
        Title: title,
        ShortDescription: shortDescription,
        Content: content,
        BlogName: blogName,
        BlogId: blogId,
        CreatedAt: date,
      })
      .execute()
    return result.identifiers[0].PostId
  }

  async deletePosts(blogId: string, queryRunner: QueryRunner): Promise<number | null> {
    const deleteBuilder = queryRunner.manager.createQueryBuilder()
      .delete()
      .from(PostEntity)
      .where("BlogId = :blogId", { blogId })
    const result = await deleteBuilder.execute()
    return result.affected ? result.affected : null
  }

  async findPost(postId: string) {
    const builderResult = this.dataSource.createQueryBuilder(PostEntity, "p")
      .select([
        `p.PostId as postId`,
        `p.Title as title`,
        `p.ShortDescription as shortDescription`,
        `p.Content as content`,
        `p.BlogName as blogName`,
        `p.BlogId as blogId`,
        `p.CreatedAt as createdAt`
      ])
      .where(`p.PostId = :postId`, { postId })
    const post = await builderResult.execute()
    return post ? post : null
  }

  async updatePost({ postId, title, shortDescription, content }, queryRunner: QueryRunner): Promise<string | null> {
    const builderResult = queryRunner.manager.createQueryBuilder(PostEntity, "p")
      .update()
      .set({
        Title: title,
        ShortDescription: shortDescription,
        Content: content
      })
      .where(`p.PostId = :postId`, { postId })
    const result = await builderResult.execute()
    return result.raw ? result.raw[0] : null
  }

  async deletePost(postId: string, queryRunner: QueryRunner): Promise<string> {
    const builderResult = queryRunner.manager.createQueryBuilder(PostEntity, "p")
      .delete()
      .where(`p.PostId = :postId`, { postId })
    const result = await builderResult.execute()
    return result.raw ? result.raw[0] : null
  }

  async deleteLikes(postId: string, queryRunner: QueryRunner): Promise<string> {
    const builderResult = queryRunner.manager.createQueryBuilder(PostLikeEntity, "p")
      .delete()
      .where(`p.PostId = :postId`, { postId })
    const result = await builderResult.execute()
    return result.raw ? result.raw[0] : null
  }

  async createComment({ postId, content, date, userId, userLogin }): Promise<string> {
    const builderResult = this.dataSource.createQueryBuilder(CommentEntity, "c")
      .insert()
      .values({
        PostId: postId,
        Content: content,
        CreatedAt: date,
        UserId: userId,
        UserLogin: userLogin
      })
    const result = await builderResult.execute()
    return result.raw ? result.raw[0] : null
  }

  async findPostLike({ postId, userId }) {
    const builderResult = this.dataSource.createQueryBuilder(PostLikeEntity, "p")
      .select([
        `p.Status as myStatus`,
        `p.PostId as postId`,
        `p.LikeId as likeId`,
        `p.UserId as userId`
      ])
      .where(`p.PostId = :postId`, { postId })
      .andWhere(`p.UserId = :userId`, { userId })
    return await builderResult.execute()
  }

  async createLike({ status, userId, userLogin, postId, addedAt }, queryRunner: QueryRunner): Promise<string> {
    const builderResult = queryRunner.manager.createQueryBuilder(PostLikeEntity, "p")
      .insert()
      .values({
        Status: status,
        UserId: userId,
        UserLogin: userLogin,
        PostId: postId,
        AddedAt: addedAt
      })
    const result = await builderResult.execute()
    return result.raw ? result.raw[0] : null
  }

  async updateLike({ status, postId, userId }, queryRunner: QueryRunner): Promise<number | null> {
    const builderResult = queryRunner.manager.createQueryBuilder(PostLikeEntity, "p")
      .update()
      .set({ Status: status })
      .where(`p.PostId = :postId`, { postId })
      .andWhere(`p.UserId = :userId`, { userId })
    const result = await builderResult.execute()
    return result.affected ? result.affected : null
  }
  
}
