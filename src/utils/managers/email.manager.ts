import nodemailer from "nodemailer"
import { BodyEmailModel } from "../../models/body/body-email.model";

export const emailManager = {
    async sendEmail(emailBody: BodyEmailModel) {


        let transporter = nodemailer.createTransport({
            service: emailBody.service,
            auth: {
                user: emailBody.user,
                pass: emailBody.pass,
            },
        });

        try {
            await transporter.sendMail({
                from: emailBody.from,
                to: emailBody.email,
                subject: emailBody.subject,
                html: emailBody.message,
            });

            return true

        } catch (err) {
            console.log(`email-adapter-sendEmail - ` + err)
            return false
        }


    }
}