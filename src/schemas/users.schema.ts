import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { HydratedDocument, Model, Types } from 'mongoose';
import { Contract } from 'src/contract';
import { confirmationAndExpirationDto } from 'src/dto/confirmation-and-expiration.dto';
import { BodyRegistrationModel } from 'src/models/body/body-registration.model';
import { BodyUserModel } from 'src/models/body/body-user.model';
import { EMAIL_REGISTRATION_REGEX, LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from 'src/utils/constants/constants';
import { ErrorEnums } from 'src/utils/errors/error-enums';
import { compareHashManager } from 'src/utils/managers/compare-hash.manager';
import { generateHashManager } from 'src/utils/managers/generate-hash.manager';



export interface IAccountData {
    login: string
    email: string
    passwordHash: string
    createdAt: string;
}

export interface IEmailConfirmation {
    confirmationCode: string | null
    expirationDate: Date | null
    isConfirmed: boolean | null
    sentEmails: ISentEmail[]
}
export interface ISentEmail {
    sentDate: Date
}

@Schema()
export class Users {

    @Prop(
        raw({
            login: {
                type: String,
                required: true,
                minlength: LOGIN_MIN_LENGTH,
                maxlength: LOGIN_MAX_LENGTH,
            },
            email: {
                type: String,
                required: true,
                match: EMAIL_REGISTRATION_REGEX,
            },
            passwordHash: {
                type: String,
                required: true,
            },
            createdAt: {
                type: String,
                required: true,
            },
        }))
    accountData: IAccountData

    @Prop(
        raw({
            confirmationCode: {
                type: String,
            },
            expirationDate: {
                type: Date,
            },
            isConfirmed: {
                type: Boolean,
                required: true,
            },
            sentEmails: [
                {
                    sentDate: {
                        type: Date,
                        require: true,
                    }
                }
            ],
        }))
    emailConfirmation: IEmailConfirmation

    static async createUser(newUserData: BodyUserModel, UsersModel: UsersModel): Promise<UsersDocument> {

        const passwordHash = await generateHashManager(newUserData.password)
        const date = new Date()
        const newUserDto = {
            accountData: {
                login: newUserData.login,
                email: newUserData.email,
                passwordHash: passwordHash,
                createdAt: date.toISOString(),
            },
            emailConfirmation: {
                confirmationCode: null,
                expirationDate: null,
                isConfirmed: true,
                sentEmails: []
            }
        }

        const newUser = new UsersModel(newUserDto)
        return newUser
    }
    static async registrationUser(registrationBody: BodyRegistrationModel, UsersModel: UsersModel): Promise<UsersDocument> {

        const passwordHash = await generateHashManager(registrationBody.password)
        const date = new Date()
        const newUserDto = {
            accountData: {
                email: registrationBody.email,
                login: registrationBody.login,
                passwordHash: passwordHash,
                createdAt: date.toISOString(),
            },
            emailConfirmation: {
                confirmationCode: randomUUID(),
                expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 3,
                }),
                isConfirmed: false,
                sentEmails: []
            }
        }

        console.log("confirmationCode - " + newUserDto.emailConfirmation.confirmationCode)

        const newUser = new UsersModel(newUserDto)
        return newUser
    }
    static async deleteUser(id: string, UsersModel: UsersModel): Promise<Contract<number>> {
        const deleteUserResult = await UsersModel.deleteOne({ _id: new Types.ObjectId(id) })
        return new Contract(deleteUserResult.deletedCount, null)
    }





    checkConfirmation() {
        return this.emailConfirmation.isConfirmed === false ? false : true
    }

    async checkConfirmationAndHash(passwordHash: string, inputPassword: string): Promise<Contract<null | boolean>> {
        if (this.emailConfirmation.isConfirmed === false) return new Contract(null, ErrorEnums.USER_EMAIL_NOT_CONFIRMED)
        if (await compareHashManager(passwordHash, inputPassword) === false) return new Contract(null, ErrorEnums.PASSWORD_NOT_COMPARED)
        return new Contract(true, null)
    }

    checkEmailAndLogin({ email, login, inputEmail, inputLogin }: confirmationAndExpirationDto): Contract<null | boolean> {
        if (email === inputEmail) return new Contract(null, ErrorEnums.USER_EMAIL_EXIST)
        if (login === inputLogin) return new Contract(null, ErrorEnums.USER_LOGIN_EXIST)
        return new Contract(true, null)
    }

    checkExpiration() {
        return this.emailConfirmation.expirationDate && this.emailConfirmation.expirationDate < new Date() ? false : true
    }

    updateUserConfirmation() {
        this.emailConfirmation.isConfirmed = true
    }

    updateUserConfirmationCode() {
        this.emailConfirmation.confirmationCode = randomUUID()
    }

    async updatePasswordHash(newPassword: string) {
        const newPasswordHash = await generateHashManager(newPassword)
        this.accountData.passwordHash = newPasswordHash
    }

    addSentDate() {
        this.emailConfirmation.sentEmails.push({ sentDate: new Date() })
    }

}
interface UsersStatics {
    createUser(bodyUserModel: BodyUserModel, UsersModel: UsersModel): Promise<UsersDocument>
    registrationUser(registrationBody: BodyRegistrationModel, UsersModel: UsersModel): Promise<UsersDocument>
    deleteUser(id: string, UsersModel: UsersModel): Promise<Contract<number>>
}

export const UsersSchema = SchemaFactory.createForClass(Users)
UsersSchema.statics.createUser = Users.createUser
UsersSchema.statics.registrationUser = Users.registrationUser
UsersSchema.methods.addSentDate = Users.prototype.addSentDate
UsersSchema.methods.checkExpiration = Users.prototype.checkExpiration
UsersSchema.methods.checkConfirmation = Users.prototype.checkConfirmation
UsersSchema.methods.checkEmailAndLogin = Users.prototype.checkEmailAndLogin
UsersSchema.methods.updatePasswordHash = Users.prototype.updatePasswordHash
UsersSchema.methods.updateUserConfirmation = Users.prototype.updateUserConfirmation
UsersSchema.methods.checkConfirmationAndHash = Users.prototype.checkConfirmationAndHash
UsersSchema.methods.updateUserConfirmationCode = Users.prototype.updateUserConfirmationCode

export type UsersDocument = HydratedDocument<Users>;
export type UsersModel = Model<UsersDocument> & UsersStatics
