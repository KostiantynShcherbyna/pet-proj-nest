import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { CqrsModule } from "@nestjs/cqrs"
import { JwtService } from "@nestjs/jwt"
import { MongooseModule } from "@nestjs/mongoose"
import { PassportModule } from "@nestjs/passport"
import { ThrottlerModule } from "@nestjs/throttler"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AuthController } from "./features/auth/api/auth.controller"
import { Devices, DevicesSchema } from "./features/devices/application/entites/mongoose/devices.schema"
import { RecoveryCodes, RecoveryCodesSchema, } from "./features/auth/application/entities/mongoose/recovery-code.schema"
import { RequestAttempts, RequestAttemptsSchema } from "./features/auth/application/entities/mongoose/request-attempts.schema"
import { ConfirmationResend } from "./features/auth/application/use-cases/mongoose/confiramtion-resend.use-case"
import { Confirmation } from "./features/auth/application/use-cases/mongoose/confiramtion.use-case"
import { Login } from "./features/auth/application/use-cases/mongoose/login.use-case"
import { Logout } from "./features/auth/application/use-cases/mongoose/logout.use-case"
import { NewPassword } from "./features/auth/application/use-cases/mongoose/new-password.use-case"
import { PasswordRecovery } from "./features/auth/application/use-cases/mongoose/password-recovery.use-case"
import { RefreshToken } from "./features/auth/application/use-cases/mongoose/refresh-token.use-case"
import { Registration } from "./features/auth/application/use-cases/mongoose/registration.use-case"
import { AuthQueryRepository } from "./repositories/auth/mongoose/auth.query.repository"
import { AuthRepository } from "./repositories/auth/mongoose/auth.repository"
import { BloggerController } from "./features/blogger/api/blogger.controller"
import { BannedBlogUsers, BannedBlogUsersSchema } from "./features/blogger/application/entities/mongoose/banned-blog-users.schema"
import { Blogs, BlogsSchema } from "./features/blogger/application/entities/mongoose/blogs.schema"
import { Posts, PostsSchema } from "./features/blogger/application/entities/mongoose/posts.schema"
import { BanUserBlogger } from "./features/blogger/application/use-cases/ban-user-blogger.use-case"
import { CreateBlogBlogger } from "./features/blogger/application/use-cases/create-blog.use-case"
import { CreatePostBlogger } from "./features/blogger/application/use-cases/create-post.use-case"
import { DeleteBlogBlogger } from "./features/blogger/application/use-cases/delete-blog.use-case"
import { DeletePostBlogger } from "./features/blogger/application/use-cases/delete-post.use-case"
import { UpdateBlogBlogger } from "./features/blogger/application/use-cases/update-blog.use-case"
import { UpdatePostBlogger } from "./features/blogger/application/use-cases/update-post.use-case"
import { BannedBlogUsersRepository } from "./repositories/bloggers/mongoose/banned-blog-users.repository"
import { PostsCommentsRepository } from "./repositories/bloggers/mongoose/posts-comments.repository"
import { BlogsController } from "./features/blogs/api/blogs.controller"
import { BlogsQueryRepository } from "./repositories/blogs/mongoose/blogs.query.repository"
import { BlogsRepository } from "./repositories/blogs/mongoose/blogs.repository"
import { CommentsController } from "./features/comments/api/comments.controller"
import { Comments, CommentsSchema } from "./features/comments/application/entities/mongoose/comments.schema"
import { PostsComments, PostsCommentsSchema } from "./features/blogger/application/entities/mongoose/posts-comments.schema"
import { DeleteComment } from "./features/comments/application/use-cases/delete-comment.use-case"
import { UpdateCommentLike } from "./features/comments/application/use-cases/update-comment-like.use-case"
import { UpdateComment } from "./features/comments/application/use-cases/update-comment.use-case"
import { CommentsQueryRepository } from "./repositories/comments/mongoose/comments.query.repository"
import { CommentsRepository } from "./repositories/comments/mongoose/comments.repository"
import { DevicesController } from "./features/devices/api/devices.controller"
import { DeleteOtherDevices } from "./features/devices/application/use-cases/delete-other-devices.use-case"
import { DeleteSpecialDevice } from "./features/devices/application/use-cases/delete-special-device.use-case"
import { DevicesRepository } from "./repositories/devices/mongoose/devices.repository"
import { PostsController } from "./features/posts/api/posts.controller"
import { CreateComment } from "./features/posts/application/use-cases/create-comment.use-case"
import { UpdatePostLike } from "./features/posts/application/use-cases/update-post-like.use-case"
import { PostsQueryRepository } from "./repositories/posts/mongoose/posts.query.repository"
import { PostsRepository } from "./repositories/posts/mongoose/posts.repository"
import { SAController } from "./features/super-admin/api/sa.controller"
import { Users, UsersSchema } from "./features/super-admin/application/entities/mongoose/users.schema"
import { BanBlog } from "./features/super-admin/application/use-cases/ban-blog.use-case"
import { BanUser } from "./features/super-admin/application/use-cases/ban-user.use-case"
import { BindBlogBlogger } from "./features/super-admin/application/use-cases/bind-blog.use-case"
import { CreateUser } from "./features/super-admin/application/use-cases/create-user.use-case"
import { DeleteUser } from "./features/super-admin/application/use-cases/delete-user.use-case"
import { UsersQueryRepository } from "./repositories/users/mongoose/users.query.repository"
import { UsersRepository } from "./repositories/users/mongoose/users.repository"
import { BlogIdIsExist } from "./infrastructure/decorators/blogId.decorator"
import { throttler } from "./infrastructure/guards/throttler.guard"
import { CreateToken } from "./infrastructure/services/tokens/create-token.use-case"
import { VerifyToken } from "./infrastructure/services/tokens/verify-token.use-case"
import { configuration } from "./infrastructure/settings/configuration"
import { LoginLocalStrategy } from "./infrastructure/strategy/login.local.strategy"
import { TestingController } from "./infrastructure/testing/api/testing.controller"
import { TokensService } from "./infrastructure/services/tokens.service"
import { EmailAdapter } from "./infrastructure/adapters/email.adapter"
import { TestingRepository } from "./infrastructure/testing/infrastructure/testing.repository"
import { emailService } from "./infrastructure/services/emailService"
import { UsersSqlRepository } from "./repositories/users/sql/users.sql.repository"


