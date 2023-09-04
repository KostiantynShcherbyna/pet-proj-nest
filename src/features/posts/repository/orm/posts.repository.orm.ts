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
    const deleteBuilder = queryRunner.manager.createQueryBuilder(PostEntity, "p")
      .delete()
      .where("BlogId = :blogId", { blogId })
    const result = await deleteBuilder.execute()
    return result.affected ? result.affected : null
  }

  async findPost(postId: string) {
    const post = await this.dataSource.createQueryBuilder(PostEntity, "p")
      .select([
        `p.PostId as "postId"`,
        `p.Title as "title"`,
        `p.ShortDescription as "shortDescription"`,
        `p.Content as "content"`,
        `p.BlogName as "blogName"`,
        `p.BlogId as "blogId"`,
        `p.CreatedAt as "createdAt"`
      ])
      .where(`p.PostId = :postId`, { postId })
      .getRawOne()
    return post ? post : null
  }

  async updatePost({ postId, title, shortDescription, content }, queryRunner: QueryRunner): Promise<number | null> {
    const result = await queryRunner.manager.createQueryBuilder()
      .update(PostEntity)
      .set({
        Title: title,
        ShortDescription: shortDescription,
        Content: content
      })
      .where(`PostId = :postId`, { postId })
      .execute()
    return result.affected ? result.affected : null
  }

  async deletePost(postId: string, queryRunner: QueryRunner): Promise<number | null> {
    const builderResult = queryRunner.manager.createQueryBuilder(PostEntity, "p")
      .delete()
      .where(`p.PostId = :postId`, { postId })
    const result = await builderResult.execute()
    return result.affected ? result.affected : null
  }

  async deleteLikes(postId: string, queryRunner: QueryRunner): Promise<number | null> {
    const builderResult = queryRunner.manager.createQueryBuilder(PostLikeEntity, "p")
      .delete()
      .where(`p.PostId = :postId`, { postId })
    const result = await builderResult.execute()
    return result.affected ? result.affected : null
  }

  async createComment({ postId, content, date, userId, userLogin }): Promise<string> {
    const result = await this.dataSource.createQueryBuilder(CommentEntity, "c")
      .insert()
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

  async findPostLike({ postId, userId }) {
    const result = await this.dataSource.createQueryBuilder(PostLikeEntity, "p")
      .select([
        `p.Status as "myStatus"`,
        `p.PostId as "postId"`,
        `p.LikeId as "likeId"`,
        `p.UserId as "userId"`
      ])
      .where(`p.PostId = :postId`, { postId })
      .andWhere(`p.UserId = :userId`, { userId })
      .getRawOne()
    return result
  }

  async createLike({ status, userId, userLogin, postId, addedAt }, queryRunner: QueryRunner): Promise<string> {
    const result = await queryRunner.manager.createQueryBuilder(PostLikeEntity, "p")
      .insert()
      .values({
        Status: status,
        UserId: userId,
        UserLogin: userLogin,
        PostId: postId,
        AddedAt: addedAt
      })
      .execute()
    return result.identifiers[0].LikeId
  }

  async updateLike({ status, postId, userId }, queryRunner: QueryRunner): Promise<number | null> {
    const builderResult = queryRunner.manager.createQueryBuilder()
      .update(PostLikeEntity)
      .set({ Status: status })
      .where(`PostId = :postId`, { postId })
      .andWhere(`UserId = :userId`, { userId })
    const result = await builderResult.execute()
    return result.affected ? result.affected : null
  }

}
