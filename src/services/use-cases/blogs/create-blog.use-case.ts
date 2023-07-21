import { Injectable } from "@nestjs/common"
import { BodyBlogModel } from "src/models/body/body-blog.model"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { BlogsDocument, BlogsModel } from "src/schemas/blogs.schema"
import { BlogView } from "src/views/blog.view"

@Injectable()
export class CreateBlog {
    constructor(
        protected BlogsModel: BlogsModel,
        protected blogsRepository: BlogsRepository,
    ) {
    }

    async execute(bodyBlog: BodyBlogModel): Promise<BlogView> {
        // await validateOrRejectFunc(bodyBlog, BodyBlogModel)
        const newBlog = this.BlogsModel.createBlog(
            bodyBlog,
            this.BlogsModel
        )
        await this.blogsRepository.saveDocument(newBlog)

        const newBlogView = this.createBlogView(newBlog)

        return newBlogView
    }

    private createBlogView(blog: BlogsDocument) {
        const createdBlog = {
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: false,
        }

        return createdBlog
    }
}