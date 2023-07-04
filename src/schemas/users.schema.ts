import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { bodyUserModel } from 'src/models/body/bodyUserModel';
import { EMAIL_REGISTRATION_REGEX, LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from 'src/utils/constants/constants';
import { generateHash } from 'src/utils/hashFunctions/generateHash';



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
    sentEmails: Date[]
}

@Schema()
export class Users {

    _id: Types.ObjectId

    @Prop({
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
    })
    accountData: IAccountData

    @Prop({
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
    })
    emailConfirmation: IEmailConfirmation

    static async createUser(newUserData: bodyUserModel, UsersModel: UsersModel) {

        const passwordHash = await generateHash(newUserData.password)

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

}
export const UsersSchema = SchemaFactory.createForClass(Users)

interface UsersStatics {
    createUser(bodyUserModel: bodyUserModel, UsersModel: UsersModel): Promise<Users>
}
UsersSchema.statics.createUser = Users.createUser

export type UsersDocument = HydratedDocument<Users>;
export type UsersModel = Model<UsersDocument> & UsersStatics
