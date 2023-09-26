import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { LikeStatus } from "../../../../../infrastructure/utils/constants"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"
import { PostsRepositoryOrm } from "../../../../posts/repository/typeorm/posts.repository.orm"
import { PostEntity } from "../../../../posts/application/entites/typeorm/post.entity"
import { DataSource } from "typeorm"

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
    protected dataSource: DataSource,
    protected eventBus: EventBus,
    protected blogsRepositorySql: BlogsRepositoryOrm,
    protected postsRepositorySql: PostsRepositoryOrm,
  ) {
  }

  async execute(command: CreatePostCommandSql): Promise<Contract<null | string>> {

    const foundBlog = await this.blogsRepositorySql.findBlog(command.blogId)
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBlog.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    const timeStamp = new Date(Date.now()).toISOString()

    const post = PostEntity.createPost({
      title: command.title,
      shortDescription: command.shortDescription,
      content: command.content,
      blogName: foundBlog.name,
      blogId: command.blogId,
      createdAt: timeStamp,
    })

    const newPost = await this.dataSource.manager.transaction(
      async manager => await this.postsRepositorySql.savePost(post, manager))
    post.getUncommittedEvents().forEach(e => this.eventBus.publish(e))

    return new Contract(newPost.PostId, null)
  }
}