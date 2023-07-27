import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Contract } from "src/contract";
import { CommentDto } from "src/dto/comment.dto";
import { BodyPostInputModel } from "src/input-models/body/body-post.input-model";
import { BlogsRepository } from "src/repositories/blogs.repository";
import { CommentsRepository } from "src/repositories/comments.repository";
import { PostsRepository } from "src/repositories/posts.repository";
import { CommentsQueryRepository } from "src/repositories/query/comments.query.repository";
import { Comments, CommentsModel } from "src/schemas/comments.schema";
import { Posts, PostsModel } from "src/schemas/posts.schema";
import { LikeStatus } from "src/utils/constants/constants";
import { ErrorEnums } from "src/utils/errors/error-enums";
import { dtoManager } from "src/utils/managers/dto.manager";
import { CommentView } from "src/views/comment.view";
import { PostView } from "src/views/post.view";
import { UsersRepository } from "../repositories/users.repository";

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
    @Inject(PostsRepository) protected postsRepository: PostsRepository,
    @Inject(UsersRepository) protected usersRepository: UsersRepository,
    @Inject(CommentsQueryRepository) protected commentsQueryRepository: CommentsQueryRepository,
    @Inject(CommentsRepository) protected commentsRepository: CommentsRepository,
  ) {
  }


  async createPost(bodyPost: BodyPostInputModel): Promise<Contract<null | PostView>> {

    const foundBlog = await this.blogsRepository.findBlog(bodyPost.blogId);
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND);

    const newPost = this.PostsModel.createPost(
      bodyPost,
      bodyPost.blogId,
      foundBlog.name,
      this.PostsModel
    );
    await this.postsRepository.saveDocument(newPost);

    const newPostView = dtoManager.changePostView(newPost, LikeStatus.None);
    return new Contract(newPostView, null);
  }


  async updatePost(body: BodyPostInputModel, id: string): Promise<Contract<null | boolean>> {

    const post = await this.postsRepository.findPost(id);
    if (post === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND);

    post.updatePost(body);
    await this.postsRepository.saveDocument(post);

    return new Contract(true, null);
  }


  async deletePost(id: string): Promise<Contract<null | boolean>> {

    const deletedPostContract = await this.PostsModel.deletePost(id, this.PostsModel)
    if (deletedPostContract === 0) return new Contract(null, ErrorEnums.POST_NOT_DELETED);

    return new Contract(true, null);
  }


  async createComment({ userId, postId, content }: CommentDto): Promise<Contract<CommentView | null>> {

    const userDto = ["_id", new Types.ObjectId(userId)]
    const user = await this.usersRepository.findUser(userDto)
    if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const foundPost = await this.postsRepository.findPost(postId)
    if (foundPost === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND)

    const newComment = this.CommentsModel.createComment(postId, content, user, this.CommentsModel)
    await this.commentsRepository.saveDocument(newComment)

    const foundCommentContract = await this.commentsQueryRepository.findComment(newComment.id)
    if (foundCommentContract.error === ErrorEnums.COMMENT_NOT_FOUND) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)

    return new Contract(foundCommentContract.data, null)
  }


  async updateLike(userId: string, postId: string, newLikeStatus: string) {
    const post = await this.postsRepository.findPost(postId);
    if (post === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND);

    const userDto = ["_id", new Types.ObjectId(userId)];
    const user = await this.usersRepository.findUser(userDto);
    if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND);

    // Create a new Like if there is no Like before or update Like if there is one
    post.createOrUpdateLike(user, newLikeStatus);
    await this.postsRepository.saveDocument(post);

    return new Contract(true, null);
  }


}

