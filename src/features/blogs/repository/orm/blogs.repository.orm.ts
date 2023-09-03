import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource, QueryRunner } from "typeorm"
import { CreateBlogCommand } from "../../../blogger/application/use-cases/mongoose/create-blog.use-case"
import { BlogEntity } from "../../application/entities/sql/blog.entity"
import { BanBlogUserEntity } from "../../application/entities/sql/ban-blog-user.entity"

@Injectable()
export class BlogsRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findBlog(blogId: string) {
    const builderResult = this.dataSource.createQueryBuilder(BlogEntity, "b")
      .select([
        `b.BlogId as "id"`, `b.UserId as "userId"`, `b.UserLogin as "userLogin"`,
        `b.Name as "name"`, `b.Description as "description"`, `b.WebsiteUrl as "websiteUrl"`,
        `b.CreatedAt as "createdAt"`, `b.IsMembership as "isMembership"`, `b.IsBanned as "isBanned"`,
        `b.BanDate as "banDate"`
      ])
      .where("b.BlogId = :blogId", { blogId })
    const blog = await builderResult.getRawOne()
    return blog ? blog : null
  }

  async createBlog(bodyBlog: CreateBlogCommand, login: string): Promise<string> {
    const date = new Date(Date.now()).toISOString()
    const builderResult = this.dataSource.createQueryBuilder()
      .insert()
      .into(BlogEntity)
      .values({
        Name: bodyBlog.name,
        Description: bodyBlog.description,
        WebsiteUrl: bodyBlog.websiteUrl,
        IsMembership: false,
        CreatedAt: date,
        UserId: bodyBlog.userId,
        UserLogin: login,
        IsBanned: false,
        BanDate: "",
      })
    const result = await builderResult.execute()
    return result.raw[0].BlogId
  }

  async updateBlog({ blogId, name, description, websiteUrl }): Promise<number | null> {
    const builderResult = this.dataSource.createQueryBuilder()
      .update(BlogEntity)
      .set({
        Name: name,
        Description: description,
        WebsiteUrl: websiteUrl
      })
      .where("BlogId = :blogId", { blogId })
    const result = await builderResult.execute()
    return result.affected ? result.affected : null
  }


  async deleteBlog(blogId: string, queryRunner: QueryRunner): Promise<number | null> {
    const builderResult = queryRunner.manager.createQueryBuilder()
      .delete()
      .from(BlogEntity)
      .where("BlogId = :blogId", { blogId })
    const result = await builderResult.execute()
    return result.affected ? result.affected : null
  }

  async findBanUsersInfo(blogId: string, userId: string) {
    const builderResult = this.dataSource.createQueryBuilder(BlogEntity, "b")
      .select([
        `b.BlogId as "id"`,
        `b.UserId as "userId"`,
        `b.IsBanned as "isBanned"`,
        `b.BanId as "banId"`
      ])
      .where("b.BlogId = :blogId", { blogId })
      .andWhere("b.UserId = :userId", { userId })
    const result = await builderResult.getRawOne()
    return result ? result : null
  }

  async banUserOfBlog({ blogId, userId, isBanned, banReason, banDate }): Promise<string> {
    const builderResult = this.dataSource.createQueryBuilder()
      .insert()
      .into(BanBlogUserEntity)
      .values({
        BlogId: blogId,
        UserId: userId,
        IsBanned: isBanned,
        BanReason: banReason,
        BanDate: banDate
      })
    const result = await builderResult.execute()
    return result.raw ? result.raw[0].BanId : null
  }

  async unbanUserOfBlog({ blogId, userId }): Promise<number | null> {
    const builderResult = this.dataSource.createQueryBuilder()
      .update(BanBlogUserEntity)
      .set({ IsBanned: false, BanReason: null, BanDate: null })
      .where("BlogId = :blogId", { blogId })
      .andWhere("UserId = :userId", { userId })
    const result = await builderResult.execute()
    return result.affected ? result.affected : null
  }

  async setBanBlogBySA({ blogId, isBanned, banDate }): Promise<number | null> {
    const builderResult = this.dataSource.createQueryBuilder()
      .update(BlogEntity)
      .set({ IsBanned: isBanned, BanDate: banDate })
      .where("BlogId = :blogId", { blogId })
    const result = await builderResult.execute()
    return result.affected ? result.affected : null
  }

  async bindBlog({ blogId, userId }): Promise<number | null> {
    const builderResult = this.dataSource.createQueryBuilder()
      .update(BlogEntity)
      .set({ UserId: userId })
      .where("BlogId = :blogId", { blogId })
    const result = await builderResult.execute()
    return result.affected ? result.affected : null
  }


}
