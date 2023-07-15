//  BLOG_POSTS body Validator
export const POSTS_TITLE_MAX_LENGTH = 30
export const POSTS_SHORTDESCRIPTION_MAX_LENGTH = 100
export const POSTS_CONTENT_MAX_LENGTH = 1000

//  BLOGS body Validator
export const BLOGS_NAME_MAX_LENGTH = 15
export const BLOGS_DESCRIPTION_MAX_LENGTH = 500
export const BLOGS_WEBSITEURL_MAX_LENGTH = 100
export const BLOGS_WEBSITEURL_REGEX = /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/

//  EMAIL body Validator
export const EMAIL_REGISTRATION_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

//  NEW_PASSWORD body Validator
export const PASSWORD_MAX_LENGTH = 20
export const PASSWORD_MIN_LENGTH = 6


//  POST_COMMENTS body Validator
export const COMMENT_CONTENT_MAX_LENGTH = 300
export const COMMENT_CONTENT_MIN_LENGTH = 20


//  REGISTRATION body Validator
export const LOGIN_MAX_LENGTH = 10
export const LOGIN_MIN_LENGTH = 3
export const LOGIN_REGEX = /^[a-zA-Z0-9_-]*$/


// TOKENS EXPIRES TIME
export const ACCESS_EXPIRES_TIME = "100m"
export const REFRESH_EXPIRES_TIME = "200m"
export const PASSWORD_HASH_EXPIRES_TIME = "50m"

export const EXPIRE_AT_ACCESS = +ACCESS_EXPIRES_TIME.slice(0, ACCESS_EXPIRES_TIME.length - 1)
export const EXPIRE_AT_REFRESH = +REFRESH_EXPIRES_TIME.slice(0, REFRESH_EXPIRES_TIME.length - 1)

export enum MyStatus {
  None = "None",
  Like = "Like",
  Dislike = "Dislike",
}

export enum SortDirection {
  asc = "1",
  desc = "-1",
}
export const SORT_BY_DEFAULT = "createdAt"
export const PAGE_SIZE_DEFAULT = 10
export const PAGE_NUMBER_DEFAULT = 1

export const USER_AGENT = "user_agent"

export enum BasicToken {
  token = "YWRtaW46cXdlcnR5"
}