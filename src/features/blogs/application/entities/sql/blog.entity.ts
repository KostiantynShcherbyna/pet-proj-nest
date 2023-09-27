import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { CreateBlogCommand } from "../../../../blogger/application/use-cases/mongoose/create-blog.use-case"
import { AggregateRoot, IEvent } from "@nestjs/cqrs"
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

  @Column({ default: false })
  IsMembership: boolean

  @Column()
  CreatedAt: string

  @Column({ nullable: true, type: "uuid" })
  UserId: string

  @Column({ nullable: true })
  UserLogin: string

  @Column({ default: false })
  IsBanned: boolean

  @Column({ nullable: true, default: null })
  BanDate: string


  static createBlog(bodyBlog: CreateBlogCommand, login: string, timeStamp: string): BlogEntity {
    const blog = new BlogEntity()
    blog.Name = bodyBlog.name
    blog.Description = bodyBlog.description
    blog.WebsiteUrl = bodyBlog.websiteUrl
    blog.CreatedAt = timeStamp
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
  constructor(public blog: BlogEntity) {
  }
}

class UpdateBlogEvent {
  constructor(public blog: BlogEntity) {
  }
}

export class DeleteBlogEvent extends AggregateRoot {
  constructor(public blog: BlogEntity) {
    super()
    this.autoCommit = true;
  }
}
