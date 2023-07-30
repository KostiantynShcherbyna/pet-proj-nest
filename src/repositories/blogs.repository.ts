import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Blogs, BlogsDocument, BlogsModel } from "src/schemas/blogs.schema"

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
  ) {
  }

  async findBlog(id: string) {

    const foundBlog = await this.BlogsModel.findById(id)
    if (foundBlog === null) return null


    return foundBlog
  }

  async saveDocument(document: BlogsDocument) {
    await document.save()
  }

}
