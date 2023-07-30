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

  async findBannedBlogUsers(userId: string, blogId: string) {

    const bannedBlogUserDocument = await this.BannedBlogUsersModel.findOne({
      $and: [
        { userId: userId },
        { blogId: blogId },
      ]
    })
    if (bannedBlogUserDocument === null) return null

    return bannedBlogUserDocument
  }

  async saveDocument(document: BannedBlogUsersDocument) {
    await document.save()
  }

}
