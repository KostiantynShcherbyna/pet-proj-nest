import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { BlogsModel, Blogs } from "src/schemas/blogs.schema"
import { ObjectIdIdModel } from "../models/uri/ObjectId-id.model"

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
  async saveDocument(document: any) {
    await document.save()
  }

}
