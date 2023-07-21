import { Injectable } from "@nestjs/common"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "src/contract"
import { BodyBlogModel } from "src/models/body/body-blog.model"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { ErrorEnums } from "src/utils/errors/error-enums"

export class UpdateBlogCommand {
    constructor(public id: string, public bodyBlog: BodyBlogModel) { }
}


@CommandHandler(UpdateBlogCommand)
export class UpdateBlog implements ICommandHandler<UpdateBlogCommand>{
    constructor(
        protected blogsRepository: BlogsRepository,
    ) {
    }

    async execute(command: UpdateBlogCommand): Promise<Contract<null | boolean>> {
        // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

        const blog = await this.blogsRepository.findBlog(command.id)
        if (blog === null)
            return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)

        blog.updateBlog(command.bodyBlog)
        await this.blogsRepository.saveDocument(blog)

        return new Contract(true, null)
    }
}