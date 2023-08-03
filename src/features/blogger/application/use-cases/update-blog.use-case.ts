import { UpdateBlogBodyInputModel } from "../../api/models/input/update-blog.body.input-model"
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { BlogsRepository } from "../../../blogs/infrastructure/blogs.repository"
import { Contract } from "../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"


export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public bodyBlog: UpdateBlogBodyInputModel,
    public userId: string,
  ) {
  }
}


@CommandHandler(UpdateBlogCommand)
export class UpdateBlogBlogger implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
  ) {
  }

  async execute(command: UpdateBlogCommand): Promise<Contract<null | boolean>> {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

    const foundBlog = await this.blogsRepository.findBlog(command.blogId)
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBlog.blogOwnerInfo.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    foundBlog.updateBlog(command.bodyBlog)
    await this.blogsRepository.saveDocument(foundBlog)

    return new Contract(true, null)
  }
}