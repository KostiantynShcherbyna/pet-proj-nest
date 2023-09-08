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


const mongooseUseCases = [
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
  UpdatePost,
  CreateToken,
  VerifyToken,
  CreateUser,
  DeleteUser,
  BanUser,
  BanBlog,
  BanUserBlogger,
]
const mongooseRepositories = [
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
]


export const mongooseControllers = [
  BlogsController,
  PostsController,
  SAController,
  BloggerController,
  CommentsController,
  AuthController,
  AppController,
  DevicesController,
]
export const mongooseProviders = [
  ...mongooseUseCases,
  ...mongooseRepositories
]