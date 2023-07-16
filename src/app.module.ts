import { ConfigModule } from "@nestjs/config"
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
import { RecoveryCodes, RecoveryCodesSchema, } from "./schemas/recoveryCode.schema"
import { CommentsRepository } from "./repositories/comments.repository"
import { CommentsService } from "./services/comments.service"
import { DevicesService } from "./services/devices.service"
import { TokensService } from "./services/tokens.service"
import { AuthQueryRepository } from "./repositories/query/auth.query.repository"
import { AuthRepository } from "./repositories/auth.repository"
import { JwtService } from "@nestjs/jwt"
import { settings } from "./settings"
import { AttemptRequests, AttemptRequestsSchema } from "./schemas/attemptRequests.schema"
import { AppService } from "./app.service"
import { AppController } from "./app.controller"
import { BlogIdIsExistConstraint } from "./validators/blogId.validator"

// const mongooseURI = process.env.MONGOOSE_URL || "mongodb://0.0.0.0:27017"

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot("mongodb+srv://kostyalys:bagrat10n@cluster0.7mo0iox.mongodb.net/BE-2-0-DEV?retryWrites=true&w=majority"),
    MongooseModule.forFeature([
      { name: Blogs.name, schema: BlogsSchema },
      { name: Posts.name, schema: PostsSchema },
      { name: Comments.name, schema: CommentsSchema },
      { name: Users.name, schema: UsersSchema },
      { name: Devices.name, schema: DevicesSchema },
      { name: RecoveryCodes.name, schema: RecoveryCodesSchema },
      { name: AttemptRequests.name, schema: AttemptRequestsSchema },
    ]),
  ],
  controllers: [
    BlogsController,
    PostsController,
    UsersController,
    CommentsController,
    TestingController,
    AuthController,
    AppController,
  ],
  providers: [
    BlogsService,
    PostsService,
    UsersService,
    AuthService,
    CommentsService,
    DevicesService,
    TokensService,
    JwtService,
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

    BlogIdIsExistConstraint,
  ],
})
export class AppModule { }
