import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Posts, PostsDocument, PostsModel } from "../../../../posts/application/entites/mongoose/posts.schema"
import { InjectModel } from "@nestjs/mongoose"
import { BlogsRepository } from "../../../../blogs/repository/mongoose/blogs.repository"
import { PostsRepository } from "../../../../posts/repository/mongoose/posts.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { CreateBloggerPostOutputModel } from "../../../api/models/output/create-blogger-post.output-model"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { LikeStatus } from "../../../../../infrastructure/utils/constants"

export class CreatePostCommand {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public userId: string
  ) {
  }
}


@CommandHandler(CreatePostCommand)
export class CreatePostBlogger implements ICommandHandler<CreatePostCommand> {
  constructor(
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
  ) {
  }

  async execute(command: CreatePostCommand): Promise<Contract<null | CreateBloggerPostOutputModel>> {

    const foundBlog = await this.blogsRepository.findBlog(command.blogId)
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (foundBlog.blogOwnerInfo.userId !== command.userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG)

    const createDto = {
      title: command.title,
      shortDescription: command.shortDescription,
      content: command.content,
    }

    const newPost = this.PostsModel.createPost(
      createDto,
      command.blogId,
      foundBlog.name,
      this.PostsModel
    )
    await this.postsRepository.saveDocument(newPost)

    const newPostView = this.changePostView(newPost, LikeStatus.None)
    return new Contract(newPostView, null)
  }


  private changePostView(post: PostsDocument, myStatus: string) {
    const newestLikes = (post: PostsDocument) => post.extendedLikesInfo.newestLikes
      .slice(-3)
      .map(like => {
        return {
          addedAt: like.addedAt,
          userId: like.userId,
          login: like.login
        }
      }).reverse()

    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus: myStatus,
        newestLikes: newestLikes(post),
      },
    }
  }
}