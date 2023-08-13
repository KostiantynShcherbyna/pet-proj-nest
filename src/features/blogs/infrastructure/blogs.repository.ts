import { Injectable } from "@nestjs/common"
import { Blogs, BlogsDocument, BlogsModel } from "../../entities/mongoose/blogs.schema"
import { InjectModel } from "@nestjs/mongoose"
import { BannedBlogUsers, BannedBlogUsersModel } from "../../entities/mongoose/banned-blog-users.schema"

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    @InjectModel(BannedBlogUsers.name) protected BannedBlogUsersModel: BannedBlogUsersModel,
  ) {
  }

  async findBlog(id: string) {

    const foundBlog = await this.BlogsModel.findById(id)
    if (foundBlog === null) return null


    return foundBlog
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
