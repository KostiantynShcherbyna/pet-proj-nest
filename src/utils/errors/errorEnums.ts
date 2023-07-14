export enum ErrorEnums {

    INTERNAL_SERVER_ERROR = `Internal server error`,
    EMAIL_NOT_SENT = `Email not sent`,


    //↓↓↓ AUTH
    UNAUTHORIZED = `Unauthorized`,
    CREATE_JWT_ERROR = `CREATE_JWT_ERROR`,
    VERIFY_JWT_ERROR = `VERIFY_JWT_ERROR`,
    CONFIRMATION_ERROR = `CONFIRMATION_ERROR`,
    AUTH_ERROR = `AUTH_ERROR`,
    PASSWORD_NOT_COMPARED = `Password not compared`,
    DEVICE_NOT_FOUND = `Device not found`,
    DEVICE_NOT_DELETE = `Device_not deleted`,
    DEVICES_NOT_DELETE = `Devices_not deleted`,
    FOREIGN_DEVICE_NOT_DELETE = `Foreign device not deleted`,
    USER_EMAIL_EXIST = `User email exist`,
    USER_LOGIN_EXIST = `User login exist`,
    USER_EMAIL_NOT_CONFIRMED = `User email not confirmed`,
    USER_EMAIL_CONFIRMED = `User email is confirmed`,
    CONFIRMATION_CODE_EXPIRED = `Confirmation code is expired`,
    RECOVERY_CODE_NOT_DELETE = `RECOVERY_CODE_NOT_DELETE`,
    RECOVERY_CODE_NOT_FOUND = `RECOVERY_CODE_NOT_FOUND`,
    RECOVERY_CODE_INVALID = `RECOVERY_CODE_INVALID`,
    TOKEN_NOT_VERIFY = `Token not verified`,

    // ↓↓↓ BLOGS
    BLOG_NOT_FOUND = `Blog not found`,
    NEW_BLOG_NOT_CREATED = `NEW_BLOG_NOT_CREATED`,
    BLOG_NOT_DELETED = `Blog not deleted`,



    // ↓↓↓ POSTS
    POSTS_NOT_DELETED = `Posts not deleted`,
    POST_NOT_DELETED = `Post not deleted`,
    POST_NOT_FOUND = `Post not found`,
    NOT_FOUND_POST_BY_POST_ID = `NOT_FOUND_POST_BY_POST_ID`,
    NOT_FOUND_POST_BY_USER_ID = `NOT_FOUND_POST_BY_USER_ID`,


    // ↓↓↓ USERS
    USER_NOT_FOUND = `User not found`,
    NOT_FOUND_USER_BY_ID = `NOT_FOUND_USER_BY_ID`,
    NOT_FOUND_USER_BY_LOGIN_OR_EMAIL = `NOT_FOUND_USER_BY_LOGIN_OR_EMAIL`,
    USER_NOT_DELETE = `User not deleted`,


    // ↓↓↓ COMMENTS
    COMMENT_NOT_FOUND = `Comment not found`,
    NOT_FOUND_COMMENT_BY_COMMENT_ID = `NOT_FOUND_COMMENT_BY_COMMENT_ID`,
    FOREIGN_COMMENT_NOT_UPDATED = `Foreign comment not updated`,
    FOREIGN_COMMENT_NOT_DELETED = `Foreign comment not deleted`,
    NOT_CREATED_COMMENT = `NOT_CREATED_COMMENT`,
    NOT_UPDATED_COMMENT = `NOT_UPDATED_COMMENT`,
    COMMENT_NOT_DELETE = `Comment not deleted`,

}




// export const errorMessages = {

//     // ↓↓↓ BLOGS
//     notFoundBlog(id: string, res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `blog with id: '${id}' does't exist`,
//                         field: `id`
//                     }
//                 ]
//             })
//     },

//     newBlogNotCreated() {

//         return {
//             errorsMessages: [
//                 {
//                     message: `new blog didn't create`,
//                 }
//             ]
//         }
//     },



//     // ↓↓↓ POSTS
//     notFoundPost(id: string, res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `post with id: '${id}' does't exist`,
//                         field: `id`
//                     }
//                 ]
//             })
//     },

//     notFoundPostByPostId(postId: string, res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `post with postId: '${postId}' does't exist`,
//                         field: `postId`
//                     }
//                 ]
//             })
//     },



//     // ↓↓↓ USERS
//     notFoundUserById(id: string, res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `user with id: '${id}' does't exist`,
//                         field: `id`
//                     }
//                 ]
//             })
//     },


//     notFoundUserByLoginOrEmail(loginOrEmail: string, field?: string) {
//         return {
//             errorsMessages: [
//                 {
//                     message: `user with '${loginOrEmail}' does't exist`,
//                     field: `loginOrEmail`
//                 }
//             ]
//         }
//     },


//     // ↓↓↓ AUTH
//     confirmationError(code: string, res: Response) {
//         res
//             .status(HTTP_STATUSES.bad_request_400)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `confirmation code '${code}' is incorrect, expired or already been applied`,
//                         field: `code`
//                     }
//                 ]
//             })
//     },

//     authError(message: string, field: string) {

//         if (!field.length) {
//             return {
//                 errorsMessages: [
//                     {
//                         message: message,
//                     }
//                 ]
//             }
//         }

//         return {
//             errorsMessages: [
//                 {
//                     message: message,
//                     field: field,
//                 }
//             ]
//         }



//     },





//     // ↓↓↓ JWT
//     signJWTError() {
//         return {
//             errorsMessages: [
//                 {
//                     message: `login error`,
//                     field: `login/password`
//                 }
//             ]
//         }
//     },

//     verifyJWTError(res: Response) {
//         res
//             .status(HTTP_STATUSES.unauthorization_401)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `error of login: can't verify token`,
//                         field: `authorization`
//                     }
//                 ]
//             })
//     },




//     // ↓↓↓ POST COMMENTS
//     notFoundPostComment(id: string, res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `comment with 'id': '${id}' does't exist`,
//                         field: `id`
//                     }
//                 ]
//             })
//     },

//     notFoundPostCommentByCommentId(commentId: string, res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `comment with 'commentId': '${commentId}' does't exist`,
//                         field: `commentId`
//                     }
//                 ]
//             })
//     },

//     cantUpdateForeignPostComment(res: Response) {
//         res
//             .status(HTTP_STATUSES.forbidden_403)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `can't update foreign comment`,
//                         field: `authorization`
//                     }
//                 ]
//             })
//     },
//     cantDeleteForeignPostComment(res: Response) {
//         res
//             .status(HTTP_STATUSES.forbidden_403)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `can't delete foreign comment`,
//                         field: `authorization`
//                     }
//                 ]
//             })
//     },

//     notCreatedPostComment(res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `can't create comment`,
//                         // field: `postId`
//                     }
//                 ]
//             })
//     },

//     notUpdatedPostComment(res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `can't update comment`,
//                         // field: `postId`
//                     }
//                 ]
//             })
//     },

//     notDeletedPostComment(res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `can't delete comment`,
//                         // field: `postId`
//                     }
//                 ]
//             })
//     },

// }
