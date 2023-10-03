import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus, InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  ServiceUnavailableException,
  UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { GetBlogsQueryInputModel } from "./models/input/blogs/get-blogs.query.input-model"
import { BasicGuard } from "../../../infrastructure/guards/basic.guard"
import { ErrorEnums } from "../../../infrastructure/utils/error-enums"
import { callErrorMessage } from "../../../infrastructure/adapters/exception-message.adapter"
import { BindInputModel } from "./models/input/blogs/bind-blog.param.input-model"
import { QueryUserSAInputModel } from "./models/input/users/get-users.query.input-model"
import { CreateUserBodyInputModel } from "./models/input/users/create-user.body.input-model"
import { CreateUserSqlCommand } from "../application/use-cases/sql/create-user.use-case.sql"
import { UsersQueryRepositoryOrm } from "../repository/typeorm/users.query.repository.orm"
import { DeleteUserCommandSql } from "../application/use-cases/sql/delete-user.use-case.sql"
import { IdParamInputModelSql } from "./models/input/id.param.input-model.sql"
import { BindBlogCommandSql } from "../application/use-cases/sql/bind-blog.use-case.sql"
import { BlogsQueryRepositoryOrm } from "../../blogs/repository/typeorm/blogs.query.repository.orm"
import { AccessGuard } from "../../../infrastructure/guards/access.guard"
import { DeviceSession } from "../../../infrastructure/decorators/device-session.decorator"
import { DeviceSessionInputModel } from "../../blogger/api/models/input/device-session.input-model"
import { GetPostsCommentsQueryInputModel } from "../../blogger/api/models/input/get-posts-comments.query.input-model"
import { BanUserBodyInputModelSql } from "../../blogger/api/models/input/ban-user.body.input-model.sql"
import { BanUserBloggerCommandSql } from "../../blogger/application/use-cases/sql/ban-user-blogger.use-case.sql"
import { GetQuestionsQueryInputModel } from "./models/input/quiz/get-questions.query.input-model"
import { QuizQueryRepositoryOrm } from "../../quiz/repository/typeorm/quiz.query.repository.orm"
import { QuestionBodyInputModelSql } from "./models/input/quiz/question.body.input-model.sql"
import { QuizRepositoryOrm } from "../../quiz/repository/typeorm/quiz.repository.orm"
import { CreateQuestionsQuizCommandSql } from "../../quiz/application/use-cases/create-questions-quiz.use-case.sql"
import { QuestionPublishBodyInputModelSql } from "./models/input/quiz/question-publish.body.input-model.sql"
import { BanUserCommandSql } from "../application/use-cases/sql/ban-user.use-case.sql"
import { BanUserBodyInputModel } from "./models/input/users/ban-user.body.input-model"
import { BanBlogParamInputModelSql } from "./models/input/blogs/ban-blog.param.input-model.sql"
import { BanBlogBodyInputModel } from "./models/input/blogs/ban-blog.body.input-model"
import { BanBlogCommandSql } from "../application/use-cases/sql/ban-blog.use-case.sql"


@Controller("sa")
export class SaControllerSql {
  constructor(
    private commandBus: CommandBus,
    protected usersSqlQueryRepository: UsersQueryRepositoryOrm,
    protected blogsQueryRepositorySql: BlogsQueryRepositoryOrm,
    protected quizQueryRepositoryOrm: QuizQueryRepositoryOrm,
    protected quizRepositoryOrm: QuizRepositoryOrm,
  ) {
  }


  @UseGuards(BasicGuard)
  @Put("blogs/:id/ban")
  @HttpCode(HttpStatus.NO_CONTENT)
  async banBlog(
    @Param() param: BanBlogParamInputModelSql,
    @Body() bodyBlogBan: BanBlogBodyInputModel,
  ) {
    const banContract = await this.commandBus.execute(
      new BanBlogCommandSql(
        param.id,
        bodyBlogBan.isBanned,
      )
    )
    if (banContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    return
  }


  @UseGuards(BasicGuard)
  @Put("blogs/:id/bind-with-user/:userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindBlog(
    @Param() param: BindInputModel,
  ) {
    const foundBlogContract = await this.commandBus.execute(
      new BindBlogCommandSql(param.id, param.userId))
    if (foundBlogContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    if (foundBlogContract.error === ErrorEnums.BLOG_ALREADY_BOUND) throw new BadRequestException(
      callErrorMessage(ErrorEnums.BLOG_ALREADY_BOUND, "id")
    )
    return
  }


  // @UseGuards(BasicGuard)
  // @Get("blogs")
  // async getBlogs(
  //   @Query() queryBlog: GetBlogsQueryInputModel
  // ) {
  //   return await this.blogsQueryRepositorySql.findBlogsSA(queryBlog)
  // }


  // USERS ↓↓↓
  @UseGuards(BasicGuard)
  @Put("users/:id/ban")
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUser(
    @Param() param: IdParamInputModelSql,
    @Body() bodyUserBan: BanUserBodyInputModel
  ) {
    const banContract = await this.commandBus.execute(
      new BanUserCommandSql(
        param.id,
        bodyUserBan.isBanned,
        bodyUserBan.banReason,
      )
    )
    if (banContract.error === ErrorEnums.USER_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_FOUND, "id")
    )
    if (banContract.error === ErrorEnums.USER_NOT_BANNED) throw new InternalServerErrorException()
    return
  }

  @UseGuards(BasicGuard)
  @Get("users")
  async getUsers(
    @Query() queryUser: QueryUserSAInputModel
  ) {
    return await this.usersSqlQueryRepository.findUsers(queryUser)
  }


  @UseGuards(BasicGuard)
  @Post("users")
  async createUser(
    @Body() bodyUser: CreateUserBodyInputModel
  ) {
    const createResult = await this.commandBus.execute(
      new CreateUserSqlCommand(
        bodyUser.login,
        bodyUser.email,
        bodyUser.password
      )
    )
    if (createResult.error === ErrorEnums.USER_EMAIL_EXIST) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_EMAIL_EXIST, bodyUser.email)
    )
    if (createResult.error === ErrorEnums.USER_LOGIN_EXIST) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_LOGIN_EXIST, bodyUser.login)
    )
    const userView = await this.usersSqlQueryRepository.findUserByUserId(createResult.data)
    if (userView === null) throw new NotFoundException()
    return userView
  }


  @UseGuards(BasicGuard)
  @Delete("users/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param() param: IdParamInputModelSql
  ) {
    const resultContract = await this.commandBus.execute(
      new DeleteUserCommandSql(param.id)
    )
    if (resultContract.error === ErrorEnums.USER_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_FOUND, "id")
    )
    if (resultContract.error === ErrorEnums.USER_NOT_DELETED) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_DELETED, "id")
    )
    return
  }


