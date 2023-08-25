import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource, QueryRunner } from "typeorm"

@Injectable()
export class PostsRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async createPost({ title, shortDescription, content, blogName, blogId, likesCount, dislikesCount }): Promise<string> {
    const queryForm = `
    insert into posts."Posts"(
     "Title", "ShortDescription", "Content", "BlogName",
     "BlogId", "CreatedAt", "LikesCount", "DislikesCount"
     )
    values($1, $2, $3, $4, $5, $6, $7, $8)
    returning "PostId" as "postId"
    `
    const date = new Date(Date.now()).toISOString()
    const createPostResult = await this.dataSource.query(
      queryForm, [title, shortDescription, content, blogName, blogId, date, likesCount, dislikesCount]
    )
    return createPostResult[0].postId
  }

  async deletePosts(blogId: string, queryRunner: QueryRunner): Promise<string> {
    const deletePostResult = await queryRunner.query(`
    delete from posts."Posts"
    where "BlogId" = $1
    `, [blogId])
    return deletePostResult.length ? deletePostResult[1] : null
  }

  async findPost(postId: string) {
    const findPostResult = await this.dataSource.query(`
    select "PostId" as "postId", "Title" as "title", "ShortDescription" as "shortDescription", "Content" as "content",
           "BlogName" as "blogName", "BlogId" as "blogId", "CreatedAt" as "createdAt"
    from posts."Posts"
    where "PostId" = $1
    `, [postId])
    return findPostResult.length ? findPostResult[0] : null
  }

  async updatePost({ postId, title, shortDescription, content }, queryRunner: QueryRunner): Promise<string> {
    const updateResult = await queryRunner.query(`
    update posts."Posts"
    set "Title" = $2, "ShortDescription" = $3, "Content" = $4
    where "PostId" = $1
    `, [postId, title, shortDescription, content])
    return updateResult.length ? updateResult[1] : null
  }


  async deletePost(postId: string, queryRunner: QueryRunner): Promise<string> {
    const deletePostResult = await queryRunner.query(`
    delete from posts."Posts"
    where "PostId" = $1
    `, [postId])
    return deletePostResult.length ? deletePostResult[1] : null
  }

  async deleteLikes(postId: string, queryRunner: QueryRunner): Promise<string> {
    const result = await queryRunner.query(`
    delete from posts."Likes"
    where "PostId" = $1
    `, [postId])
    return result.length ? result[1] : null
  }


  async createComment({ postId, content, date, userId, userLogin, likesCount, dislikesCount }): Promise<string> {

    const result = await this.dataSource.query(`
    insert into comments."Comments"(
     "PostId", "Content", "CreatedAt", "UserId", "UserLogin",
     "LikesCount", "DislikesCount")
    values($1, $2, $3, $4, $5, $6, $7)
    returning "CommentId" as "commentId"
    `, [postId, content, date, userId, userLogin, likesCount, dislikesCount])
    return result[0].commentId
  }

  async findPostLike({ postId, userId }) {
    const result = await this.dataSource.query(`
    select a."Status" as "myStatus", "PostId" as "postId", "LikeId" as "likeId", "UserId" as "userId"
    from posts."Likes" a
    where "PostId" = $1
    and "UserId" = $2
    `, [postId, userId])
    return result.length ? result[0] : null
  }

  async createLike({ status, userId, userLogin, postId, addedAt }, queryRunner: QueryRunner): Promise<string> {
    const result = await queryRunner.query(`
    insert into posts."Likes"("Status", "UserId", "UserLogin", "PostId", "AddedAt")
    values($1, $2, $3, $4, $5)
    returning "Status"
    `, [status, userId, userLogin, postId, addedAt])
    return result.length ? result[1] : null
  }

  async updateLike({ status, postId, userId }, queryRunner: QueryRunner): Promise<string> {
    const queryForm = `
    update posts."Likes"
    set "Status" = $1
    where "PostId" = $2
    and "UserId" = $3
    returning "Status"
    `
    const result = await queryRunner.query(queryForm, [status, postId, userId])
    return result.length ? result[1] : null
  }

  async setNoneToLike(postId: string, queryRunner: QueryRunner) {
    const queryForm = `
      update posts."Posts"
      set "LikesCount" = "LikesCount" + 1
      where "PostId" = $1
    `
    const result = await queryRunner.query(queryForm, [postId])
    return result.length ? result[1] : null

  }

  async setNoneToDislike(postId: string, queryRunner: QueryRunner) {
    const queryForm = `
      update posts."Posts"
      set "DislikesCount" = "DislikesCount" + 1
      where "PostId" = $1
    `
    const result = await queryRunner.query(queryForm, [postId])
    return result.length ? result[1] : null

  }

  async setLikeToNone(postId: string, queryRunner: QueryRunner) {
    const queryForm = `
      update posts."Posts"
      set "LikesCount" = case when "LikesCount" > 0
      then "LikesCount" - 1
      else "LikesCount" end
      where "PostId" = $1
    `
    const result = await queryRunner.query(queryForm, [postId])
    return result.length ? result[1] : null

  }

  async setLikeToDislike(postId: string, queryRunner: QueryRunner) {
    const queryForm = `
      update posts."Posts"
      set "LikesCount" = case when "LikesCount" > 0
      then "LikesCount" - 1
      else "LikesCount" end,
       "DislikesCount" = "DislikesCount" + 1
      where "PostId" = $1
    `
    const result = await queryRunner.query(queryForm, [postId])
    return result.length ? result[1] : null

  }

  async setDislikeToNone(postId: string, queryRunner: QueryRunner) {
    const queryForm = `
      update posts."Posts"
      set "DislikesCount" = case when "DislikesCount" > 0
      then "DislikesCount" - 1 
      else "DislikesCount" end
      where "PostId" = $1
    `
    const result = await queryRunner.query(queryForm, [postId])
    return result.length ? result[1] : null
  }

  async setDislikeToLike(postId: string, queryRunner: QueryRunner) {
    const queryForm = `
      update posts."Posts"
      set "DislikesCount" = case when "DislikesCount" > 0 
      then "DislikesCount" - 1
      else "DislikesCount" end,
        "LikesCount" = "LikesCount" + 1
      where "PostId" = $1
      returning "DislikesCount" and "LikesCount"
    `
    const result = await queryRunner.query(queryForm, [postId])
    return result.length ? result[1] : null

  }

}
