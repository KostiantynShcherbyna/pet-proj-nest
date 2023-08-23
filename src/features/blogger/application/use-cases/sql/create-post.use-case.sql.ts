import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { LikeStatus } from "../../../../../infrastructure/utils/constants"
import { BlogsRepositorySql } from "../../../../blogs/repository/sql/blogs.repository.sql"
import { PostsRepositorySql } from "../../../../posts/repository/sql/posts.repository.sql"

export class CreatePostCommandSql {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public userId: string
  ) {
  }
}

@CommandHandler(CreatePostCommandSql)
export class CreatePostSql implements ICommandHandler<CreatePostCommandSql> {
  constructor(
    protected blogsRepositorySql: BlogsRepositorySql,
    protected postsRepositorySql: PostsRepositorySql,
  ) {
  }

  async execute(command: CreatePostCommandSql): Promise<Contract<null | string>> {

    const foundBlog = await this.blogsRepositorySql.findBlog(command.blogId)
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBlog.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    const newPostId = await this.postsRepositorySql.createPost(
      {
        title: command.title,
        shortDescription: command.shortDescription,
        content: command.content,
        blogName: foundBlog.name,
        blogId: command.blogId,
        likesCount: 0,
        dislikesCount: 0,
      }
    )
    return new Contract(newPostId, null)
  }
}