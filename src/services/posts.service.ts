import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Contract } from "src/contracts/Contract";
import { BodyPostModel } from "src/models/body/BodyPostModel";
import { BlogsRepository } from "src/repositories/blogs.repository";
import { PostsRepository } from "src/repositories/posts.repository";
import { Posts, PostsModel } from "src/schemas/posts.schema";
import { MyStatus } from "src/utils/constants/constants";
import { ErrorEnums } from "src/utils/errors/errorEnums";
import { dtoModify } from "src/utils/modify/dtoModify";
import { PostView } from "src/views/PostView";
import { UsersRepository } from "../repositories/users.repository";
import { Comments, CommentsModel } from "src/schemas/comments.schema";
import { CommentsQueryRepository } from "src/repositories/query/comments.query.repository";
import { CommentView } from "src/views/CommentView";

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
    @Inject(PostsRepository) protected postsRepository: PostsRepository,
    @Inject(UsersRepository) protected usersRepository: UsersRepository,
    @Inject(CommentsQueryRepository) protected commentsQueryRepository: CommentsQueryRepository,
  ) {
  }


  async createPost(bodyPost: BodyPostModel): Promise<Contract<null | PostView>> {

    const foundBlog = await this.blogsRepository.findBlog(bodyPost.blogId);
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND);

    const newPost = this.PostsModel.createPost(bodyPost, foundBlog.name, this.PostsModel);
    await this.postsRepository.saveDocument(newPost);

    const newPostView = dtoModify.changePostViewMngs(newPost, MyStatus.None);
    return new Contract(newPostView, null);
  }


  async updatePost(body: BodyPostModel, id: string): Promise<Contract<null | boolean>> {

    const post = await this.postsRepository.findPost(id);
    if (post === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND);

    post.updatePost(body);
    await this.postsRepository.saveDocument(post);

    return new Contract(true, null);
  }

  async deletePost(id: string): Promise<Contract<null | boolean>> {

    const deletedPostResult = await this.PostsModel.deleteOne({ _id: new Types.ObjectId(id) });
    if (deletedPostResult.deletedCount === 0) return new Contract(null, ErrorEnums.POST_NOT_DELETED);

    return new Contract(true, null);
  }

  async createComment(userId: string, postId: string, content: string): Promise<Contract<CommentView | null>> {

    const userDto = ["_id", new Types.ObjectId(userId)]
    const user = await this.usersRepository.findUser(userDto)
    if (user === null) return new Contract(null, ErrorEnums.USER_NOT_FOUND)

    const foundPost = await this.postsRepository.findPost(postId)
    if (foundPost === null) return new Contract(null, ErrorEnums.POST_NOT_FOUND)

    const newComment = this.CommentsModel.createComment(postId, content, user, this.CommentsModel)

    const foundCommentView = await this.commentsQueryRepository.findComment(newComment.id)
    if (foundCommentView === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)

    console.log(ErrorEnums.COMMENT_NOT_FOUND)

    return new Contract(foundCommentView, null)
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

