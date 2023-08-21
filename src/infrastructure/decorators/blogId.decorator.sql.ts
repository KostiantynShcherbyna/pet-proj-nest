import { Injectable, } from "@nestjs/common"
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator"
import { BlogsRepository } from "../../features/blogs/repository/mongoose/blogs.repository"
import { BlogsRepositorySql } from "../../features/blogs/repository/sql/blogs.repository.sql"


@ValidatorConstraint({ name: "BlogIdIsExistSql", async: true })
@Injectable()
export class BlogIdIsExistSql implements ValidatorConstraintInterface {
  constructor(
    protected readonly blogsRepositorySql: BlogsRepositorySql,
  ) {
  }

  async validate(blogId: string) {
    const foundBLog = await this.blogsRepositorySql.findBlog(blogId)
    return !!foundBLog
  }

  defaultMessage(): string {
    return "Blog not found"
  }
}