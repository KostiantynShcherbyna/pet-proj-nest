import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource, QueryRunner } from "typeorm"
import { CreateBlogCommand } from "../../../blogger/application/use-cases/mongoose/create-blog.use-case"

@Injectable()
export class BlogsRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findBlog(blogId: string) {
    const result = await this.dataSource.query(`
    select a."BlogId" as "id", "UserId" as "userId", "UserLogin" as "userLogin", "Name" as "name", "Description" as "description", "WebsiteUrl" as "websiteUrl",
           "CreatedAt" as "createdAt", "IsMembership" as "isMembership", "IsBanned" as "isBanned", "BanDate" as "banDate"
    from blogs."Blogs" a
    where a."BlogId" = $1
    `, [blogId])
    return result.length ? result[0] : null
  }

  async createBlog(bodyBlog: CreateBlogCommand, login: string): Promise<string> {
    const date = new Date(Date.now()).toISOString()
    const result = await this.dataSource.query(`
    insert into blogs."Blogs"("Name", "Description", "WebsiteUrl", "IsMembership", "CreatedAt", "UserId", "UserLogin", "IsBanned", "BanDate")
    values($1, $2, $3, $4, $5, $6, $7, $8, $9)
    returning "BlogId" as "blogId"
    `, [bodyBlog.name, bodyBlog.description, bodyBlog.websiteUrl, false, date, bodyBlog.userId, login, false, null])
    return result[0].blogId
  }

  async updateBlog({ blogId, name, description, websiteUrl }): Promise<string> {
    const result = await this.dataSource.query(`
    update blogs."Blogs"
    set "Name" = $2, "Description" = $3, "WebsiteUrl" = $4
    where "BlogId" = $1
    `, [blogId, name, description, websiteUrl])
    return result[1]
  }

  async deleteBlog(blogId: string, queryRunner: QueryRunner): Promise<string> {
    const result = await queryRunner.query(`
    delete from blogs."Blogs"
    where "BlogId" = $1
    `, [blogId])
    return result[1]
  }

  async findBanUsersInfo(blogId: string, userId: string) {
    const result = await this.dataSource.query(`
    select "BlogId" as "id", "UserId" as "userId", "IsBanned" as "isBanned", "BanId" as "banId"
    from blogs."BanBlogUsers"
    where "BlogId" = $1
    and "UserId" = $2
    `, [blogId, userId])
    return result.length ? result[0] : null
  }

  async banUserOfBlog({ blogId, userId, isBanned, banReason, banDate }): Promise<string> {
    const result = await this.dataSource.query(`
    insert into blogs."BanBlogUsers"("BlogId", "UserId", "IsBanned", "BanReason", "BanDate")
    values($1, $2, $3, $4, $5)
    returning "BanId" as "banId"
    `, [blogId, userId, isBanned, banReason, banDate])
    return result[0].banId
  }

  async unbanUserOfBlog({ blogId, userId }): Promise<number> {
    const result = await this.dataSource.query(`
    update blogs."BanBlogUsers"
    set "IsBanned" = false, "BanReason" = null, "BanDate" = null
    where "BlogId" = $1
    and "UserId" = $2
    `, [blogId, userId])
    return result[1]
  }

  async setBanBlogBySA({ blogId, isBanned, banDate }): Promise<string> {
    const result = await this.dataSource.query(`
    update blogs."Blogs"
    set "IsBanned" = $2, "BanDate" = $3
    where "BlogId" = $1
    `, [blogId, isBanned, banDate])
    return result[1]
  }

  async bindBlog({ blogId, userId }): Promise<string> {
    const result = await this.dataSource.query(`
    update blogs."Blogs"
    set "UserId" = $2
    where "BlogId" = $1
    `, [blogId, userId])
    return result[1]
  }


}
