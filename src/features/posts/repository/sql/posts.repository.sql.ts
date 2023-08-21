import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource, QueryRunner } from "typeorm"

@Injectable()
export class PostsRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async createPost({ title, shortDescription, content, blogName, blogId, }): Promise<string> {
    const date = new Date(Date.now()).toISOString()
    const createPostResult = await this.dataSource.query(`
    insert into posts."Posts"("Title", "ShortDescription", "Content", "BlogName", "BlogId", "CreatedAt")
    values($1, $2, $3, $4, $5, $6)
    returning "PostId" as "postId"
    `, [title, shortDescription, content, blogName, blogId, date])
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

  async deletePost(postId: string, queryRunner: QueryRunner): Promise<string> {
    const deletePostResult = await queryRunner.query(`
    delete from posts."Posts"
    where "PostId" = $1
    `, [postId])
    return deletePostResult.length ? deletePostResult[1] : null
  }

}
