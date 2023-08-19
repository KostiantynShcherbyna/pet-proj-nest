import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Comments, CommentsModel } from "../../../comments/application/entities/mongoose/comments.schema"
import { PostsComments, PostsCommentsModel } from "../entites/mongoose/posts-comments.schema"
import { PostsRepository } from "../../repository/mongoose/posts.repository"
import { CommentsRepository } from "../../../comments/repository/mongoose/comments.repository"
import { PostsCommentsRepository } from "../../../blogger/repository/mongoose/posts-comments.repository"
import { BannedBlogUsersRepository } from "../../../blogger/repository/mongoose/banned-blog-users.repository"
import { CommentsQueryRepository } from "../../../comments/repository/mongoose/comments.query.repository"
import { UsersRepository } from "../../../sa/repository/mongoose/users.repository"
import { Contract } from "../../../../infrastructure/utils/contract"
import { GetCommentsOutputModel } from "../../../comments/api/models/output/get-comments.output-model"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"


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

    // BANNED USER CAN'T PAST COMMENT
    const bloggerBannedUser = await this.bannedBlogUsersRepository.findBannedBlogUser(command.userId, foundPost.blogId)
    if (bloggerBannedUser !== null) return new Contract(null, ErrorEnums.USER_IS_BANNED)


    const newComment = this.CommentsModel.createComment(command.postId, command.content, user, this.CommentsModel)

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