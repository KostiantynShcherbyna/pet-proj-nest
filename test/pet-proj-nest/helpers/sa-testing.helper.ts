import { CreateBlogBodyInputModel } from "../../../src/features/blogger/api/models/input/create-blog.body.input-model"
import request from "supertest"
import { endpoints } from "./routing.helper"
import { faker } from "@faker-js/faker"
import { CreatePostBodyInputModel } from "../../../src/features/blogger/api/models/input/create-post.body.input-model"
import { superUser } from "../../ht16/helpers/prepeared-data"

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

export class SaTestingHelper {
  constructor(private readonly server: any) {
  }

  async createUsers(usersCount: number): Promise<CreateUserTestType[]> {
    const users: CreateUserTestType[] = []
    for (let i = 0; i < usersCount; i++) {
      const inputUserData = {
        login: `user${i}`,
        email: `user${i}@email.com`,
        password: `password${i}`,
      }
      const response = await request(this.server)
        .post(endpoints.authController.registration())
        .auth(superUser.login, superUser.password, { type: "basic" })
        .send(inputUserData)

      users.push({ id: response.body.id, ...inputUserData })
    }
    return users
  }

}