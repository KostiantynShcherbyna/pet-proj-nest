import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { PostLikeEntity } from "./post-like.entity"
import { BlogEntity } from "../../../../blogs/application/entities/sql/blog.entity"
import { AggregateRoot } from "@nestjs/cqrs"
import { UpdatePostBodyInputModel } from "../../../../blogger/api/models/input/update-post.body.input-model"

@Entity()
export class PostEntity extends AggregateRoot {

  @PrimaryGeneratedColumn("uuid")
  PostId: string

  @Column({ nullable: false })
  Content: string

  @Column({ nullable: false })
  Title: string

  @Column({ nullable: false })
  ShortDescription: string

  @Column({ type: "uuid", nullable: false })
  BlogId: string

  @Column({ nullable: false })
  BlogName: string

  @Column({ nullable: false })
  CreatedAt: string

  @JoinColumn({ name: "PostId" })
  @OneToMany(() => PostLikeEntity, pl => pl.PostId)
  PostLikeEntity: PostLikeEntity

  static createPost({ title, shortDescription, content, blogId, blogName, createdAt }): PostEntity {
    const post = new PostEntity()
    post.Title = title
    post.ShortDescription = shortDescription
    post.Content = content
    post.BlogId = blogId
    post.BlogName = blogName
    post.CreatedAt = createdAt

    post.apply(new CreatePostEvent(post))

    return post
  }

  updatePost(body: UpdatePostBodyInputModel) {
    this.Title = body.title
    this.ShortDescription = body.shortDescription
    this.Content = body.content

    this.apply(new UpdatePostEvent(this))
  }

}

class CreatePostEvent {
  constructor(public newPost: PostEntity) {
  }
}

class UpdatePostEvent {
  constructor(public post: PostEntity) {
  }
}

export class DeletePostEvent extends AggregateRoot {
  constructor(public post: PostEntity) {
    super()
    this.autoCommit = true
  }
}

