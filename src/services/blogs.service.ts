import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { bodyBlogModel } from "src/models/body/bodyBlogModel"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { BlogsModel, Blogs, BlogsDocument } from "src/schemas/blogs.schema"
import { dtoModify } from "src/utils/modify/dtoModify"
import { blogView } from "src/views/blogView"

@Injectable()
export class BlogsService {
    constructor(
        @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
        protected readonly BlogsRepository: BlogsRepository
    ) { }


    async createBlog(body: bodyBlogModel): Promise<blogView> {

        const newBlog = this.BlogsModel.createBlog(body, this.BlogsModel)
        await this.BlogsRepository.saveDocument(newBlog)

        const newBlogView = dtoModify.createBlogViewMngs(newBlog)

        return newBlogView
    }


}

