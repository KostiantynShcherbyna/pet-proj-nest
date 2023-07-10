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
import { postView } from "src/views/postView";
import { UsersRepository } from "../repositories/users.repository";

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
    @Inject(PostsRepository) protected postsRepository: PostsRepository,
    @Inject(UsersRepository) protected usersRepository: UsersRepository
  ) {
  }


  async createPost(bodyPostModel: BodyPostModel): Promise<Contract<null | postView>> {

    const foundBlog = await this.blogsRepository.findBlog(bodyPostModel.blogId);
    if (foundBlog === null) return new Contract(null, ErrorEnums.NOT_FOUND_BLOG);

    const newPost = this.PostsModel.createPost(bodyPostModel, foundBlog.name, this.PostsModel);
    await this.postsRepository.saveDocument(newPost);

    const newPostView = dtoModify.changePostViewMngs(newPost, MyStatus.None);
    return new Contract(newPostView, null);
  }


  async updatePost(body: BodyPostModel, id: string): Promise<Contract<null | boolean>> {

    const post = await this.postsRepository.findPost(id);
    if (post === null) return new Contract(null, ErrorEnums.NOT_FOUND_POST);

    post.updatePost(body);
    await this.postsRepository.saveDocument(post);

    return new Contract(true, null);
  }

  async deletePost(id: string): Promise<Contract<null | boolean>> {

    const deletedPostResult = await this.PostsModel.deleteOne({ _id: new Types.ObjectId(id) });
    if (deletedPostResult.deletedCount === 0) return new Contract(null, ErrorEnums.NOT_FOUND_POST);

    return new Contract(true, null);
  }


  async updateLike(userId: string, postId: string, newLikeStatus: string) {
    const post = await this.postsRepository.findPost(postId);
    if (post === null) return new Contract(null, ErrorEnums.NOT_FOUND_POST);

    const userDto = ["_id", new Types.ObjectId(userId)];
    const user = await this.usersRepository.findUser(userDto);
    if (user === null) return new Contract(null, ErrorEnums.NOT_FOUND_USER);

    // Create a new Like if there is no Like before or update Like if there is one
    post.createOrUpdateLike(user, newLikeStatus);
    await this.postsRepository.saveDocument(post);

    return new Contract(true, null);
  }


}

