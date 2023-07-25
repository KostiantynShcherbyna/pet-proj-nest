import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "src/contract"
import { BodyBlogInputModel } from "src/input-models/body/body-blog.input-model"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { ErrorEnums } from "src/utils/errors/error-enums"

export class UpdateBlogCommand {
    constructor(
        public blogId: string,
        public bodyBlog: BodyBlogInputModel,
        public userId: string,
    ) { }
}


@CommandHandler(UpdateBlogCommand)
export class UpdateBlog implements ICommandHandler<UpdateBlogCommand>{
    constructor(
        protected blogsRepository: BlogsRepository,
    ) {
    }

    async execute(command: UpdateBlogCommand): Promise<Contract<null | boolean>> {
        // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

        const foundBlog = await this.blogsRepository.findBlog(command.blogId)
        if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND);
        if (foundBlog.blogOwnerInfo.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG_NOT_DELETE_POST);

        foundBlog.updateBlog(command.bodyBlog)
        await this.blogsRepository.saveDocument(foundBlog)

        return new Contract(true, null)
    }
}