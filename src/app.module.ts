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
import { UsersController } from "./controllers/users.controller"
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
import { JwtModule, JwtService } from "@nestjs/jwt"
import { RequestAttempts, RequestAttemptsSchema } from "./schemas/request-attempts.schema"
import { AppService } from "./app.service"
import { AppController } from "./app.controller"
import { BlogIdIsExist } from "./validators/blogId.validator"
import { DevicesController } from "./controllers/devices.controller"
import { ThrottlerModule } from "@nestjs/throttler"
import { throttler } from "./guards/throttler.guard"
import { PassportModule } from "@nestjs/passport"
import { Secrets } from "./utils/constants/constants"
import { LoginLocalStrategy } from "./strategy/local.strategy/login.local.strategy"
import { CreateBlog } from "./services/use-cases/blogs/create-blog.use-case"
import { UpdateBlog } from "./services/use-cases/blogs/update-blog.use-case"
import { DeleteBlog } from "./services/use-cases/blogs/delete-blog.use-case"
import { CqrsModule } from "@nestjs/cqrs"
import { ConfirmationResendCommand } from "./services/use-cases/auth/confiramtion-resend.use-case"
import { ConfirmationCommand } from "./services/use-cases/auth/confiramtion.use-case"
import { LoginCommand } from "./services/use-cases/auth/login.use-case"
import { LogoutCommand } from "./services/use-cases/auth/logout.use-case"
import { NewPasswordCommand } from "./services/use-cases/auth/new-password.use-case"
import { PasswordRecoveryCommand } from "./services/use-cases/auth/password-recovery.use-case"
import { RefreshCommand } from "./services/use-cases/auth/refresh.use-case"
import { RegistrationCommand } from "./services/use-cases/auth/registration.use-case"
import { DeleteCommentCommand } from "./services/use-cases/comments/delete-comment.use-case"
import { UpdateCommentCommand } from "./services/use-cases/comments/update-comment.use-case"
import { UpdateCommentLikeCommand } from "./services/use-cases/comments/update-comment-like.use-case"
import { DeleteOtherDevicesCommand } from "./services/use-cases/devices/delete-other-devices.use-case"
import { DeleteSpecialDeviceCommand } from "./services/use-cases/devices/delete-special-device.use-case"
import { CreateCommentCommand } from "./services/use-cases/posts/create-comment.use-case"
import { DeletePostCommand } from "./services/use-cases/posts/delete-post.use-case"
import { UpdatePostLikeCommand } from "./services/use-cases/posts/update-post-like.use-case"
import { UpdatePostCommand } from "./services/use-cases/posts/update-post.use-case"
import { CreateTokenCommand } from "./services/use-cases/tokens/create-token.use-case"
import { VerifyTokenCommand } from "./services/use-cases/tokens/verify-token.use-case"
import { CreateUserCommand } from "./services/use-cases/users/create-user.use-case"
import { DeleteUserCommand } from "./services/use-cases/users/delete-user.use-case"
import { TransactionScriptService } from "./services/transaction-script.service"


const useCases = [
  ConfirmationResendCommand,
  ConfirmationCommand,
  LoginCommand,
  LogoutCommand,
  NewPasswordCommand,
  PasswordRecoveryCommand,
  RefreshCommand,
  RegistrationCommand,
  CreateBlog,
  UpdateBlog,
  DeleteBlog,
  DeleteCommentCommand,
  UpdateCommentCommand,
  UpdateCommentLikeCommand,
  DeleteOtherDevicesCommand,
  DeleteSpecialDeviceCommand,
  CreateCommentCommand,
  DeletePostCommand,
  UpdatePostLikeCommand,
  UpdatePostCommand,
  CreateTokenCommand,
  VerifyTokenCommand,
  CreateUserCommand,
  DeleteUserCommand,
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
  TransactionScriptService,
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
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
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
    UsersController,
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
