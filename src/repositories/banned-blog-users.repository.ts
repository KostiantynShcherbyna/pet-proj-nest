import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { BannedBlogUsers, BannedBlogUsersDocument, BannedBlogUsersModel } from "src/schemas/banned-blog-users.schema"
import { Blogs, BlogsDocument, BlogsModel } from "src/schemas/blogs.schema"

@Injectable()
export class BannedBlogUsersRepository {
  constructor(
    @InjectModel(BannedBlogUsers.name) protected BannedBlogUsersModel: BannedBlogUsersModel,
  ) {
  }

  async findBannedBlogUser(userId: string, blogId: string) {

    const bannedBlogUser = await this.BannedBlogUsersModel.findOne({
      $and: [
        { userId: userId },
        { blogId: blogId },
      ]
    })
    if (bannedBlogUser === null) return null

    return bannedBlogUser
  }

  async findBannedBlogUsers() {

    const bannedBlogUsers = await this.BannedBlogUsersModel.find({
      isBanned: true
    })

    return bannedBlogUsers
  }

  async saveDocument(document: BannedBlogUsersDocument) {
    await document.save()
  }

}
