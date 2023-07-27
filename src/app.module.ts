import { ConfigModule, ConfigService } from "@nestjs/config"
import { configuration } from "./configuration"
import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { Blogs, BlogsSchema } from "./schemas/blogs.schema"
import { BlogsService } from "./services/blogs.service"
import { BlogsController } from "./controllers/blogs.controller"
import { BlogsRepository } from "./repositories/blogs.repository"
import { BlogsQueryRepository } from "./repositories/query/blogs.query.repository"
import { PostsService } from "./services/posts.service"
import { PostsRepository } from "./repositories/posts.repository"
import { PostsQueryRepository } from "./repositories/query/posts.query.repository"
import { Posts, PostsSchema } from "./schemas/posts.schema"
import { CommentsQueryRepository } from "./repositories/query/comments.query.repository"
import { Comments, CommentsSchema } from "./schemas/comments.schema"
import { PostsController } from "./controllers/posts.controller"
// import { UsersController } from "./controllers/users.controller"
import { Users, UsersSchema } from "./schemas/users.schema"
import { UsersQueryRepository } from "./repositories/query/users.query.repository"
import { UsersService } from "./services/users.service"
import { UsersRepository } from "./repositories/users.repository"
import { CommentsController } from "./controllers/comments.controller"
import { TestingController } from "./controllers/testing.controller"
import { Devices, DevicesSchema } from "./schemas/devices.schema"
import { AuthController } from "./controllers/auth.controller"
import { AuthService } from "./services/auth.service"
import { DevicesRepository } from "./repositories/devices.repository"
import { RecoveryCodes, RecoveryCodesSchema, } from "./schemas/recovery-code.schema"
import { CommentsRepository } from "./repositories/comments.repository"
import { CommentsService } from "./services/comments.service"
import { DevicesService } from "./services/devices.service"
import { TokensService } from "./services/tokens.service"
import { AuthQueryRepository } from "./repositories/query/auth.query.repository"
import { AuthRepository } from "./repositories/auth.repository"
import { JwtService } from "@nestjs/jwt"
import { RequestAttempts, RequestAttemptsSchema } from "./schemas/request-attempts.schema"
import { AppService } from "./app.service"
import { AppController } from "./app.controller"
import { BlogIdIsExist } from "./validators/blogId.validator"
import { DevicesController } from "./controllers/devices.controller"
import { ThrottlerModule } from "@nestjs/throttler"
import { throttler } from "./guards/throttler.guard"
import { PassportModule } from "@nestjs/passport"
import { LoginLocalStrategy } from "./strategy/local.strategy/login.local.strategy"
import { CreateBlogBlogger } from "./use-cases/blogger/create-blog.use-case"
import { UpdateBlogBlogger } from "./use-cases/blogger/update-blog.use-case"
import { DeleteBlogBlogger } from "./use-cases/blogger/delete-blog.use-case"
import { CqrsModule } from "@nestjs/cqrs"
import { Registration } from "./use-cases/auth/registration.use-case"
import { CreatePostBlogger } from "./use-cases/blogger/create-post.use-case"
import { ConfirmationResend } from "./use-cases/auth/confiramtion-resend.use-case"
import { Confirmation } from "./use-cases/auth/confiramtion.use-case"
import { Login } from "./use-cases/auth/login.use-case"
import { Logout } from "./use-cases/auth/logout.use-case"
import { NewPassword } from "./use-cases/auth/new-password.use-case"
import { PasswordRecovery } from "./use-cases/auth/password-recovery.use-case"
import { RefreshToken } from "./use-cases/auth/refresh-token.use-case"
import { DeleteComment } from "./use-cases/comments/delete-comment.use-case"
import { UpdateCommentLike } from "./use-cases/comments/update-comment-like.use-case"
import { UpdateComment } from "./use-cases/comments/update-comment.use-case"
import { DeleteOtherDevices } from "./use-cases/devices/delete-other-devices.use-case"
import { DeleteSpecialDevice } from "./use-cases/devices/delete-special-device.use-case"
import { CreateComment } from "./use-cases/posts/create-comment.use-case"
import { UpdatePostLike } from "./use-cases/posts/update-post-like.use-case"
import { UpdatePost } from "./use-cases/posts/update-post.use-case"
import { CreateToken } from "./use-cases/tokens/create-token.use-case"
import { VerifyToken } from "./use-cases/tokens/verify-token.use-case"
import { CreateUser } from "./use-cases/users/create-user.use-case"
import { DeleteUser } from "./use-cases/users/delete-user.use-case"
import { BanUser } from "./use-cases/users/ban-user.use-case"
import { BloggerController } from "./controllers/blogger.controller"
import { UpdatePostBlogger } from "./use-cases/blogger/update-post.use-case"
import { DeletePostBlogger } from "./use-cases/blogger/delete-post.use-case"
import { BindBlogBlogger } from "./use-cases/blogger/bind-blog.use-case"
import { DeletePost } from "./use-cases/posts/delete-post.use-case"
import { SAController } from "./controllers/sa.controller"



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
  UpdatePost,
  CreateToken,
  VerifyToken,
  CreateUser,
  DeleteUser,
  BanUser,

  DeletePost,
]
const services = [
  BlogsService,
  PostsService,
  UsersService,
  AuthService,
  CommentsService,
  DevicesService,
  TokensService,
  AppService,
  // CreatePostBlogger,
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
]
const otherProviders = [
  throttler,
  JwtService,
  LoginLocalStrategy,
  BlogIdIsExist,
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
