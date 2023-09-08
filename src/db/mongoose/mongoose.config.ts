import { configuration } from "../../infrastructure/settings/configuration"
import { Blogs, BlogsSchema } from "../../features/blogs/application/entities/mongoose/blogs.schema"
import { Posts, PostsSchema } from "../../features/posts/application/entites/mongoose/posts.schema"
import { Comments, CommentsSchema } from "../../features/comments/application/entities/mongoose/comments.schema"
import { Users, UsersSchema } from "../../features/sa/application/entities/mongoose/users.schema"
import { Devices, DevicesSchema } from "../../features/devices/application/entites/mongoose/devices.schema"
import {
  RecoveryCodes,
  RecoveryCodesSchema
} from "../../features/auth/application/entities/mongoose/recovery-code.schema"
import {
  RequestAttempts,
  RequestAttemptsSchema
} from "../../features/auth/application/entities/mongoose/request-attempts.schema"
import {
  BannedBlogUsers,
  BannedBlogUsersSchema
} from "../../features/blogs/application/entities/mongoose/banned-blog-users.schema"
import {
  PostsComments,
  PostsCommentsSchema
} from "../../features/posts/application/entites/mongoose/posts-comments.schema"

export const mongooseConfig = {
  connection: configuration().MONGOOSE_URI,
  features: [
    { name: Blogs.name, schema: BlogsSchema },
    { name: Posts.name, schema: PostsSchema },
    { name: Comments.name, schema: CommentsSchema },
    { name: Users.name, schema: UsersSchema },
    { name: Devices.name, schema: DevicesSchema },
    { name: RecoveryCodes.name, schema: RecoveryCodesSchema },
    { name: RequestAttempts.name, schema: RequestAttemptsSchema },
    { name: BannedBlogUsers.name, schema: BannedBlogUsersSchema },
    { name: PostsComments.name, schema: PostsCommentsSchema },
  ]
}

// MongooseModule.forRoot(
//   configuration().MONGOOSE_URI
// ),
// MongooseModule.forFeature([
//   { name: Blogs.name, schema: BlogsSchema },
//   { name: Posts.name, schema: PostsSchema },
//   { name: Comments.name, schema: CommentsSchema },
//   { name: Users.name, schema: UsersSchema },
//   { name: Devices.name, schema: DevicesSchema },
//   { name: RecoveryCodes.name, schema: RecoveryCodesSchema },
//   { name: RequestAttempts.name, schema: RequestAttemptsSchema },
//   { name: BannedBlogUsers.name, schema: BannedBlogUsersSchema },
//   { name: PostsComments.name, schema: PostsCommentsSchema },
// ]),
