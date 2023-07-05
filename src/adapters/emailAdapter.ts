import nodemailer from "nodemailer"
import { bodyEmailModel } from "../models/body/bodyEmailModel";

export const emailAdapter = {
    async sendEmail(emailBody: bodyEmailModel) {


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