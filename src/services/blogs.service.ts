import { HttpException, Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { Contract } from "src/contracts/Contract"
import { BodyBlogModel } from "src/models/body/BodyBlogModel"
import { BodyBlogPostModel } from "src/models/body/BodyBlogPostModel"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { BlogsModel, Blogs, BlogsDocument } from "src/schemas/blogs.schema"
import { Posts, PostsModel } from "src/schemas/posts.schema"
import { MyStatus } from "src/utils/constants/constants"
import { ErrorEnums } from "src/utils/errors/errorEnums"
import { dtoModify } from "src/utils/modify/dtoModify"
import { validateOrRejectFunc } from "src/validateOrRejectFunc"
import { BlogView } from "src/views/BlogView"
import { PostView } from "src/views/PostView"
import { ObjectIdIdModel } from "../models/uri/ObjectId-id.model"

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
    @Inject(PostsRepository) protected postsRepository: PostsRepository,
  ) {
  }

  async createBlog(bodyBlog: BodyBlogModel): Promise<BlogView> {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)
    const newBlog = this.BlogsModel.createBlog(bodyBlog, this.BlogsModel)
    await this.blogsRepository.saveDocument(newBlog)

    const newBlogView = dtoModify.createBlogViewMngs(newBlog)

    return newBlogView
  }

  async updateBlog(id: string, bodyBlog: BodyBlogModel): Promise<Contract<null | boolean>> {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

    const blog = await this.blogsRepository.findBlog(id)
    if (blog === null) return new Contract(null, ErrorEnums.NOT_FOUND_BLOG)

    blog.updateBlog(bodyBlog)
    await this.blogsRepository.saveDocument(blog)

    return new Contract(true, null)
  }

  async deleteBlog(id: string): Promise<Contract<null | boolean>> {
    const deletedBlog = await this.BlogsModel.deleteOne({
      _id: new Types.ObjectId(id),
    })
    await this.PostsModel.deleteMany({ blogId: id })

    if (deletedBlog.deletedCount === 0)
      return new Contract(null, ErrorEnums.NOT_DELETE_BLOG)
    return new Contract(true, null)
  }

  async createPost(bodyBlogPostModel: BodyBlogPostModel, blogId: string): Promise<Contract<null | PostView>> {
    const foundBlog = await this.blogsRepository.findBlog(blogId)
    if (foundBlog === null)
      return new Contract(null, ErrorEnums.NOT_FOUND_BLOG)

    const bodyPostModelExt = {
      title: bodyBlogPostModel.title,
      shortDescription: bodyBlogPostModel.shortDescription,
      content: bodyBlogPostModel.content,
      blogId: blogId,
    }

    const newPost = this.PostsModel.createPost(
      bodyPostModelExt,
      foundBlog.name,
      this.PostsModel,
    )
    await this.postsRepository.saveDocument(newPost)

    const newPostView = dtoModify.changePostViewMngs(
      newPost,
      MyStatus.None,
    )
    return new Contract(newPostView, null)
  }
}
