import { CommandHandler, EventBus, EventPublisher, ICommandHandler } from "@nestjs/cqrs"
import { Blogs, BlogsModel } from "../../../../blogs/application/entities/mongoose/blogs.schema"
import { Posts, PostsModel } from "../../../../posts/application/entites/mongoose/posts.schema"
import { InjectModel } from "@nestjs/mongoose"
import { BlogsRepository } from "../../../../blogs/repository/mongoose/blogs.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/typeorm/blogs.repository.orm"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { PostsRepositoryOrm } from "../../../../posts/repository/typeorm/posts.repository.orm"
import { DeleteBlogEvent } from "../../../../blogs/application/entities/sql/blog.entity"

export class DeleteBlogCommandSql {
  constructor(
    public blogId: string,
    public userId: string
  ) {
  }
}

@CommandHandler(DeleteBlogCommandSql)
export class DeleteBlogSql implements ICommandHandler<DeleteBlogCommandSql> {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private publisher: EventPublisher,
    private eventBus: EventBus,
    protected blogsRepositorySql: BlogsRepositoryOrm,
    protected postsRepositorySql: PostsRepositoryOrm,
  ) {
  }

  async execute(command: DeleteBlogCommandSql): Promise<Contract<null | boolean>> {

    const foundBlog = await this.blogsRepositorySql.findBlogEntity(command.blogId)
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBlog.UserId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      await this.postsRepositorySql.deletePosts(command.blogId, queryRunner)
      await this.blogsRepositorySql.deleteBlog(command.blogId, queryRunner)
      await queryRunner.commitTransaction()
      // const deleteBlogEvent = this.publisher.mergeObjectContext(new DeleteBlogEvent(foundBlog))
      // deleteBlogEvent.getUncommittedEvents().forEach(e => this.eventBus.publish(e))
      this.eventBus.publish(new DeleteBlogEvent(foundBlog))
    } catch (e) {
      console.log("DeleteBlogSql", e)
      await queryRunner.rollbackTransaction()
    } finally {
      await queryRunner.release()
    }
    return new Contract(true, null)
  }
}