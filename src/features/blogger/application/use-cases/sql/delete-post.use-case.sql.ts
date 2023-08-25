import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Posts, PostsModel } from "../../../../posts/application/entites/mongoose/posts.schema"
import { PostsRepository } from "../../../../posts/repository/mongoose/posts.repository"
import { BlogsRepository } from "../../../../blogs/repository/mongoose/blogs.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { PostsRepositorySql } from "../../../../posts/repository/sql/posts.repository.sql"
import { BlogsRepositorySql } from "../../../../blogs/repository/sql/blogs.repository.sql"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"


export class DeletePostCommandSql {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {
  }
}

@CommandHandler(DeletePostCommandSql)
export class DeletePostSql implements ICommandHandler<DeletePostCommandSql> {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected postsRepositorySql: PostsRepositorySql,
    protected blogsRepositorySql: BlogsRepositorySql,
  ) {
  }

  async execute(command: DeletePostCommandSql): Promise<Contract<null | boolean>> {

    const foundBlog = await this.blogsRepositorySql.findBlog(command.blogId)
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBlog.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    const post = await this.postsRepositorySql.findPost(command.postId)
    if (post === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND)
    if (post.blogId !== command.blogId) return new Contract(null, ErrorEnums.FOREIGN_POST)

    // const deletedPostResult = await this.PostsModel.deleteOne({ _id: new Types.ObjectId(command.postId) })
    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.startTransaction()
      await this.postsRepositorySql.deleteLikes(command.postId, queryRunner)
      await this.postsRepositorySql.deletePost(command.postId, queryRunner)
      await queryRunner.commitTransaction()
    } catch (e) {
      console.log("DeletePostSql", e)
      await queryRunner.rollbackTransaction()
    } finally {
      await queryRunner.release()
    }

    return new Contract(true, null)
  }

}