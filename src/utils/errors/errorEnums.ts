export enum ErrorEnums {

    INTERNAL_SERVER_ERROR = `INTERNAL_SERVER_ERROR`,
    NOT_SEND_EMAIL = `NOT_SEND_EMAIL`,


    //↓↓↓ AUTH
    UNAUTHORIZED = `UNAUTHORIZED`,
    CREATE_JWT_ERROR = `CREATE_JWT_ERROR`,
    VERIFY_JWT_ERROR = `VERIFY_JWT_ERROR`,
    CONFIRMATION_ERROR = `CONFIRMATION_ERROR`,
    AUTH_ERROR = `AUTH_ERROR`,
    PASSWORD_NOT_COMPARED = `PASSWORD_NOT_COMPARED`,
    NOT_FOUND_DEVICE = `NOT_FOUND_DEVICE`,
    NOT_DELETE_DEVICE = `NOT_DELETE_DEVICE`,
    NOT_DELETE_DEVICES = `NOT_DELETE_DEVICES`,
    NOT_DELETE_FOREIGN_DEVICE = `NOT_DELETE_FOREIGN_DEVICE`,
    USER_EMAIL_EXIST = `USER_EMAIL_EXIST`,
    USER_LOGIN_EXIST = `USER_LOGIN_EXIST`,
    USER_EMAIL_NOT_CONFIRMED = `USER_EMAIL_NOT_CONFIRMED`,
    USER_EMAIL_CONFIRMED = `USER_EMAIL_CONFIRMED`,
    CONFIRMATION_CODE_EXPIRED = `CONFIRMATION_CODE_EXPIRED`,
    RECOVERY_CODE_NOT_DELETE = `RECOVERY_CODE_NOT_DELETE`,
    RECOVERY_CODE_NOT_FOUND = `RECOVERY_CODE_NOT_FOUND`,
    RECOVERY_CODE_INVALID = `RECOVERY_CODE_INVALID`,
    TOKEN_NOT_VERIFY = `TOKEN_NOT_VERIFY`,

    // ↓↓↓ BLOGS
    NOT_FOUND_BLOG = `NOT_FOUND_BLOG`,
    NEW_BLOG_NOT_CREATED = `NEW_BLOG_NOT_CREATED`,
    NOT_DELETE_BLOG = `NOT_DELETE_BLOG`,



    // ↓↓↓ POSTS
    NOT_FOUND_POST = `NOT_FOUND_POST`,
    NOT_FOUND_POST_BY_POST_ID = `NOT_FOUND_POST_BY_POST_ID`,
    NOT_FOUND_POST_BY_USER_ID = `NOT_FOUND_POST_BY_USER_ID`,


    // ↓↓↓ USERS
    NOT_FOUND_USER = `NOT_FOUND_USER`,
    NOT_FOUND_USER_BY_ID = `NOT_FOUND_USER_BY_ID`,
    NOT_FOUND_USER_BY_LOGIN_OR_EMAIL = `NOT_FOUND_USER_BY_LOGIN_OR_EMAIL`,
    NOT_DELETE_USER = `NOT_DELETE_USER`,


    // ↓↓↓ COMMENTS
    NOT_FOUND_COMMENT = `NOT_FOUND_COMMENT`,
    NOT_FOUND_COMMENT_BY_COMMENT_ID = `NOT_FOUND_COMMENT_BY_COMMENT_ID`,
    CANT_UPDATE_FOREIGN_COMMENT = `CANT_UPDATE_FOREIGN_COMMENT`,
    CANT_DELETE_FOREIGN_COMMENT = `CANT_DELETE_FOREIGN_COMMENT`,
    NOT_CREATED_COMMENT = `NOT_CREATED_COMMENT`,
    NOT_UPDATED_COMMENT = `NOT_UPDATED_COMMENT`,
    NOT_DELETED_COMMENT = `NOT_DELETED_COMMENT`,

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
