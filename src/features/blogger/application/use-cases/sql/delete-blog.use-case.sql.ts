import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Blogs, BlogsModel } from "../../../../blogs/application/entities/mongoose/blogs.schema"
import { Posts, PostsModel } from "../../../../posts/application/entites/mongoose/posts.schema"
import { InjectModel } from "@nestjs/mongoose"
import { BlogsRepository } from "../../../../blogs/repository/mongoose/blogs.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { BlogsRepositoryOrm } from "../../../../blogs/repository/orm/blogs.repository.orm"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { PostsRepositoryOrm } from "../../../../posts/repository/orm/posts.repository.orm"

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
    protected blogsRepositorySql: BlogsRepositoryOrm,
    protected postsRepositorySql: PostsRepositoryOrm,
  ) {
  }

  async execute(command: DeleteBlogCommandSql): Promise<Contract<null | boolean>> {

    const foundBlog = await this.blogsRepositorySql.findBlog(command.blogId)
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBlog.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      await this.blogsRepositorySql.deleteBlog(command.blogId, queryRunner)
      await this.postsRepositorySql.deletePosts(command.blogId, queryRunner)
      await queryRunner.commitTransaction()
    } catch (e) {
      console.log("DeleteBlogSql", e)
      await queryRunner.rollbackTransaction()
    } finally {
      await queryRunner.release()
    }
    return new Contract(true, null)
  }
}