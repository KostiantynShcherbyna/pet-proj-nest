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
    const foundBlogResult = await this.dataSource.query(`
    select "BlogId" as "id", "UserId" as "userId", "UserLogin" as "userLogin", "Name" as "name", "Description" as "description", "WebsiteUrl" as "websiteUrl",
           "CreatedAt" as "createdAt", "IsMembership" as "isMembership"
    from blogs."Blogs"
    where "BlogId" = $1
    `, [blogId])
    return foundBlogResult.length ? foundBlogResult[0] : null
  }

  async createBlog(bodyBlog: CreateBlogCommand, login: string): Promise<string> {
    const date = new Date(Date.now()).toISOString()
    const createBlogResult = await this.dataSource.query(`
    insert into blogs."Blogs"("Name", "Description", "WebsiteUrl", "IsMembership", "CreatedAt", "UserId", "UserLogin")
    values($1, $2, $3, $4, $5, $6, $7)
    returning "BlogId" as "blogId"
    `, [bodyBlog.name, bodyBlog.description, bodyBlog.websiteUrl, false, date, bodyBlog.userId, login])
    return createBlogResult[0].blogId
  }

  async updateBlog({ blogId, name, description, websiteUrl }): Promise<string> {
    const updateBlogResult = await this.dataSource.query(`
    update blogs."Blogs"
    set "Name" = $2, "Description" = $3, "WebsiteUrl" = $4
    where "BlogId" = $1
    `, [blogId, name, description, websiteUrl])
    return updateBlogResult.length ? updateBlogResult[1] : null
  }

  async deleteBlog(blogId: string, queryRunner: QueryRunner): Promise<string> {
    const deleteBlogResult = await queryRunner.query(`
    delete from blogs."Blogs"
    where "BlogId" = $1
    `, [blogId])
    return deleteBlogResult.length ? deleteBlogResult[1] : null
  }

  async findBlogBanInfo(blogId: string, userId: string) {
    const foundResult = await this.dataSource.query(`
    select "BlogId" as "id", "UserId" as "userId", "IsBanned" as "isBanned", "BanInfoId" as "banInfoId"
    from blogs."BanInfo"
    where "BlogId" = $1
    and "UserId" = $2
    `, [blogId, userId])
    return foundResult.length ? foundResult[0] : null
  }

  async createBanUserOfBlog({ blogId, userId, isBanned, banReason, banDate }): Promise<string> {
    const createResult = await this.dataSource.query(`
    insert into blogs."BanInfo"("BlogId", "UserId", "IsBanned", "BanReason", "BanDate")
    values($1, $2, $3, $4, $5)
    returning "BanInfoId" as "banInfoId"
    `, [blogId, userId, isBanned, banReason, banDate])
    return createResult[0].banInfoId
  }

  async unbanUserOfBlog({ blogId, userId }): Promise<number> {
    const updateResult = await this.dataSource.query(`
    update blogs."BanInfo"
    set "IsBanned" = false, "BanReason" = null, "BanDate" = null
    where "BlogId" = $1
    and "UserId" = $2
    `, [blogId, userId])
    return updateResult.length ? updateResult[1] : null
  }


}
