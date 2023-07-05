import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { Contract } from "src/contracts/Contract"
import { bodyAuthModel } from "src/models/body/bodyAuthModel"
import { bodyBlogModel } from "src/models/body/bodyBlogModel"
import { bodyBlogPostModel } from "src/models/body/bodyBlogPostModel"
import { bodyRegistrationModel } from "src/models/body/bodyRegistrationModel"
import { deviceDto } from "src/models/dto/deviceDto"
import { BlogsRepository } from "src/repositories/blogs.repository"
import { DevicesRepository } from "src/repositories/devices.repository"
import { PostsRepository } from "src/repositories/posts.repository"
import { UsersRepository } from "src/repositories/users.repository"
import { BlogsModel, Blogs, BlogsDocument } from "src/schemas/blogs.schema"
import { Devices, DevicesModel } from "src/schemas/devices.schema"
import { Posts, PostsModel } from "src/schemas/posts.schema"
import { Users, UsersModel } from "src/schemas/users.schema"
import { myStatusEnum } from "src/utils/constants/constants"
import { errorEnums } from "src/utils/errors/errorEnums"
import { emailManager } from "src/utils/managers/emailManager"
import { dtoModify } from "src/utils/modify/dtoModify"
import { blogView } from "src/views/blogView"
import { postView } from "src/views/postView"
import { tokensView } from "src/views/tokensView"

@Injectable()
export class DevicesService {
    constructor(
        @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
        @InjectModel(Users.name) protected UsersModel: UsersModel,
        @Inject(UsersRepository) protected UsersRepository: UsersRepository,
        @Inject(DevicesRepository) protected DevicesRepository: DevicesRepository,
    ) { }

    async toLogin(loginBody: bodyAuthModel, deviceIp: string, userAgent: string): Promise<tokensView> {

        const tokens = await this.DevicesModel.createDevice({ deviceIp, userAgent, loginBody, usersRepositoryMngs: this.UsersRepository })
        await this.DevicesRepository.saveDocument(tokens.refreshToken)

        return {
            accessJwt: {
                accessToken: tokens.accessToken,
            },
            refreshToken: tokens.refreshToken
        }
    }


    async refreshToken(deviceSession: deviceDto, deviceIp: string, userAgent: string): Promise<Contract<null | tokensView>> {

        const userDto = [
            "_id", new Types.ObjectId(deviceSession.userId)
        ]

        const user = await this.UsersRepository.findUser(userDto)
        if (user === null) return new Contract(null, errorEnums.NOT_FOUND_USER)

        const device = await this.DevicesRepository.findDeviceByDeviceId(deviceSession.deviceId)
        if (device === null) return new Contract(null, errorEnums.NOT_FOUND_DEVICE)

        //  TODO ANY
        const newTokens: any = device.refreshDevice({ deviceIp, userAgent, userId: user._id.toString() })
        await this.DevicesRepository.saveDocument(device)

        const tokensDto = {
            accessJwt: {
                accessToken: newTokens.accessToken,
            },
            refreshToken: newTokens.refreshToken
        }

        return new Contract(tokensDto, null)
    }


    async toLogout(deviceSession: deviceDto): Promise<Contract<null | boolean>> {

        const userDto = [
            "_id", new Types.ObjectId(deviceSession.userId)
        ]

        const user = await this.UsersRepository.findUser(userDto)
        if (user === null) return new Contract(null, errorEnums.NOT_FOUND_USER)

        const deleteResult = await this.DevicesModel.deleteOne({ deviceId: deviceSession.deviceId })
        if (deleteResult.deletedCount === 0) return new Contract(null, errorEnums.NOT_DELETE_DEVICE)

        return new Contract(true, null)
    }


    async registration(registrationBody: bodyRegistrationModel): Promise<Contract<null | boolean>> {

        const user = await this.UsersRepository.findUserLoginOrEmail(registrationBody)
        if (user?.accountData.email === registrationBody.email) return new Contract(null, errorEnums.USER_EMAIL_EXIST)
        if (user?.accountData.login === registrationBody.login) return new Contract(null, errorEnums.USER_LOGIN_EXIST)

        const newUser = await this.UsersModel.registrationUser(registrationBody)
        await this.UsersRepository.saveDocument(newUser)
        // SENDING EMAIL ↓↓↓
        const isSend = await emailManager.sendConfirmationCode(newUser)
        if (isSend === false) {

            const deleteResult = await this.UsersModel.deleteOne({ _id: newUser._id })
            if (deleteResult.deletedCount === 0) return new Contract(null, errorEnums.NOT_DELETE_USER)

            return new Contract(null, errorEnums.NOT_SEND_EMAIL)
        }

        newUser.addSentDate()
        await this.UsersRepository.saveDocument(newUser)

        return new Contract(true, null)
    }


}

