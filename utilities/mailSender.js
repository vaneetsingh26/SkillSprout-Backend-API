const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async(email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            port: 465,
            secure: true,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASSWORD,
            }
        });

        let info = await transporter.sendMail({
            from: `"SkillSprout || CodeWithVaneet" <${process.env.MAIL_USER}>`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        })
        console.log("Email sent successfully: ", info.messageId);
        return info;
    } 
    catch (error) {
        console.log("Error in mailSender:", error.message);
        throw error;
    }
}


module.exports = mailSender;