const authController = `/auth`
const bloggerController = `/blogger`
const blogsController = `/blogs`
const commentsController = `/comments`
const devicesController = `/security/devices`
const postsController = `/posts`
const saController = `/sa`
const testingController = `/testing`


export const endpoints = {

  authController: {
    passwordRecovery() {
      return `${authController}/password-recovery`
    },
    newPassword() {
      return `${authController}/new-password`
    },
    login() {
      return `${authController}/login`
    },
    refreshToken() {
      return `${authController}/refresh-token`
    },
    registrationConfirmation() {
      return `${authController}/registration-confirmation`
    },
    registration() {
      return `${authController}/registration`
    },
    registrationEmailResending() {
      return `${authController}/registration-email-resending`
    },
    logout() {
      return `${authController}/logout`
    },
    me() {
      return `${authController}/me`
    },
  },

  bloggerController: {
    getBlogsComments() {
      return `${bloggerController}/blogs/comments`
    },
    putBlog(id: string) {
      return `${bloggerController}/blogs/${id}`
    },
    deleteBlog(id: string) {
      return `${bloggerController}/blogs/${id}`
    },
    postBlog() {
      return `${bloggerController}/blogs`
    },
    getBlogs() {
      return `${bloggerController}/blogs`
    },
    postPost(blogId: string) {
      return `${bloggerController}/blogs/${blogId}/posts`
    },
    getPosts(blogId: string) {
      return `${bloggerController}/blogs/${blogId}/posts`
    },
    putPost(blogId: string, postId: string) {
      return `${bloggerController}/blogs/${blogId}/posts/${postId}`
    },
    deletePost(blogId: string, postId: string) {
      return `${bloggerController}/blogs/${blogId}/posts/${postId}`
    },
    banUser(id: string) {
      return `${bloggerController}/users/${id}/ban`
    },
    getBannedUsersOfBlog(id: string) {
      return `${bloggerController}/users/blog/${id}`
    },
  },

  saController: {
    postUser() {
      return `${saController}/users`
    }
  }


  // bloggerController: {
  //   getBlogsComments: `${bloggerController}/blogs/comments`,
  //   putBlog: `${bloggerController}/blogs/`,
  //   deleteBlog: `${bloggerController}/blogs/`,
  //   postBlog: `${bloggerController}/blogs`,
  //   getBlogs: `${bloggerController}/blogs`,
  //   postBlogPost: `${bloggerController}/blogs/`,
  //   blogsComments: `${bloggerController}/blogs/comments`,
  //   blogsComments: `${bloggerController}/blogs/comments`,
  // },
  // blogsController,
  // commentsController,
  // devicesController,
  // postsController,
  // saController,
  // testingController,
}

// export const Endpoints = {
//   authController: {
//     passwordRecovery: `${authController}/password-recovery`,
//     newPassword: `${authController}/new-password`,
//     login: `${authController}/login`,
//     refreshToken: `${authController}/refresh-token`,
//     registrationConfirmation: `${authController}/registration-confirmation`,
//     registration: `${authController}/registration`,
//     registrationEmailResending: `${authController}/registration-email-resending`,
//     logout: `${authController}/logout`,
//     me: `${authController}/me`,
//   },
//   bloggerController: {
//     getBlogsComments: `${bloggerController}/blogs/comments`,
//     putBlog: `${bloggerController}/blogs/`,
//     deleteBlog: `${bloggerController}/blogs/`,
//     postBlog: `${bloggerController}/blogs`,
//     getBlogs: `${bloggerController}/blogs`,
//     postBlogPost: `${bloggerController}/blogs/`,
//     blogsComments: `${bloggerController}/blogs/comments`,
//     blogsComments: `${bloggerController}/blogs/comments`,
//   },
//   blogsController,
//   commentsController,
//   devicesController,
//   postsController,
//   saController,
//   testingController,
// }
