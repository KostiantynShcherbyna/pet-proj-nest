import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Contract } from "src/contract"
import { BodyBlogPostInputModel } from "src/input-models/body/body-blog-post.input-model"
import { BodyBlogInputModel } from "src/input-models/body/body-blog.input-model"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { Blogs, BlogsModel } from "src/schemas/blogs.schema"
import { Posts, PostsModel } from "src/schemas/posts.schema"
import { LikeStatus } from "src/utils/constants/constants"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { dtoManager } from "src/utils/managers/dto.manager"
import { BlogView } from "src/views/blog.view"
import { PostView } from "src/views/post.view"

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
    @Inject(PostsRepository) protected postsRepository: PostsRepository,
  ) {
  }

  // async createBlog(bodyBlog: BodyBlogInputModel): Promise<BlogView> {
  //   // await validateOrRejectFunc(bodyBlog, BodyBlogModel)
  //   const newBlog = this.BlogsModel
  //     .createBlog(
  //       bodyBlog,
  //       this.BlogsModel
  //     )
  //   await this.blogsRepository.saveDocument(newBlog)

  //   const newBlogView = dtoManager.createBlogView(newBlog)

  //   return newBlogView
  // }



  async updateBlog(id: string, bodyBlog: BodyBlogInputModel): Promise<Contract<null | boolean>> {
    // await validateOrRejectFunc(bodyBlog, BodyBlogModel)

    const blog = await this.blogsRepository.findBlog(id)
    if (blog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)

    blog.updateBlog(bodyBlog)
    await this.blogsRepository.saveDocument(blog)

    return new Contract(true, null)
  }



  async deleteBlog(id: string): Promise<Contract<null | boolean>> {

    const deleteBlogContract = await Blogs
      .deleteBlog(
        id,
        this.BlogsModel,
        this.PostsModel
      )
    if (deleteBlogContract.error !== null) return new Contract(null, deleteBlogContract.error)

    return new Contract(true, null)
  }



  async createPost(bodyBlogPostModel: BodyBlogPostInputModel, blogId: string): Promise<Contract<null | PostView>> {
    const foundBlog = await this.blogsRepository.findBlog(blogId)
    if (foundBlog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)

    const newPost = this.PostsModel
      .createPost(
        bodyBlogPostModel,
        blogId,
        foundBlog.name,
        this.PostsModel,
      )
    await this.postsRepository.saveDocument(newPost)

    const newPostView = dtoManager.changePostView(newPost, LikeStatus.None)
    return new Contract(newPostView, null)
  }
}
