import { Response } from "express"
import { httpStatuses } from "../../httpStatuses"

export const errorMessages = {

    internalDbError() {
        return {
            errorsMessages: [
                {
                    message: `something occurred with the database, try later again`
                }
            ]
        }
    },

    // ↓↓↓ BLOGS
    notFoundBlogById(id: string) {
        return {
            errorsMessages: [
                {
                    message: `blog with id: '${id}' does't exist`,
                    field: `id`
                }
            ]
        }
    },
    notFoundBlogByBlogId(blogId: string) {
        return {
            errorsMessages: [
                {
                    message: `blog with blogId: '${blogId}' does't exist`,
                    field: `blogId`
                }
            ]
        }
    },

    newBlogNotCreated() {
        return {
            errorsMessages: [
                {
                    message: `new blog didn't create`,
                }
            ]
        }
    },



    // ↓↓↓ POSTS
    notFoundPost(id: string) {
        return {
            errorsMessages: [
                {
                    message: `post with id: '${id}' does't exist`,
                    field: `id`
                }
            ]
        }
    },

    notFoundPostByPostId(postId: string) {
        return {
            errorsMessages: [
                {
                    message: `post with postId: '${postId}' does't exist`,
                    field: `postId`
                }
            ]
        }
    },



    // ↓↓↓ USERS
    notFoundUserById() {
        return {
            errorsMessages: [
                {
                    message: `user does't exist`,
                    field: `id`
                }
            ]
        }
    },
    notFoundUserByUserId(userId: string) {
        return {
            errorsMessages: [
                {
                    message: `not found user by '${userId}`,
                    field: `userId`
                }
            ]
        }
    },


    notFoundUserByLoginOrEmail(loginOrEmail: string) {
        return {
            errorsMessages: [
                {
                    message: `user with '${loginOrEmail}' does't exist`,
                    field: `loginOrEmail`
                }
            ]
        }
    },

    notFoundUserByEmail(email: string) {
        return {
            errorsMessages: [
                {
                    message: `user with '${email}' does't exist`,
                    field: `email`
                }
            ]
        }
    },


    // ↓↓↓ AUTH
    confirmationCodeIncorrect() {
        return {
            errorsMessages: [
                {
                    message: `confirmation code is incorrect`,
                    field: `code`
                }
            ]
        }
    },
    confirmationCodeExpired() {
        return {
            errorsMessages: [
                {
                    message: `confirmation code is expired`,
                    field: `code`
                }
            ]
        }
    },


    confirmationCodeApplied() {
        return {
            errorsMessages: [
                {
                    message: `confirmation code is already been applied`,
                    field: `code`
                }
            ]
        }
    },

    userConfirmed() {
        return {
            errorsMessages: [
                {
                    message: `user is already confirmed`,
                    field: `email`
                }
            ]
        }
    },

    notUserConfirmed(loginOrEmail: string) {
        return {
            errorsMessages: [
                {
                    message: `user with '${loginOrEmail}' is not confirmed`,
                    field: `loginOrEmail`
                }
            ]
        }
    },

    notComparePassword() {
        return {
            errorsMessages: [
                {
                    message: `password is wrong`,
                    field: `password`
                }
            ]
        }
    },


    userEmailExist(email: string) {
        return {
            errorsMessages: [
                {
                    message: `email '${email}' already exist`,
                    field: `email`
                }
            ]
        }
    },
    userLoginExist(login: string) {
        return {
            errorsMessages: [
                {
                    message: `login '${login}' already exist`,
                    field: `login`
                }
            ]
        }
    },

    userLoginOrEmailExist(loginOrEmail: string) {
        return {
            errorsMessages: [
                {
                    message: `loginOrEmail '${loginOrEmail}' already logged`,
                    field: `loginOrEmail`
                }
            ]
        }
    },





    // ↓↓↓ JWT

    notFoundToken() {
        return {
            errorsMessages: [
                {
                    message: `error of login: can't verify token`,
                    field: `authorization`
                }
            ]
        }
    },

    notFoundDevice() {
        return {
            errorsMessages: [
                {
                    message: `error of login: can't find any registred device`,
                    field: `authorization`
                }
            ]
        }
    },



    // ↓↓↓ POST COMMENTS
    notFoundComment(id: string) {
        return {
            errorsMessages: [
                {
                    message: `comment with 'id': '${id}' does't exist`,
                    field: `id`
                }
            ]
        }
    },

    notFoundCommentByCommentId(commentId: string) {
        return {
            errorsMessages: [
                {
                    message: `comment with 'commentId': '${commentId}' does't exist`,
                    field: `commentId`
                }
            ]
        }
    },

    notUpdateForeignComment() {
        return {
            errorsMessages: [
                {
                    message: `can't update foreign comment`,
                    field: `authorization`
                }
            ]
        }
    },
    notDeleteForeignComment() {
        return {
            errorsMessages: [
                {
                    message: `can't delete foreign comment`,
                    field: `authorization`
                }
            ]
        }
    },

    notUpdatedComment() {
        return {
            errorsMessages: [
                {
                    message: `can't update comment`,
                    // field: `postId`
                }
            ]
        }
    },

    notDeletedComment() {
        return {
            errorsMessages: [
                {
                    message: `can't delete comment`,
                    // field: `postId`
                }
            ]
        }
    },


    notVerifyRecoveryCode() {
        return {
            errorsMessages: [
                {
                    message: `invalid recoveryCode`,
                    field: `recoveryCode`
                }
            ]
        }
    },

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
