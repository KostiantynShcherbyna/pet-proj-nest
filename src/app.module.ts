import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { MongooseModule } from "@nestjs/mongoose"
import { configuration } from "./infrastructure/settings/configuration"
import { BlogsController } from "./features/blogs/api/blogs.controller"
import { PostsController } from "./features/posts/api/posts.controller"
import { BlogsRepository } from "./features/blogs/infrastructure/blogs.repository"
import { PostsRepository } from "./features/posts/infrastructure/posts.repository"
import { BlogsQueryRepository } from "./features/blogs/infrastructure/blogs.query.repository"
import { CommentsQueryRepository } from "./features/comments/infrastructure/comments.query.repository"
import { PostsQueryRepository } from "./features/posts/infrastructure/posts.query.repository"
import { Blogs, BlogsSchema } from "./infrastructure/schemas/blogs.schema"
import { Comments, CommentsSchema } from "./infrastructure/schemas/comments.schema"
import { Posts, PostsSchema } from "./infrastructure/schemas/posts.schema"
import { CqrsModule } from "@nestjs/cqrs"
import { JwtService } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { ThrottlerModule } from "@nestjs/throttler"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AuthController } from "./features/auth/api/auth.controller"
import { BloggerController } from "./features/blogger/api/blogger.controller"
import { CommentsController } from "./features/comments/api/comments.controller"
import { DevicesController } from "./features/devices/api/devices.controller"
import { SAController } from "./features/super-admin/api/sa.controller"
import { TestingController } from "./infrastructure/testing/api/testing.controller"
import { throttler } from "./infrastructure/guards/throttler.guard"
import { AuthRepository } from "./features/auth/infrastructure/auth.repository"
import { CommentsRepository } from "./features/comments/infrastructure/comments.repository"
import { DevicesRepository } from "./features/devices/infrastructure/devices.repository"
import { AuthQueryRepository } from "./features/auth/infrastructure/auth.query.repository"
import { UsersQueryRepository } from "./features/super-admin/infrastructure/users.query.repository"
import { UsersRepository } from "./features/super-admin/infrastructure/users.repository"
import { Devices, DevicesSchema } from "./infrastructure/schemas/devices.schema"
import { RecoveryCodes, RecoveryCodesSchema, } from "./infrastructure/schemas/recovery-code.schema"
import { RequestAttempts, RequestAttemptsSchema } from "./infrastructure/schemas/request-attempts.schema"
import { Users, UsersSchema } from "./infrastructure/schemas/users.schema"
import { LoginLocalStrategy } from "./infrastructure/strategy/local.strategy/login.local.strategy"
import { ConfirmationResend } from "./features/auth/application/confiramtion-resend.use-case"
import { Confirmation } from "./features/auth/application/confiramtion.use-case"
import { Login } from "./features/auth/application/login.use-case"
import { Logout } from "./features/auth/application/logout.use-case"
import { NewPassword } from "./features/auth/application/new-password.use-case"
import { PasswordRecovery } from "./features/auth/application/password-recovery.use-case"
import { RefreshToken } from "./features/auth/application/refresh-token.use-case"
import { Registration } from "./features/auth/application/registration.use-case"
import { CreateBlogBlogger } from "./features/blogger/application/create-blog.use-case"
import { CreatePostBlogger } from "./features/blogger/application/create-post.use-case"
import { DeleteBlogBlogger } from "./features/blogger/application/delete-blog.use-case"
import { DeletePostBlogger } from "./features/blogger/application/delete-post.use-case"
import { UpdateBlogBlogger } from "./features/blogger/application/update-blog.use-case"
import { UpdatePostBlogger } from "./features/blogger/application/update-post.use-case"
import { DeleteComment } from "./features/comments/application/delete-comment.use-case"
import { UpdateCommentLike } from "./features/comments/application/update-comment-like.use-case"
import { UpdateComment } from "./features/comments/application/update-comment.use-case"
import { DeleteOtherDevices } from "./features/devices/application/delete-other-devices.use-case"
import { DeleteSpecialDevice } from "./features/devices/application/delete-special-device.use-case"
import { CreateComment } from "./features/posts/application/create-comment.use-case"
import { DeletePost } from "./features/posts/application/delete-post.use-case"
import { UpdatePostLike } from "./features/posts/application/update-post-like.use-case"
import { UpdatePost } from "./features/posts/application/update-post.use-case"
import { BanBlog } from "./features/super-admin/application/ban-blog.use-case"
import { BindBlogBlogger } from "./features/super-admin/application/bind-blog.use-case"
import { CreateToken } from "./infrastructure/services/tokens/create-token.use-case"
import { VerifyToken } from "./infrastructure/services/tokens/verify-token.use-case"
import { BanUser } from "./features/super-admin/application/ban-user.use-case"
import { CreateUser } from "./features/super-admin/application/create-user.use-case"
import { DeleteUser } from "./features/super-admin/application/delete-user.use-case"
import { BlogIdIsExist } from "./infrastructure/decorators/blogId.decorator"
import { BannedBlogUsersRepository } from "./features/blogger/infrastructure/banned-blog-users.repository"
import { BanUserBlogger } from "./features/blogger/application/ban-user-blogger.use-case"
import { BannedBlogUsers, BannedBlogUsersSchema } from "./infrastructure/schemas/banned-blog-users.schema"
import { PostsComments, PostsCommentsSchema } from "./infrastructure/schemas/posts-comments.schema"
import { PostsCommentsRepository } from "./features/blogger/infrastructure/posts-comments.repository"


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
  BanBlog,
  DeletePost,
  BanUserBlogger,
]
const services = [
  AppService,
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