const useCases = [
  BindBlogBlogger,
  CreateBlogBlogger,
  UpdateBlogBlogger,
  DeleteBlogBlogger,
  ConfirmationResend,
  Confirmation,
  Login,
  Logout,
  NewPassword,
  PasswordRecovery,
  RefreshToken,
  Registration,
  DeleteComment,
  UpdateCommentLike,
  UpdateComment,
  DeleteOtherDevices,
  DeleteSpecialDevice,
  CreateComment,
  CreatePostBlogger,
  DeletePostBlogger,
  UpdatePostLike,
  UpdatePostBlogger,
  CreateToken,
  VerifyToken,
  CreateUser,
  DeleteUser,
  BanUser,
  BanBlog,
  BanUserBlogger,
]
const services = [
  AppService,
  TokensService,
]
const repository = [
  BlogsRepository,
  BlogsQueryRepository,
  PostsRepository,
  PostsQueryRepository,
  UsersRepository,
  UsersQueryRepository,
  CommentsRepository,
  CommentsQueryRepository,
  AuthQueryRepository,
  AuthRepository,
  DevicesRepository,
  BannedBlogUsersRepository,
  PostsCommentsRepository,
  TestingRepository,

  UsersSqlRepository,
]
const otherProviders = [
  throttler,
  JwtService,
  LoginLocalStrategy,
  BlogIdIsExist,
  EmailAdapter,
]


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration]
    }),
    MongooseModule.forRoot(
      configuration().MONGOOSE_URI
    ),
    ThrottlerModule.forRoot(),
    MongooseModule.forFeature([
      { name: Blogs.name, schema: BlogsSchema },
      { name: Posts.name, schema: PostsSchema },
      { name: Comments.name, schema: CommentsSchema },
      { name: Users.name, schema: UsersSchema },
      { name: Devices.name, schema: DevicesSchema },
      { name: RecoveryCodes.name, schema: RecoveryCodesSchema },
      { name: RequestAttempts.name, schema: RequestAttemptsSchema },
      { name: BannedBlogUsers.name, schema: BannedBlogUsersSchema },
      { name: PostsComments.name, schema: PostsCommentsSchema },
    ]),
    PassportModule,
    CqrsModule,
    // JwtModule.register({
    //   secret: Secrets.ACCESS_JWT_SECRET,
    //   signOptions: { expiresIn: '60s' },
    // }),
  ],
  controllers: [
    BlogsController,
    PostsController,
    SAController,
    // UsersController,
    BloggerController,
    CommentsController,
    TestingController,
    AuthController,
    AppController,
    DevicesController,
  ],
  providers: [
    ...otherProviders,
    ...services,
    ...repository,
    ...useCases,
  ],
})
export class AppModule { }
