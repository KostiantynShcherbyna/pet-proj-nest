import { Injectable } from "@nestjs/common"
import { Contract } from "src/contract"
import { BodyBlogModel } from "src/models/body/body-blog.model"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { ErrorEnums } from "src/utils/errors/error-enums"

@Injectable()
export class UpdateBlog {
    constructor(
        protected blogsRepository: BlogsRepository,
    ) {
    }

    async execute(id: string, bodyBlog: BodyBlogModel): Promise<Contract<null | boolean>> {
        // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

        const blog = await this.blogsRepository.findBlog(id)
        if (blog === null)
            return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)

        blog.updateBlog(bodyBlog)
        await this.blogsRepository.saveDocument(blog)

        return new Contract(true, null)
    }
}