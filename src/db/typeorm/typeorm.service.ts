import { BlogsController } from "../../features/blogs/api/blogs.controller"
import { PostsController } from "../../features/posts/api/posts.controller"
import { SAController } from "../../features/sa/api/sa.controller"
import { BloggerController } from "../../features/blogger/api/blogger.controller"
import { CommentsController } from "../../features/comments/api/comments.controller"
import { AuthController } from "../../features/auth/api/auth.controller"
import { AppController } from "../../app.controller"
import { DevicesController } from "../../features/devices/api/devices.controller"
import { BindBlogBlogger } from "../../features/sa/application/use-cases/mongoose/bind-blog.use-case"
import { CreateBlogBlogger } from "../../features/blogger/application/use-cases/mongoose/create-blog.use-case"
import { UpdateBlogBlogger } from "../../features/blogger/application/use-cases/mongoose/update-blog.use-case"
import { DeleteBlogBlogger } from "../../features/blogger/application/use-cases/mongoose/delete-blog.use-case"
import { ConfirmationResend } from "../../features/auth/application/use-cases/mongoose/confirmation-resend.use-case"
import { Confirmation } from "../../features/auth/application/use-cases/mongoose/confirmation.use-case"
import { Login } from "../../features/auth/application/use-cases/mongoose/login.use-case"
import { Logout } from "../../features/auth/application/use-cases/mongoose/logout.use-case"
import { NewPassword } from "../../features/auth/application/use-cases/mongoose/new-password.use-case"
import { PasswordRecovery } from "../../features/auth/application/use-cases/mongoose/password-recovery.use-case"
import { RefreshToken } from "../../features/auth/application/use-cases/mongoose/refresh-token.use-case"
import { Registration } from "../../features/auth/application/use-cases/mongoose/registration.use-case"
import { DeleteComment } from "../../features/comments/application/use-cases/mongoose/delete-comment.use-case"
import { UpdateCommentLike } from "../../features/comments/application/use-cases/mongoose/update-comment-like.use-case"
import { UpdateComment } from "../../features/comments/application/use-cases/mongoose/update-comment.use-case"
import { DeleteOtherDevices } from "../../features/devices/application/use-cases/mongoose/delete-other-devices.use-case"
import {
  DeleteSpecialDevice
} from "../../features/devices/application/use-cases/mongoose/delete-special-device.use-case"
import { CreateComment } from "../../features/posts/application/use-cases/mongoose/create-comment.use-case"
import { CreatePostBlogger } from "../../features/blogger/application/use-cases/mongoose/create-post.use-case"
import { DeletePostBlogger } from "../../features/blogger/application/use-cases/mongoose/delete-post.use-case"
import { UpdatePostLike } from "../../features/posts/application/use-cases/mongoose/update-post-like.use-case"
import { UpdatePost } from "../../features/blogger/application/use-cases/mongoose/update-post.use-case"
import { CreateToken } from "../../infrastructure/services/tokens/create-token.use-case"
import { VerifyToken } from "../../infrastructure/services/tokens/verify-token.use-case"
import { CreateUser } from "../../features/sa/application/use-cases/mongoose/create-user.use-case"
import { DeleteUser } from "../../features/sa/application/use-cases/mongoose/delete-user.use-case"
import { BanUser } from "../../features/sa/application/use-cases/mongoose/ban-user.use-case"
import { BanBlog } from "../../features/sa/application/use-cases/mongoose/ban-blog.use-case"
import { BanUserBlogger } from "../../features/blogger/application/use-cases/mongoose/ban-user-blogger.use-case"
import { BlogsRepository } from "../../features/blogs/repository/mongoose/blogs.repository"
import { BlogsQueryRepository } from "../../features/blogs/repository/mongoose/blogs.query.repository"
import { PostsRepository } from "../../features/posts/repository/mongoose/posts.repository"
import { PostsQueryRepository } from "../../features/posts/repository/mongoose/posts.query.repository"
import { UsersRepository } from "../../features/sa/repository/mongoose/users.repository"
import { UsersQueryRepository } from "../../features/sa/repository/mongoose/users.query.repository"
import { CommentsRepository } from "../../features/comments/repository/mongoose/comments.repository"
import { CommentsQueryRepository } from "../../features/comments/repository/mongoose/comments.query.repository"
import { AuthQueryRepository } from "../../features/auth/repository/mongoose/auth.query.repository"
import { AuthRepository } from "../../features/auth/repository/mongoose/auth.repository"
import { DevicesRepository } from "../../features/devices/repository/mongoose/devices.repository"
import { BannedBlogUsersRepository } from "../../features/blogger/repository/mongoose/banned-blog-users.repository"
import { PostsCommentsRepository } from "../../features/blogger/repository/mongoose/posts-comments.repository"
import { TestingRepository } from "../../infrastructure/testing/infrastructure/testing.repository"
import { ConfirmationSql } from "../../features/auth/application/use-cases/sql/confirmation.sql.use-case"
import { ConfirmationResendSql } from "../../features/auth/application/use-cases/sql/confirmation-resend.sql.use-case"
import { LoginSql } from "../../features/auth/application/use-cases/sql/login.sql.use-case"
import { LogoutSql } from "../../features/auth/application/use-cases/sql/logout.sql.use-case"
import { NewPasswordSql } from "../../features/auth/application/use-cases/sql/new-password.sql.use-case"
import { PasswordRecoverySql } from "../../features/auth/application/use-cases/sql/password-recovery.sql.use-case"
import { RefreshTokenSql } from "../../features/auth/application/use-cases/sql/refresh-token.sql.use-case"
import { RegistrationSql } from "../../features/auth/application/use-cases/sql/registration.sql.use-case"
import { BanBlogSql } from "../../features/sa/application/use-cases/sql/ban-blog.use-case.sql"
import { BanUserSql } from "../../features/sa/application/use-cases/sql/ban-user.use-case.sql"
import { BindBlogSql } from "../../features/sa/application/use-cases/sql/bind-blog.use-case.sql"
import { CreateUserSql } from "../../features/sa/application/use-cases/sql/create-user.use-case.sql"
import { DeleteUserSql } from "../../features/sa/application/use-cases/sql/delete-user.use-case.sql"
import {
  DeleteOtherDevicesSql
} from "../../features/devices/application/use-cases/sql/delete-other-devices.use-case.sql"
import {
  DeleteSpecialDeviceSql
} from "../../features/devices/application/use-cases/sql/delete-special-device.use-case.sql"
import { CreatePostSql } from "../../features/blogger/application/use-cases/sql/create-post.use-case.sql"
import { CreateBlogBloggerSql } from "../../features/blogger/application/use-cases/sql/create-blog.use-case.sql"
import { UpdateBlogSql } from "../../features/blogger/application/use-cases/sql/update-blog.use-case.sql"
import { DeleteBlogSql } from "../../features/blogger/application/use-cases/sql/delete-blog.use-case.sql"
import { DeletePostSql } from "../../features/blogger/application/use-cases/sql/delete-post.use-case.sql"
import { UpdatePostSql } from "../../features/blogger/application/use-cases/sql/update-post.use-case.sql"
import { BanUserBloggerSql } from "../../features/blogger/application/use-cases/sql/ban-user-blogger.use-case.sql"
import { DeleteCommentSql } from "../../features/comments/application/use-cases/sql/delete-comment.use-case.sql"
import { UpdateCommentSql } from "../../features/comments/application/use-cases/sql/update-comment.use-case.sql"
import {
  UpdateCommentLikeSql
} from "../../features/comments/application/use-cases/sql/update-comment-like.use-case.sql"
import { CreateCommentSql } from "../../features/posts/application/use-cases/sql/create-comment.use-case.sql"
import { UpdatePostLikeSql } from "../../features/posts/application/use-cases/sql/update-post-like.use-case.sql"
import { CreateBlogSASql } from "../../features/sa/application/use-cases/sql/create-blog.use-case.sql"
import { UpdateBlogSASql } from "../../features/sa/application/use-cases/sql/update-blog.use-case.sql"
import { UpdatePostSASql } from "../../features/sa/application/use-cases/sql/update-post.use-case.sql"
import { DeletePostSASql } from "../../features/sa/application/use-cases/sql/delete-post.use-case.sql"
import { DeleteBlogSASql } from "../../features/sa/application/use-cases/sql/delete-blog.use-case.sql"
import { CreatePostSASql } from "../../features/sa/application/use-cases/sql/create-post.use-case.sql"
import { AuthRepositoryOrm } from "../../features/auth/repository/typeorm/auth-repository.orm"
import { DevicesRepositoryOrm } from "../../features/devices/repository/typeorm/devices.repository.orm"
import { DevicesQueryRepositoryOrm } from "../../features/devices/repository/typeorm/devices.query.repository.orm"
import { UsersRepositoryOrm } from "../../features/sa/repository/typeorm/users.repository.orm"
import { UsersQueryRepositoryOrm } from "../../features/sa/repository/typeorm/users.query.repository.orm"
import { BlogsQueryRepositoryOrm } from "../../features/blogs/repository/typeorm/blogs.query.repository.orm"
import { PostsQueryRepositoryOrm } from "../../features/posts/repository/typeorm/posts.query.repository.orm"
import { BlogsRepositoryOrm } from "../../features/blogs/repository/typeorm/blogs.repository.orm"
import { PostsRepositoryOrm } from "../../features/posts/repository/typeorm/posts.repository.orm"
import { CommentsQueryRepositoryOrm } from "../../features/comments/repository/typeorm/comments.query.repository.orm"
import { CommentsRepositoryOrm } from "../../features/comments/repository/typeorm/comments.repository.orm"
import { AuthControllerSql } from "../../features/auth/api/auth.controller.sql"
import { SaControllerSql } from "../../features/sa/api/sa.controller.sql"
import { DevicesControllerSql } from "../../features/devices/api/devices.controller.sql"
import { BlogsControllerSql } from "../../features/blogs/api/blogs.controller.sql"
import { PostsControllerSql } from "../../features/posts/api/posts.controller.sql"
import { BloggerControllerSql } from "../../features/blogger/api/blogger.controller.sql"
import { CommentsControllerSql } from "../../features/comments/api/comments.controller.sql"


