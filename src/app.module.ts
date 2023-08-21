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
import {
  RequestAttempts,
  RequestAttemptsSchema
} from "./features/auth/application/entities/mongoose/request-attempts.schema"
import { ConfirmationResend } from "./features/auth/application/use-cases/mongoose/confirmation-resend.use-case"
import { Confirmation } from "./features/auth/application/use-cases/mongoose/confirmation.use-case"
import { Login } from "./features/auth/application/use-cases/mongoose/login.use-case"
import { Logout } from "./features/auth/application/use-cases/mongoose/logout.use-case"
import { NewPassword } from "./features/auth/application/use-cases/mongoose/new-password.use-case"
import { PasswordRecovery } from "./features/auth/application/use-cases/mongoose/password-recovery.use-case"
import { RefreshToken } from "./features/auth/application/use-cases/mongoose/refresh-token.use-case"
import { Registration } from "./features/auth/application/use-cases/mongoose/registration.use-case"
import { AuthQueryRepository } from "./features/auth/repository/mongoose/auth.query.repository"
import { AuthRepository } from "./features/auth/repository/mongoose/auth.repository"
import { BloggerController } from "./features/blogger/api/blogger.controller"
import {
  BannedBlogUsers,
  BannedBlogUsersSchema
} from "./features/blogs/application/entities/mongoose/banned-blog-users.schema"
import { Blogs, BlogsSchema } from "./features/blogs/application/entities/mongoose/blogs.schema"
import { Posts, PostsSchema } from "./features/posts/application/entites/mongoose/posts.schema"
import { BanUserBlogger } from "./features/blogger/application/use-cases/mongoose/ban-user-blogger.use-case"
import { CreateBlogBlogger } from "./features/blogger/application/use-cases/mongoose/create-blog.use-case"
import { CreatePostBlogger } from "./features/blogger/application/use-cases/mongoose/create-post.use-case"
import { DeleteBlogBlogger } from "./features/blogger/application/use-cases/mongoose/delete-blog.use-case"
import { DeletePostBlogger } from "./features/blogger/application/use-cases/mongoose/delete-post.use-case"
import { UpdateBlogBlogger } from "./features/blogger/application/use-cases/mongoose/update-blog.use-case"
import { UpdatePostBlogger } from "./features/blogger/application/use-cases/mongoose/update-post.use-case"
import { BannedBlogUsersRepository } from "./features/blogger/repository/mongoose/banned-blog-users.repository"
import { PostsCommentsRepository } from "./features/blogger/repository/mongoose/posts-comments.repository"
import { BlogsController } from "./features/blogs/api/blogs.controller"
import { BlogsQueryRepository } from "./features/blogs/repository/mongoose/blogs.query.repository"
import { BlogsRepository } from "./features/blogs/repository/mongoose/blogs.repository"
import { CommentsController } from "./features/comments/api/comments.controller"
import { Comments, CommentsSchema } from "./features/comments/application/entities/mongoose/comments.schema"
import { PostsComments, PostsCommentsSchema } from "./features/posts/application/entites/mongoose/posts-comments.schema"
import { DeleteComment } from "./features/comments/application/use-cases/delete-comment.use-case"
import { UpdateCommentLike } from "./features/comments/application/use-cases/update-comment-like.use-case"
import { UpdateComment } from "./features/comments/application/use-cases/update-comment.use-case"
import { CommentsQueryRepository } from "./features/comments/repository/mongoose/comments.query.repository"
import { CommentsRepository } from "./features/comments/repository/mongoose/comments.repository"
import { DevicesController } from "./features/devices/api/devices.controller"
import { DeleteOtherDevices } from "./features/devices/application/use-cases/mongoose/delete-other-devices.use-case"
import { DeleteSpecialDevice } from "./features/devices/application/use-cases/mongoose/delete-special-device.use-case"
import { DevicesRepository } from "./features/devices/repository/mongoose/devices.repository"
import { PostsController } from "./features/posts/api/posts.controller"
import { CreateComment } from "./features/posts/application/use-cases/create-comment.use-case"
import { UpdatePostLike } from "./features/posts/application/use-cases/update-post-like.use-case"
import { PostsQueryRepository } from "./features/posts/repository/mongoose/posts.query.repository"
import { PostsRepository } from "./features/posts/repository/mongoose/posts.repository"
import { SAController } from "./features/sa/api/sa.controller"
import { Users, UsersSchema } from "./features/sa/application/entities/mongoose/users.schema"
import { BanBlog } from "./features/sa/application/use-cases/mongoose/ban-blog.use-case"
import { BanUser } from "./features/sa/application/use-cases/mongoose/ban-user.use-case"
import { BindBlogBlogger } from "./features/sa/application/use-cases/mongoose/bind-blog.use-case"
import { CreateUser } from "./features/sa/application/use-cases/mongoose/create-user.use-case"
import { DeleteUser } from "./features/sa/application/use-cases/mongoose/delete-user.use-case"
import { UsersQueryRepository } from "./features/sa/repository/mongoose/users.query.repository"
import { UsersRepository } from "./features/sa/repository/mongoose/users.repository"
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
import { UsersRepositorySql } from "./features/sa/repository/sql/users.repository.sql"
import { DevicesRepositorySql } from "./features/devices/repository/sql/devices.repository.sql"
import { AuthSqlRepository } from "./features/auth/repository/sql/auth.sql.repository"
import { ConfirmationSql } from "./features/auth/application/use-cases/sql/confirmation.sql.use-case"
import { ConfirmationResendSql } from "./features/auth/application/use-cases/sql/confirmation-resend.sql.use-case"
import { LoginSql } from "./features/auth/application/use-cases/sql/login.sql.use-case"
import { LogoutSql } from "./features/auth/application/use-cases/sql/logout.sql.use-case"
import { NewPasswordSql } from "./features/auth/application/use-cases/sql/new-password.sql.use-case"
import { PasswordRecoverySql } from "./features/auth/application/use-cases/sql/password-recovery.sql.use-case"
import { RefreshTokenSql } from "./features/auth/application/use-cases/sql/refresh-token.sql.use-case"
import { RegistrationSql } from "./features/auth/application/use-cases/sql/registration.sql.use-case"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthSqlController } from "./features/auth/api/auth.sql.controller"
import { LoginSqlLocalStrategy } from "./infrastructure/strategy/login.sql.local.strategy"
import { BanBlogSql } from "./features/sa/application/use-cases/sql/ban-blog.use-case.sql"
import { BanUserSql } from "./features/sa/application/use-cases/sql/ban-user.use-case.sql"
import { BindBlogBloggerSql } from "./features/sa/application/use-cases/sql/bind-blog.use-case.sql"
import { CreateUserSql } from "./features/sa/application/use-cases/sql/create-user.use-case.sql"
import { DeleteUserSql } from "./features/sa/application/use-cases/sql/delete-user.use-case.sql"
import { SaControllerSql } from "./features/sa/api/sa.controller.sql"
import { DevicesQueryRepositorySql } from "./features/devices/repository/sql/devices.query.repository.sql"
import { DeleteOtherDevicesSql } from "./features/devices/application/use-cases/sql/delete-other-devices.use-case.sql"
import { DeleteSpecialDeviceSql } from "./features/devices/application/use-cases/sql/delete-special-device.use-case.sql"
import { UsersQueryRepositorySql } from "./features/sa/repository/sql/users.query.repository.sql"
import { DevicesControllerSql } from "./features/devices/api/devices.controller.sql"
import { BlogsControllerSql } from "./features/blogs/api/blogs.controller.sql"
import { PostsControllerSql } from "./features/posts/api/posts.controller.sql"
import { BlogsQueryRepositorySql } from "./features/blogs/repository/sql/blogs.query.repository.sql"
import { PostsQueryRepositorySql } from "./features/posts/repository/sql/posts.query.repository.sql"
import { BlogsRepositorySql } from "./features/blogs/repository/sql/blogs.repository.sql"
import { BloggerControllerSql } from "./features/blogger/api/blogger.controller.sql"
import { CreateBlogBloggerSql } from "./features/blogger/application/use-cases/sql/create-blog.use-case.sql"
import { CreatePostSql } from "./features/blogger/application/use-cases/sql/create-post.use-case.sql"
import { PostsRepositorySql } from "./features/posts/repository/sql/posts.repository.sql"
import { UpdateBlogSql } from "./features/blogger/application/use-cases/sql/update-blog.use-case.sql"
import { DeleteBlogSql } from "./features/blogger/application/use-cases/sql/delete-blog.use-case.sql"
import { DeletePostSql } from "./features/blogger/application/use-cases/sql/delete-post.use-case.sql"


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

  ConfirmationSql,
  ConfirmationResendSql,
  LoginSql,
  LogoutSql,
  NewPasswordSql,
  PasswordRecoverySql,
  RefreshTokenSql,
  RegistrationSql,
  BanBlogSql,
  BanUserSql,
  BindBlogBloggerSql,
  CreateUserSql,
  DeleteUserSql,
  DeleteOtherDevicesSql,
  DeleteSpecialDeviceSql,
  CreatePostSql,
  UpdateBlogSql,
  DeleteBlogSql,
  DeletePostSql,
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

  AuthSqlRepository,
  DevicesRepositorySql,
  DevicesQueryRepositorySql,
  UsersRepositorySql,
  UsersQueryRepositorySql,
  BlogsQueryRepositorySql,
  PostsQueryRepositorySql,
  BlogsRepositorySql,
  CreateBlogBloggerSql,
  PostsRepositorySql,
]
const otherProviders = [
  throttler,
  JwtService,
  LoginLocalStrategy,
  LoginSqlLocalStrategy,
  BlogIdIsExist,
  EmailAdapter,
]


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [configuration]
    }),
    MongooseModule.forRoot(
      configuration().MONGOOSE_URI
    ),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "nestjsk",
      password: "nestjsk",
      database: "pet-proj-nest-db",
      // entities: [],
      autoLoadEntities: false,
      synchronize: false,
    }),
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

    AuthSqlController,
    SaControllerSql,
    DevicesControllerSql,
    BlogsControllerSql,
    PostsControllerSql,
    BloggerControllerSql,
  ],
  providers: [
    ...otherProviders,
    ...services,
    ...repository,
    ...useCases,
  ],
})
export class AppModule {
}
