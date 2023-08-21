import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Blogs, BlogsDocument, BlogsModel } from "../../../../blogs/application/entities/mongoose/blogs.schema"
import { InjectModel } from "@nestjs/mongoose"
import { BlogsRepository } from "../../../../blogs/repository/mongoose/blogs.repository"
import { UsersRepository } from "../../../../sa/repository/mongoose/users.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { CreateBloggerBlogOutputModel } from "../../../api/models/output/create-blogger-blog.output-model"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { Types } from "mongoose"

export class CreateBlogCommand {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public userId: string,
  ) {
  }
}


@CommandHandler(CreateBlogCommand)
export class CreateBlogBlogger implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
  ) {
  }

  async execute(command: CreateBlogCommand): Promise<Contract<null | CreateBloggerBlogOutputModel>> {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

    const foundUser = await this.usersRepository.findUser(["_id", new Types.ObjectId(command.userId)])
    if (foundUser === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const newBlog = this.BlogsModel.createBlog(
      command,
      foundUser.accountData.login,
      this.BlogsModel
    )
    await this.blogsRepository.saveDocument(newBlog)

    const newBlogView = this.createBlogView(newBlog)

    return new Contract(newBlogView, null)
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