export class UserNotFound extends Error { }
export class UserByLoginOrEmailNotFound extends Error { }
export class UserNotCreated extends Error { }
export class UserNotDeleted extends Error { }
export class UserEmailExist extends Error { }
export class UserLoginExist extends Error { }
export class UserEmailConfirmed extends Error { }
export class UserEmailNotConfirmed extends Error { }
export class UserFoundError extends Error { }
export class UserDeleteError extends Error { }

export class EmailNotSend extends Error { }

export class PasswordHashNotUpdated extends Error { }

export class TokenNotVerify extends Error { }
export class TokenNotFound extends Error { }
export class TokenNotCreated extends Error { }
export class TokenNotUpdated extends Error { }
export class TokenNotDeleted extends Error { }
export class TokenDtoNotCreated extends Error { }

export class RequestAttemptsNotFound extends Error { }

export class DeviceExist extends Error { }
export class DeviceSpecialNotFound extends Error { }
export class DeviceNotFound extends Error { }
export class DevicesNotFound extends Error { }
export class DeviceNotCreated extends Error { }
export class DeviceNotUpdated extends Error { }
export class DeviceNotDeleted extends Error { }
export class DeviceForeignSpecialNotDeleted extends Error { }
export class DeviceSpecialNotDeleted extends Error { }
export class DevicesNotDeleted extends Error { }
export class DevicesOtherNotDeleted extends Error { }
export class DeviceFoundError extends Error { }
export class DeviceUpdateError extends Error { }
export class DeviceDeleteError extends Error { }
export class DevicesOtherDeleteError extends Error { }
export class DeviceSpecialDeleteError extends Error { }

export class ConfirmationNotUpdated extends Error { }
export class ConfirmationCodeNotUpdated extends Error { }
export class ConfirmationCodeExpired extends Error { }

export class PasswordNotCompared extends Error { }

export class SentDateNotUpdated extends Error { }

export class RecoveryCodeInvalid extends Error { }
export class RecoveryCodeNotFound extends Error { }
export class RecoveryCodeNotCreated extends Error { }
export class RecoveryCodeNotUpdated extends Error { }
export class RecoveryCodeNotDeleted extends Error { }
export class RecoveryCodeFindError extends Error { }
export class RecoveryCodeDeleteError extends Error { }

export class BlogNotFound extends Error { }
export class BlogNotUpdated extends Error { }
export class BlogNotDeleted extends Error { }
export class BlogFoundError extends Error { }
export class BlogCreateError extends Error { }
export class BlogUpdateError extends Error { }
export class BlogDeleteError extends Error { }
export class BlogNameUpdateError extends Error { }
export class BlogWebsiteUrlUpdateError extends Error { }
export class BlogDescriptionUpdateError extends Error { }

export class PostNotFound extends Error { }
export class PostNotUpdated extends Error { }
export class PostNotDeleted extends Error { }
export class PostsNotDeleted extends Error { }
export class PostsNotCreated extends Error { }
export class PostFoundError extends Error { }
export class PostCreateError extends Error { }
export class PostUpdateError extends Error { }
export class PostDeleteError extends Error { }
export class PostsDeleteError extends Error { }
export class PostTitleUpdateError extends Error { }
export class PostBlogIdUpdateError extends Error { }
export class PostContentUpdateError extends Error { }
export class PostShortDescriptionUpdateError extends Error { }

export class CommentNotFound extends Error { }
export class CommentNotUpdated extends Error { }
export class CommentNotDeleted extends Error { }
export class CommentForeignNotUpdated extends Error { }
export class CommentFoundError extends Error { }
export class CommentCreateError extends Error { }
export class CommentUpdateError extends Error { }
export class CommentDeleteError extends Error { }


// export class DeviceCreateError extends Error { }
// export class LastActiveDateDeviceUpdateError extends Error { }
// export class ExpireAtDeviceUpdateError extends Error { }
// export class UserByIdNotFound extends Error { }
// export class UserByEmailNotFound extends Error { }
// export class UserByUserIdNotFound extends Error { }
// export class UserConfiramtionUpdateError extends Error { }


















