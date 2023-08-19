import { Injectable } from "@nestjs/common"
import { Blogs, BlogsDocument, BlogsModel } from "../../application/entities/mongoose/blogs.schema"
import { InjectModel } from "@nestjs/mongoose"
import { BannedBlogUsers, BannedBlogUsersModel } from "../../application/entities/mongoose/banned-blog-users.schema"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"

@Injectable()
export class BlogsSqlRepository {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    @InjectModel(BannedBlogUsers.name) protected BannedBlogUsersModel: BannedBlogUsersModel,
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

  async findBannedBlogUsers(userId: string, blogId: string) {

    const foundBannedUser = await this.BannedBlogUsersModel.find({
      $and: [
        { userId: userId },
        { blogId: blogId },
      ]
    })
    if (foundBannedUser === null) return null

    return foundBannedUser
  }

  async saveDocument(document: BlogsDocument) {
    await document.save()
  }

}
