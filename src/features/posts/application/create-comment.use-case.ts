import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Contract } from "src/infrastructure/utils/contract"
import { BannedBlogUsersRepository } from "src/features/blogger/infrastructure/banned-blog-users.repository"
import { CommentsRepository } from "src/features/comments/infrastructure/comments.repository"
import { PostsCommentsRepository } from "src/features/blogger/infrastructure/posts-comments.repository"
import { PostsRepository } from "src/features/posts/infrastructure/posts.repository"
import { CommentsQueryRepository } from "src/features/comments/infrastructure/comments.query.repository"
import { UsersRepository } from "src/features/super-admin/infrastructure/users.repository"
import { Comments, CommentsModel } from "src/infrastructure/schemas/comments.schema"
import { PostsComments, PostsCommentsModel } from "src/infrastructure/schemas/posts-comments.schema"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"
import { GetCommentsOutputModel } from "src/features/comments/api/models/output/get-comments.output-model"

export class CreateCommentCommand {
  constructor(
    public userId: string,
    public postId: string,
    public content: string,
  ) {
  }
}

@CommandHandler(CreateCommentCommand)
export class CreateComment implements ICommandHandler<CreateCommentCommand> {
  constructor(
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    @InjectModel(PostsComments.name) protected PostsCommentsModel: PostsCommentsModel,
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
    protected commentsRepository: CommentsRepository,
    protected postsCommentsRepository: PostsCommentsRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected bannedBlogUsersRepository: BannedBlogUsersRepository,
  ) {
  }

  async execute(command: CreateCommentCommand): Promise<Contract<GetCommentsOutputModel | null>> {

    const userDto = ["_id", new Types.ObjectId(command.userId)]
    const user = await this.usersRepository.findUser(userDto)
    if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const foundPost = await this.postsRepository.findPost(command.postId)
    if (foundPost === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND)

    // BANNED USER CANT'T PAST COMMENT
    const bloggerBannedUser = await this.bannedBlogUsersRepository.findBannedBlogUser(command.userId, foundPost.blogId)
    if (bloggerBannedUser !== null) return new Contract(null, ErrorEnums.USER_IS_BANNED)


    const newComment = this.CommentsModel.createComment(command.postId, command.content, user, this.CommentsModel)
    await this.commentsRepository.saveDocument(newComment)

    const newPostsComment = this.PostsCommentsModel.createPostComment(
      command.postId,
      command.content,
      user,
      this.PostsCommentsModel,
      newComment._id,
      foundPost.title,
      foundPost.blogId,
      foundPost.blogName,
      newComment.createdAt,
    )

    await this.commentsRepository.saveDocument(newComment)
    await this.postsCommentsRepository.saveDocument(newPostsComment)

    const foundCommentContract = await this.commentsQueryRepository.findComment(newComment.id)
    if (foundCommentContract.error === ErrorEnums.COMMENT_NOT_FOUND) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)

    return new Contract(foundCommentContract.data, null)
  }


}