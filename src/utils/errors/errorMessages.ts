import { Response } from "express"
import { ErrorEnums } from "./errorEnums"
import { BadRequestException } from "@nestjs/common"


export const callExeption = (message: string, field: string, exeption: any) => {
    if (exeption instanceof BadRequestException) throw new BadRequestException({
        message: message,
        field: field,
    })
}

export const errorMessages = {

    universalError(exeption: any, field: string) {
        if (exeption instanceof BadRequestException) throw new BadRequestException({
            message: exeption,
            field: field,
        })
    },




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
            message: `blog with id: '${id}' does't exist`,
            field: `id`
        }
    },
    notFoundBlogByBlogId(blogId: string) {
        return {
            message: `blog with blogId: '${blogId}' does't exist`,
            field: `blogId`
        }
    },

    newBlogNotCreated() {
        return {
            message: `new blog didn't create`,
        }
    },



    // ↓↓↓ POSTS
    notFoundPost(id: string) {
        return {
            message: `post with id: '${id}' does't exist`,
            field: `id`
        }
    },

    notFoundPostByPostId(postId: string) {
        return {
            message: `post with postId: '${postId}' does't exist`,
            field: `postId`
        }
    },



    // ↓↓↓ USERS
    userNotFound(message: string, field: string) {
        return {
            message: message,
            field: field,
        }
    },
    notFoundUserByUserId(userId: string) {
        return {
            message: `not found user by '${userId}`,
            field: `userId`
        }
    },


    notFoundUserByLoginOrEmail(loginOrEmail: string) {
        return {
            message: `user with '${loginOrEmail}' does't exist`,
            field: `loginOrEmail`
        }
    },

    notFoundUserByEmail(email: string) {
        return {
            message: `user with '${email}' does't exist`,
            field: `email`
        }
    },


    // ↓↓↓ AUTH
    confirmationCodeIncorrect() {
        return {
            message: `confirmation code is incorrect`,
            field: `code`
        }
    },
    confirmationCodeExpired() {
        return {
            message: `confirmation code is expired`,
            field: `code`
        }
    },


    confirmationCodeApplied() {
        return {
            message: `confirmation code is already been applied`,
            field: `code`
        }
    },

    userConfirmed() {
        return {
            message: `user is already confirmed`,
            field: `email`
        }
    },

    userNotConfirmed(message: string, field: string) {
        return {
            message: message,
            field: field,
        }
    },

    passwordNotCompared(message: string, field: string) {
        return {
            message: message,
            field: field,
        }
    },


    userEmailExist(message: string, field: string) {
        return {
            message: message,
            field: field,
        }
    },
    userLoginExist(message: string, field: string) {
        return {
            message: message,
            field: field,
        }
    },

    userLoginOrEmailExist(loginOrEmail: string) {
        return {
            message: `loginOrEmail '${loginOrEmail}' already logged`,
            field: `loginOrEmail`
        }
    },





    // ↓↓↓ JWT

    notFoundToken() {
        return {
            message: `error of login: can't verify token`,
            field: `authorization`
        }
    },

    deviceNotFound(message: string, field: string) {
        return {
            message: message,
            field: field,
        }
    },



    // ↓↓↓ POST COMMENTS
    notFoundComment(id: string) {
        return {
            message: `comment with 'id': '${id}' does't exist`,
            field: `id`
        }
    },

    notFoundCommentByCommentId(commentId: string) {
        return {
            message: `comment with 'commentId': '${commentId}' does't exist`,
            field: `commentId`
        }
    },

    notUpdateForeignComment() {
        return {
            message: `can't update foreign comment`,
            field: `authorization`
        }
    },
    notDeleteForeignComment() {
        return {
            message: `can't delete foreign comment`,
            field: `authorization`
        }
    },

    notUpdatedComment() {
        return {
            message: `can't update comment`,
            // field: `postId`
        }
    },

    notDeletedComment() {
        return {
            message: `can't delete comment`,
            // field: `postId`
        }
    },


    notVerifyRecoveryCode(message: string, field: string) {
        return {
            message: message,
            field: field,
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
