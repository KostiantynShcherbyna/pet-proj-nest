import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { BlogsModel, Blogs } from "src/schemas/blogs.schema"

@Injectable()
export class BlogsRepository {
    constructor(
        @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    ) { }

    async findBlog(id: string) {

        const foundBlog = await this.BlogsModel.findOne({ _id: new Types.ObjectId(id) })
        if (foundBlog === null) return null

        return foundBlog
    }

    async saveDocument(document: any) {
        await document.save()
    }

}
