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
import { ConnectionQuizSql } from "../../features/quiz/application/use-cases/connection-quiz.use-case.sql"
import { CreateQuestionsQuizSql } from "../../features/quiz/application/use-cases/create-questions-quiz.use-case.sql"
import { QuizRepositoryOrm } from "../../features/quiz/repository/typeorm/quiz.repository.orm"
import { QuizQueryRepositoryOrm } from "../../features/quiz/repository/typeorm/quiz.query.repository.orm"
import { QuizControllerSql } from "../../features/quiz/api/quiz.controller.sql"
import { CreateAnswersQuizSql } from "../../features/quiz/application/use-cases/create-answers-quiz.use-case.sql"
import { UploadWallpaperSql } from "../../features/blogger/application/use-cases/sql/upload-wallpaper.use-case.sql"
import { DeleteWallpaperSql } from "../../features/blogger/application/use-cases/sql/delete-wallpaper.use-case.sql"
import { FilesStorageAdapter } from "../../infrastructure/adapters/files-storage.adapter"
import { FilesS3StorageAdapter } from "../../infrastructure/adapters/files-s3-storage.adapter"
import { BlogWallpaperDecorator } from "../../infrastructure/decorators/blog-wallpaper.decorator"


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
  ConnectionQuizSql,
  CreateQuestionsQuizSql,
  CreateAnswersQuizSql,
  UploadWallpaperSql,
  DeleteWallpaperSql,
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
  QuizRepositoryOrm,
  QuizQueryRepositoryOrm,
]


export const typeOrmControllers = [
  AuthControllerSql,
  SaControllerSql,
  DevicesControllerSql,
  BlogsControllerSql,
  PostsControllerSql,
  BloggerControllerSql,
  CommentsControllerSql,
  QuizControllerSql,
]
export const typeOrmProviders = [
  ...typeOrmUseCases,
  ...typeOrmRepositories
]
