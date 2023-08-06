import { faker } from "@faker-js/faker"
import request from "supertest"
import { endpoints } from "./routing.helper"
import { LoginBodyInputModel } from "../../../src/features/auth/api/models/input/login.body.input-model"
import { Request } from "express"
import { NewPasswordBodyInputModel } from "../../../src/features/auth/api/models/input/new-password.body.input-model"

export const suAuthData = {
  login: "admin",
  password: "qwerty",
}

export const preparedBlog = {
  valid: {
    name: "valid name",
    description: "valid description",
    websiteUrl: "https://it-incubator.io/",
  },
  newValid: {
    name: "new valid name",
    description: "new valid description",
    websiteUrl: "https://it-incubator.io/new",
  },
  invalid: {
    name: "",
    description: "",
    websiteUrl: "",
  },
}

export const preparedPost = {
  valid: {
    title: "valid title",
    shortDescription: "valid shortDescription",
    content: "valid content",
  },
  newValid: {
    title: "new valid title",
    shortDescription: "new valid shortDescription",
    content: "new valid content",
  },
  invalid: {
    title: "",
    shortDescription: "",
    content: "",
    blogId: "",
  },
  defaultPostsCount: 5,

  // generatePostInputData(blog: Blog): CreatePostWithBlogIdDto {
  //   return {
  //     ...preparedPost.valid,
  //     blogId: blog.id,
  //   };
  // },
  // generateNewPostInputData(blog: Blog): CreatePostWithBlogIdDto {
  //   return {
  //     ...preparedPost.newValid,
  //     blogId: blog.id,
  //   };
  // },
}

type CreateUserTestType = {
  id: string;
  login: string;
  email: string;
  password: string;
};

type CreateAndLoginUserTestType = {
  id: string;
  login: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
};

export class TestingAuth {
  constructor(private readonly server: any) {
  }

  private createInputUserData() {
    return {
      login: faker.person.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    }
  }

  async createUserBySU() {
    const inputUserData = this.createInputUserData()
    const response = await request(this.server)
      .post(endpoints.saController.postUser())
      .auth(suAuthData.login, suAuthData.password, { type: "basic" })
      .send(inputUserData)

    return { id: response.body.id, ...inputUserData }
  }

  async registration() {
    const inputUserData = this.createInputUserData()
    const response = await request(this.server)
      .post(endpoints.authController.registration())
      .send(inputUserData)

    return { status: response.status, inputUserData }
  }

  async registrationConfirmation(confirmationCode: string) {
    const response = await request(this.server)
      .post(endpoints.authController.registrationConfirmation())
      .send({ code: confirmationCode })

    return { status: response.status }
  }

  async registrationEmailResending(email: string) {
    const response = await request(this.server)
      .post(endpoints.authController.registrationEmailResending())
      .send({ email })

    return { status: response.status }
  }

  async login({ loginOrEmail, password }: LoginBodyInputModel) {
    const response = await request(this.server)
      .post(endpoints.authController.login())
      .set("User-Agent", faker.internet.userAgent())
      .send({ loginOrEmail, password })

    const accessToken = response.body.accessToken
    const refreshToken = response.headers["set-cookie"][0].split(";")[0].split("=")[1]

    return { status: response.status, accessToken, refreshToken }
  }

  async refreshToken(oldRefreshToken: string) {
    const response = await request(this.server)
      .post(endpoints.authController.refreshToken())
      .set("User-Agent", faker.internet.userAgent())
      .set("cookie", `refreshToken=${oldRefreshToken}`)

    const accessToken = response.body.accessToken
    const refreshToken = response.headers["set-cookie"][0].split(";")[0].split("=")[1]

    return { status: response.status, accessToken, refreshToken }
  }

  async passwordRecovery(email: string) {
    const response = await request(this.server)
      .post(endpoints.authController.passwordRecovery())
      .send({ email })
    return { status: response.status }
  }

  async newPassword({ newPassword, recoveryCode }: NewPasswordBodyInputModel) {
    const response = await request(this.server)
      .post(endpoints.authController.newPassword())
      .send({ newPassword, recoveryCode })

    console.log("response", response.body)
    return { status: response.status }
  }


}