const typeOrmUseCases = [
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
  BindBlogSql,
  CreateUserSql,
  DeleteUserSql,
  DeleteOtherDevicesSql,
  DeleteSpecialDeviceSql,
  CreatePostSql,
  CreateBlogBloggerSql,
  UpdateBlogSql,
  DeleteBlogSql,
  DeletePostSql,
  UpdatePostSql,
  BanUserBloggerSql,
  DeleteCommentSql,
  UpdateCommentSql,
  UpdateCommentLikeSql,
  CreateCommentSql,
  UpdatePostLikeSql,
  CreateBlogSASql,
  UpdateBlogSASql,
  UpdatePostSASql,
  DeletePostSASql,
  DeleteBlogSASql,
  CreatePostSASql,
]
const typeOrmRepositories = [
  AuthRepositoryOrm,
  DevicesRepositoryOrm,
  DevicesQueryRepositoryOrm,
  UsersRepositoryOrm,
  UsersQueryRepositoryOrm,
  BlogsQueryRepositoryOrm,
  PostsQueryRepositoryOrm,
  BlogsRepositoryOrm,
  PostsRepositoryOrm,
  CommentsQueryRepositoryOrm,
  CommentsRepositoryOrm,
]


export const typeOrmControllers = [
  AuthControllerSql,
  SaControllerSql,
  DevicesControllerSql,
  BlogsControllerSql,
  PostsControllerSql,
  BloggerControllerSql,
  CommentsControllerSql,
]
export const typeOrmProviders = [
  ...typeOrmUseCases,
  ...typeOrmRepositories
]
