import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { Contract } from "src/contracts/Contract"
import { bodyBlogModel } from "src/models/body/bodyBlogModel"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { BlogsModel, Blogs, BlogsDocument } from "src/schemas/blogs.schema"
import { errorEnums } from "src/utils/errors/errorEnums"
import { dtoModify } from "src/utils/modify/dtoModify"
import { blogView } from "src/views/blogView"

@Injectable()
export class BlogsService {
    constructor(
        @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
        @Inject(BlogsRepository) protected readonly BlogsRepository: BlogsRepository
    ) { }


    async createBlog(bodyBlogModel: bodyBlogModel): Promise<blogView> {

        const newBlog = this.BlogsModel.createBlog(bodyBlogModel, this.BlogsModel)
        await this.BlogsRepository.saveDocument(newBlog)

        const newBlogView = dtoModify.createBlogViewMngs(newBlog)

        return newBlogView
    }

    async updateBlog(id: string, body: bodyBlogModel): Promise<Contract<null | boolean>> {

        const blog = await this.BlogsModel.findById(id)
        if (blog === null) return new Contract(null, errorEnums.NOT_FOUND_BLOG)

        blog.updateBlog(body)
        await this.BlogsRepository.saveDocument(blog)

        return new Contract(true, null)
    }


    async deleteBlog(id: string): Promise<Contract<null | boolean>> {

        const deletedBlog = await this.BlogsModel.deleteOne({ _id: new Types.ObjectId(id) })
        // const deletedPostsOfDeletedBlog = postsDB.deleteMany({ blogId: id })

        if (deletedBlog.deletedCount === 0) return new Contract(null, errorEnums.NOT_DELETE_BLOG)
        return new Contract(true, null)
    }


}

