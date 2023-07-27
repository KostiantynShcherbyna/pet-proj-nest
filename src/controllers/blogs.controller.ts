import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { DeviceSessionOptional } from "src/decorators/device-session-optional.decorator"
import { BasicGuard } from "src/guards/basic.guard"
import { BodyBlogPostInputModel } from "src/input-models/body/body-blog-post.input-model"
import { QueryPostInputModel } from "src/input-models/query/query-post.input-model"
import { PostsQueryRepository } from "src/repositories/query/posts.query.repository"
import { CreatePostBlogger } from "src/use-cases/blogger/create-post.use-case"
import { CreateBlogCommand } from "src/use-cases/blogger/create-blog.use-case"
import { DeleteBlogCommand } from "src/use-cases/blogger/delete-blog.use-case"
import { UpdateBlogCommand } from "src/use-cases/blogger/update-blog.use-case"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { callErrorMessage } from "src/utils/managers/error-message.manager"
import { AccessMiddleware } from "../guards/access.middleware"
import { BodyBlogInputModel } from "../input-models/body/body-blog.input-model"
import { QueryBlogInputModel } from "../input-models/query/query-blog.input-model"
import { DeviceSessionOptionalInputModel } from "../input-models/request/device-session-optional.input-model"
import { BlogIdInputModel } from "../input-models/uri/blogId.input-model"
import { IdInputModel } from "../input-models/uri/id.input-model"
import { BlogsQueryRepository } from "../repositories/query/blogs.query.repository"
import { BlogsService } from "../services/blogs.service"

@Controller("blogs")
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected transactionScriptService: CreatePostBlogger,
    private commandBus: CommandBus,
  ) {
  }

  @Get()
  async findBlogs(
    @Query() queryBlog: QueryBlogInputModel
  ) {
    return await this.blogsQueryRepository.findBlogs(queryBlog)
  }


  // @UseGuards(AccessMiddleware)
  // @Get(":blogId/posts")
  // async findPosts(
  //   @DeviceSessionOptional() deviceSession: DeviceSessionOptionalInputModel,
  //   @Param() param: BlogIdInputModel,
  //   @Query() queryPost: QueryPostInputModel,
  // ) {
  //   const postsContract = await this.postsQueryRepository.findPosts(
  //     queryPost,
  //     deviceSession.userId,
  //     param.blogId,
  //   )
  //   if (postsContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
  //     callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
  //   )
  //   if (postsContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException()
  //   return postsContract.data
  // }
  @UseGuards(AccessMiddleware)
  @Get(":blogId/posts")
  async findPosts(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalInputModel,
    @Param() param: BlogIdInputModel,
    @Query() queryPost: QueryPostInputModel,
  ) {
    const postsContract = await this.postsQueryRepository.findPosts(
      queryPost,
      deviceSession.userId,
      param.blogId,
    )
    if (postsContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
    )
    if (postsContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException()
    return postsContract.data
  }


  @Get(":id")
  async findBlog(
    @Param() param: IdInputModel,
  ) {
    const foundBlogView = await this.blogsQueryRepository.findBlog(param.id)

    if (foundBlogView === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    return foundBlogView
  }
  // @UseGuards(BasicGuard)
  // @Post()
  // async createBlog(
  //   @Body() bodyBlog: BodyBlogInputModel
  // ) {
  //   return this.commandBus.execute(
  //     new CreateBlogCommand(
  //       bodyBlog.name,
  //       bodyBlog.description,
  //       bodyBlog.websiteUrl
  //     )
  //   )
  // }


  // @UseGuards(BasicGuard)
  // @Put(":id")
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async updateBlog(
  //   @Param() param: IdInputModel,
  //   @Body() bodyBlog: BodyBlogInputModel
  // ) {
  //   console.log(param)
  //   const result = await this.commandBus.execute(
  //     new UpdateBlogCommand(
  //       param.id,
  //       bodyBlog
  //     )
  //   )
  //   if (result.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
  //     callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
  //   )
  //   return
  // }

  // @UseGuards(BasicGuard)
  // @Delete(":id")
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteBlog(
  //   @Param() param: IdInputModel
  // ) {
  //   const deleteBlogResult = await this.commandBus.execute(
  //     new DeleteBlogCommand(param.id)
  //   )
  //   if (deleteBlogResult.error === ErrorEnums.BLOG_NOT_DELETED) throw new NotFoundException(
  //     callErrorMessage(ErrorEnums.BLOG_NOT_DELETED, "id")
  //   )
  //   if (deleteBlogResult.error === ErrorEnums.BLOG_NOT_DELETED) throw new NotFoundException(
  //     callErrorMessage(ErrorEnums.POSTS_NOT_DELETED, "id")
  //   )
  //   return
  // }



  // @UseGuards(BasicGuard)
  // @Post(":blogId/posts")
  // async createPost(
  //   @Param() param: BlogIdInputModel,
  //   @Body() bodyBlogPost: BodyBlogPostInputModel
  // ) {
  //   const result = await this.transactionScriptService.createPost(
  //     {
  //       blogId: param.blogId,
  //       title: bodyBlogPost.title,
  //       shortDescription: bodyBlogPost.shortDescription,
  //       content: bodyBlogPost.content,
  //     }
  //   )
  //   if (result.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
  //     callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
  //   )
  //   return result.data
  // }
}