// export const NotFoundUserByLoginOrEmailMessage = {
//     errorsMessages: [
//         {
//             message: `not found user by 'loginOrEmail`,
//             field: `loginOrEmail`
//         }
//     ]
// }

// export const NotComparePasswordMessage = {
//     errorsMessages: [
//         {
//             message: `the password is wrong`,
//             field: `password`
//         }
//     ]
// }

// export const NotCreateTokenMessage = {
//     errorsMessages: [
//         {
//             message: `something occurred with the database, try later again`,
//         }
//     ]
// }

// export const NotUpdateTokenMessage = {
//     errorsMessages: [
//         {
//             message: `something occurred with the database, try later again`,
//         }
//     ]
// }
// export const NotFoundUserByIdMessage = {
//     errorsMessages: [
//         {
//             message: `not found user by 'id'`,
//             field: `id`
//         }
//     ]
// }
// export const NotFoundUserByEmailMessage = {
//     errorsMessages: [
//         {
//             message: `not found user by 'email`,
//             field: `email`
//         }
//     ]
// }
// export const NotFoundUserByUserIdMessage = {
//     errorsMessages: [
//         {
//             message: `not found user by 'userId'`,
//             field: `userId`
//         }
//     ]
// }
// export const NotDeleteTokenMessage = {
//     errorsMessages: [
//         {
//             message: `something occurred with the database, try later again`
//         }
//     ]
// }
// export const UserEmailExistMessage = {
//     errorsMessages: [
//         {
//             message: `email already exist`,
//             field: `email`
//         }
//     ]
// }

// export const UserLoginExistMessage = {
//     errorsMessages: [
//         {
//             message: `login already exist`,
//             field: `login`
//         }
//     ]
// }

// export const NotCreateUserMessage = {
//     errorsMessages: [
//         {
//             message: `something occurred with the database, try later again`
//         }
//     ]
// }

// export const NotSendEmailMessage = {
//     errorsMessages: [
//         {
//             message: `something occurred with the database, try later again`
//         }
//     ]
// }

// export const NotDeleteUserMessage = {
//     errorsMessages: [
//         {
//             message: `something occurred with the database, try later again`
//         }
//     ]
// }
// export const NotFoundUserByConfirmationCodeMessage = {
//     errorsMessages: [
//         {
//             message: `not found user by 'confirmationCode'`,
//             field: `code`
//         }
//     ]
// }
// export const UserEmailConfirmedByCodeMessage = {
//     errorsMessages: [
//         {
//             message: `email is confirmed`,
//             field: `code`
//         }
//     ]
// }
// export const UserEmailConfirmedByEmailMessage = {
//     errorsMessages: [
//         {
//             message: `email is confirmed`,
//             field: `email`
//         }
//     ]
// }
// export const UserConfirmationCodeExpiredByCodeMessage = {
//     errorsMessages: [
//         {
//             message: `confirmation code is expired`,
//             field: `code`
//         }
//     ]
// }
// export const UserConfirmationCodeExpiredByEmailMessage = {
//     errorsMessages: [
//         {
//             message: `confirmation code is expired`,
//             field: `email`
//         }
//     ]
// }
// export const NotUpdateConfirmationMessage = {
//     errorsMessages: [
//         {
//             message: `not update confirmation`,
//             field: `code`
//         }
//     ]
// }
// export const NotUpdateConfirmationCodeMessage = {
//     errorsMessages: [
//         {
//             message: `not update confirmation`,
//             field: `code`
//         }
//     ]
// }
// export const NotUpdateSentDateMessage = {
//     errorsMessages: [
//         {
//             message: `something occurred with the database, try later again`
//         }
//     ]
// }



// export const handleError = (err: unknown, res?: Response) => {
//     if (err instanceof InternalDBError) {
//         res?.sendStatus(httpStatuses.INTERNAL_SERVER_ERROR)
//     }


