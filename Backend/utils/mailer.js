import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const transporter  = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT) || 2525,
    logger:true,
    auth:{
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});
export const sendMail = async (mail) => {
    const mailOptions = {
        from: process.env.MAILTRAP_USER,
        to:mail.to,
        subject:mail.subject,
        text:mail.text
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    }
    catch (error) {
        console.error('Error sending email:', error);
    }

}