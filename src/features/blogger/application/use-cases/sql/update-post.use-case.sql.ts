import { UpdatePostBodyInputModel } from "../../../api/models/input/update-post.body.input-model"
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { PostsRepositoryOrm } from "../../../../posts/repository/typeorm/posts.repository.orm"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"

export class UpdatePostCommandSql {
  constructor(
    public body: UpdatePostBodyInputModel,
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {
  }
}

@CommandHandler(UpdatePostCommandSql)
export class UpdatePostSql implements ICommandHandler<UpdatePostCommandSql> {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected eventBus: EventBus,
    protected postsRepositorySql: PostsRepositoryOrm,
    protected blogsRepositorySql: BlogsRepositoryOrm,
  ) {
  }

  async execute(command: UpdatePostCommandSql): Promise<Contract<null | boolean>> {

    const foundBlog = await this.blogsRepositorySql.findBlogEntity(command.blogId)
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBlog.UserId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    const post = await this.postsRepositorySql.findPostEntity(command.postId)
    if (post === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND)
    if (post.BlogId !== command.blogId) return new Contract(null, ErrorEnums.FOREIGN_POST)

    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      post.updatePost(command.body)
      await this.postsRepositorySql.savePost(post, queryRunner.manager)
      await queryRunner.commitTransaction()
      post.getUncommittedEvents().forEach(e => this.eventBus.publish(e))
    } catch (e) {
      console.log("UpdatePostSql", e)
      await queryRunner.rollbackTransaction()
      return new Contract(null, ErrorEnums.POST_NOT_UPDATED)
    } finally {
      await queryRunner.release()
    }
    return new Contract(true, null)
  }


}