//     if (err instanceof NotFoundUser) {
//         res?.sendStatus(httpStatuses.BAD_REQUEST)
//     }
//     if (err instanceof NotFoundUserByLoginOrEmail) {
//         res?.status(httpStatuses.UNAUTHORIZED)
//             .send(NotFoundUserByLoginOrEmailMessage)
//     }
//     if (err instanceof NotComparePassword) {
//         res?.status(httpStatuses.UNAUTHORIZED)
//             .send(NotComparePasswordMessage)
//     }
//     if (err instanceof NotComparePassword) {
//         res?.status(httpStatuses.NOT_FOUND)
//             .send(NotComparePasswordMessage)
//     }
//     if (err instanceof NotCreateToken) {
//         res?.status(httpStatuses.INTERNAL_SERVER_ERROR)
//             .send(NotCreateTokenMessage)
//     }
//     if (err instanceof NotUpdateToken) {
//         res?.status(httpStatuses.INTERNAL_SERVER_ERROR)
//             .send(NotUpdateTokenMessage)
//     }
//     if (err instanceof NotFoundToken) {
//         res?.sendStatus(httpStatuses.UNAUTHORIZED)
//     }
//     if (err instanceof NotFoundUserByUserId) {
//         res?.status(httpStatuses.UNAUTHORIZED)
//             .send(NotFoundUserByUserIdMessage)
//     }
//     if (err instanceof NotFoundUserByEmail) {
//         res?.status(httpStatuses.BAD_REQUEST)
//             .send(NotFoundUserByEmailMessage)
//     }
//     if (err instanceof NotFoundUserByConfirmationCode) {
//         res?.status(httpStatuses.BAD_REQUEST)
//             .send(NotFoundUserByConfirmationCodeMessage)
//     }
//     if (err instanceof NotDeleteToken) {
//         res?.status(httpStatuses.INTERNAL_SERVER_ERROR)
//             .send(NotDeleteTokenMessage)
//     }
//     if (err instanceof UserEmailExist) {
//         res?.status(httpStatuses.BAD_REQUEST)
//             .send(UserEmailExistMessage)
//     }
//     if (err instanceof UserLoginExist) {
//         res?.status(httpStatuses.BAD_REQUEST)
//             .send(UserLoginExistMessage)
//     }
//     if (err instanceof NotCreateUser) {
//         res?.status(httpStatuses.INTERNAL_SERVER_ERROR)
//             .send(NotCreateUserMessage)
//     }
//     if (err instanceof NotSendEmail) {
//         res?.status(httpStatuses.INTERNAL_SERVER_ERROR)
//             .send(NotSendEmailMessage)
//         return
//     }
//     if (err instanceof NotDeleteUser) {
//         res?.status(httpStatuses.INTERNAL_SERVER_ERROR)
//             .send(NotDeleteUserMessage)
//     }
//     if (err instanceof UserEmailConfirmedByCode) {
//         res?.status(httpStatuses.BAD_REQUEST)
//             .send(UserEmailConfirmedByCodeMessage)
//     }
//     if (err instanceof UserEmailConfirmedByEmail) {
//         res?.status(httpStatuses.BAD_REQUEST)
//             .send(UserEmailConfirmedByEmailMessage)
//     }
//     if (err instanceof UserConfirmationCodeExpiredByCode) {
//         res?.status(httpStatuses.BAD_REQUEST)
//             .send(UserConfirmationCodeExpiredByCodeMessage)
//     }
//     if (err instanceof UserConfirmationCodeExpiredByEmail) {
//         res?.status(httpStatuses.BAD_REQUEST)
//             .send(UserConfirmationCodeExpiredByEmailMessage)
//     }
//     if (err instanceof NotUpdateConfirmation) {
//         res?.status(httpStatuses.INTERNAL_SERVER_ERROR)
//             .send(NotUpdateConfirmationMessage)
//     }
//     if (err instanceof NotUpdateConfirmation) {
//         res?.status(httpStatuses.INTERNAL_SERVER_ERROR)
//             .send(NotUpdateConfirmationCodeMessage)
//     }
//     if (err instanceof NotUpdateSentDate) {
//         res?.status(httpStatuses.INTERNAL_SERVER_ERROR)
//             .send(NotUpdateSentDateMessage)
//     }

// }