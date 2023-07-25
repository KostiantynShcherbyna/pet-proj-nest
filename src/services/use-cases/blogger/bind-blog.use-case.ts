import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "src/contract"
import { BodyPostInputModel } from "src/input-models/body/body-post.input-model"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { ErrorEnums } from "src/utils/errors/error-enums"

export class BindBlogCommand {
    constructor(
        public id: string,
        public userId: string
    ) { }
}


@CommandHandler(BindBlogCommand)
export class BindBlog implements ICommandHandler<BindBlogCommand>{
    constructor(
        protected blogsRepository: BlogsRepository,
    ) {
    }

    async execute(command: BindBlogCommand): Promise<Contract<null | boolean>> {
        // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

        const blog = await this.blogsRepository.findBlog(command.id)
        if (blog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)

        blog.bindBlog(command.userId)
        await this.blogsRepository.saveDocument(blog)

        return new Contract(true, null)
    }
}