//  ↓↓↓ BLOGS

  @UseGuards(BasicGuard)
  // @UseGuards(AccessGuard)
  @Get("blogs")
  async getBlogs(
    // @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Query() queryBlog: GetBlogsQueryInputModel
  ) {
    return await this.blogsQueryRepositorySql.findBlogsSA(queryBlog)
  }


  // // ↓↓↓ USERS
  // @UseGuards(AccessGuard)
  // @Put("users/:id/ban")
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async banUserBlogger(
  //   @DeviceSession() deviceSession: DeviceSessionInputModel,
  //   @Param() param: IdParamInputModelSql,
  //   @Body() bodyUserBan: BanUserBodyInputModelSql
  // ) {
  //   const banContract = await this.commandBus.execute(
  //     new BanUserBloggerCommandSql(
  //       deviceSession.userId,
  //       param.id,
  //       bodyUserBan,
  //     )
  //   )
  //   if (banContract.error === ErrorEnums.USER_NOT_FOUND) throw new NotFoundException(
  //     callErrorMessage(ErrorEnums.USER_NOT_FOUND, "id")
  //   )
  //   if (banContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException(
  //     callErrorMessage(ErrorEnums.FOREIGN_BLOG, "id")
  //   )
  //   if (banContract.error === ErrorEnums.USER_NOT_BANNED) throw new NotFoundException(
  //     callErrorMessage(ErrorEnums.USER_NOT_BANNED, "id")
  //   )
  //   return
  // }
  //
  // @UseGuards(AccessGuard)
  // @Get("users/blogs/:id")
  // async getBannedUsersOfBlog(
  //   @DeviceSession() deviceSession: DeviceSessionInputModel,
  //   @Param() param: IdParamInputModelSql,
  //   @Query() queryBlog: GetPostsCommentsQueryInputModel
  // ) {
  //   const bannedBlogUsersContract = await this.blogsQueryRepositorySql.findBanBlogUsers(
  //     param.id,
  //     true,
  //     queryBlog,
  //     deviceSession.userId,
  //   )
  //   if (bannedBlogUsersContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
  //     callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
  //   )
  //   if (bannedBlogUsersContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException(
  //     callErrorMessage(ErrorEnums.FOREIGN_BLOG, "id")
  //   )
  //   return bannedBlogUsersContract.data
  // }


  // ↓↓↓ QUIZ QUESTIONS
  @UseGuards(BasicGuard)
  @Get("quiz/questions")
  async getQuestions(
    @Query() query: GetQuestionsQueryInputModel
  ) {
    const getContract = await this.quizQueryRepositoryOrm.getQuestions(query)
    return getContract.data
  }

  @UseGuards(BasicGuard)
  @Post("quiz/questions")
  async createQuestion(
    @Body() body: QuestionBodyInputModelSql,
  ) {
    const createContract = await this.commandBus.execute(
      new CreateQuestionsQuizCommandSql(body)
    )
    const question = this.quizQueryRepositoryOrm.getQuestion(createContract.data)
    if (question === null) throw new ServiceUnavailableException()
    return question
  }

  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete("quiz/questions/:id")
  async deleteQuestion(
    @Param() params: IdParamInputModelSql,
  ) {
    const result = await this.quizRepositoryOrm.deleteQuestion(params.id)
    if (result === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.QUESTION_NOT_FOUND, "id")
    )
  }

  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put("quiz/questions/:id")
  async updateQuestion(
    @Param() params: IdParamInputModelSql,
    @Body() body: QuestionBodyInputModelSql,
  ) {
    const result = await this.quizRepositoryOrm.updateQuestion(params.id, body)
    if (result === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.QUESTION_NOT_FOUND, "id")
    )
  }

  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put("quiz/questions/:id/publish")
  async publishQuestion(
    @Param() params: IdParamInputModelSql,
    @Body() body: QuestionPublishBodyInputModelSql,
  ) {
    const result = await this.quizRepositoryOrm.publishQuestion(params.id, body.published)
    if (result === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.QUESTION_NOT_FOUND, "id")
    )
  }


}
