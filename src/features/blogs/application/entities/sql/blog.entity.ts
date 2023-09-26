import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { CreateBlogCommand } from "../../../../blogger/application/use-cases/mongoose/create-blog.use-case"
import { AggregateRoot } from "@nestjs/cqrs"
import { UpdateBlogBodyInputModel } from "../../../../blogger/api/models/input/update-blog.body.input-model"


@Entity()
export class BlogEntity extends AggregateRoot {

  @PrimaryGeneratedColumn("uuid")
  BlogId: string

  @Column()
  Name: string

  @Column()
  Description: string

  @Column()
  WebsiteUrl: string

  @Column()
  IsMembership: boolean

  @Column()
  CreatedAt: string

  @Column({ nullable: true, type: "uuid" })
  UserId: string

  @Column({ nullable: true })
  UserLogin: string

  @Column({ nullable: true })
  IsBanned: boolean

  @Column({ nullable: true })
  BanDate: string


  static createBlog(bodyBlog: CreateBlogCommand, login: string): BlogEntity {
    const blog = new BlogEntity()
    blog.Name = bodyBlog.name
    blog.Description = bodyBlog.description
    blog.WebsiteUrl = bodyBlog.websiteUrl
    blog.UserId = bodyBlog.userId
    blog.UserLogin = login

    blog.apply(new CreateBlogEvent(blog))

    return blog
  }

  updateBlog(bodyBlog: UpdateBlogBodyInputModel): void {
    this.Name = bodyBlog.name
    this.Description = bodyBlog.description
    this.WebsiteUrl = bodyBlog.websiteUrl

    this.apply(new UpdateBlogEvent(this))
  }

}

class CreateBlogEvent {
  constructor(public newBlog: BlogEntity) {
  }
}

class UpdateBlogEvent {
  constructor(public blog: BlogEntity) {
  }
}
