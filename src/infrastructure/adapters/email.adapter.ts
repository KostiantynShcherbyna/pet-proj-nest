import { UsersDocument } from "src/infrastructure/schemas/users.schema"
import { emailService } from "../services/email.service"

export const emailAdapter = {
    async sendConfirmationCode(user: UsersDocument) {

        const domain = `https://somesite.com`

        const emailDTO = {
            service: "gmail",
            user: "kstntn.xxx@gmail.com",
            pass: "lkzebhjjcjymsvqc",
            from: "Kostyan <kstntn.xxx@gmail.com>",

            email: user.accountData.email,
            subject: "registration confirmation",
            message: `<h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
            <a href='${domain}/confirm-email?code=${user.emailConfirmation.confirmationCode}'>
            complete registration with code</a> ${user.emailConfirmation.confirmationCode}
            </p>`
        }

        const isSend = await emailService.sendEmail(emailDTO)

        return isSend
    },


    async sendPasswordRecovery(email: string, passwordRecoveryToken: string) {
        console.log("passwordRecoveryToken - " + passwordRecoveryToken)

        const domain = `https://somesite.com`

        const emailDTO = {
            service: "gmail",
            user: "kstntn.xxx@gmail.com",
            pass: "lkzebhjjcjymsvqc",
            from: "Kostyan <kstntn.xxx@gmail.com>",

            email: email,
            subject: "recovery password",
            message: `<h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
            <a href='${domain}/password-recovery?recoveryCode=${passwordRecoveryToken}'>${passwordRecoveryToken}</a> 
            </p>`
        }

        const isSend = await emailService.sendEmail(emailDTO)

        return isSend
    }

}