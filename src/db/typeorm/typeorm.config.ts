import { DataSource } from "typeorm"
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions"
import { RecoveryCodeEntity } from "../../features/auth/application/entities/sql/recovery-code.entity"
import { BanBlogUserEntity } from "../../features/blogs/application/entities/sql/ban-blog-user.entity"
import { BlogEntity } from "../../features/blogs/application/entities/sql/blog.entity"
import { CommentEntity } from "../../features/comments/application/entities/sql/comment.entity"
import { CommentLikeEntity } from "../../features/comments/application/entities/sql/comment-like.entity"
import { DeviceEntity } from "../../features/devices/application/entites/sql/device.entity"
import { PostLikeEntity } from "../../features/posts/application/entites/typeorm/post-like.entity"
import { PostEntity } from "../../features/posts/application/entites/typeorm/post.entity"
import { AccountEntity } from "../../features/sa/application/entities/sql/account.entity"
import { BanInfoEntity } from "../../features/sa/application/entities/sql/ban-info.entity"
import { EmailConfirmationEntity } from "../../features/sa/application/entities/sql/email-confirmation.entity"
import {
  SentConfirmationCodeDateEntity
} from "../../features/sa/application/entities/sql/sent-confirmation-code-date.entity"
import { Game } from "../../features/quiz/application/entities/typeorm/game"
import { Question } from "../../features/quiz/application/entities/typeorm/question"
import { Answer } from "../../features/quiz/application/entities/typeorm/answer"

export const typeormConfig: PostgresConnectionOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "nestjsk",
  password: "nestjsk",
  database: "pet-proj-nest-orm-db",
  entities: [
    RecoveryCodeEntity,
    BanBlogUserEntity,
    BlogEntity,
    CommentEntity,
    CommentLikeEntity,
    DeviceEntity,
    PostLikeEntity,
    PostEntity,
    AccountEntity,
    BanInfoEntity,
    EmailConfirmationEntity,
    SentConfirmationCodeDateEntity,
    Game,
    Question,
    Answer,
  ],
  migrations: [__dirname + `/migrations/**/*{.ts,.js}`],
  synchronize: true,
}
export default new DataSource(typeormConfig)