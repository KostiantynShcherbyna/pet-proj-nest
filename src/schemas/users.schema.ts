import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EMAIL_REGISTRATION_REGEX, LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from 'src/utils/constants/constants';


export type UsersDocument = HydratedDocument<Users>;

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

}

export const UsersSchema = SchemaFactory.createForClass(Users);