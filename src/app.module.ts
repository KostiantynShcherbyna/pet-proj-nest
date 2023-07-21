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
import { CreatePost } from "./services/use-cases/blogs/create-post.use-case"


const useCases = [CreateBlog, UpdateBlog, DeleteBlog, CreatePost]


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
    throttler,
    JwtService,
    LoginLocalStrategy,

    BlogsService,
    PostsService,
    UsersService,
    AuthService,
    CommentsService,
    DevicesService,
    TokensService,
    AppService,

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
  
    BlogIdIsExist,

    ...useCases,
  ],
})
export class AppModule { }
