//const transporter = require('./initService').transporter;
const hbs = require('nodemailer-express-handlebars');
let nodeMailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodeMailer.createTransport({
    host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
    },
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

transporter.use('compile', hbs({
    viewEngine: {
        extName: '.hbs',
        partialsDir: './email_templates/',
        layoutsDir: './email_templates/',
        defaultLayout: 'verification.hbs',
    },

    //viewEngine: 'express-handlebars',
    viewPath: './email_templates/',
    extName: '.hbs',

}));

function sendVerificationEmail(email, token, jwtToken) {
    return new Promise((resolve, reject) => {

        let mailOptions = {
            from: '<fabass@gmail.com>', // sender address
            to: email, // List of receivers
            subject: 'Verify Your Account', // Subject line
            context: {
                verificationLink: `http://localhost:4200/verification?token=${token}&email=${email}&jwtToken=${jwtToken}`
            },
            template: 'verification'
        };

        console.log("[verificationService.sendVerificationEmail] transporter.auth = " + JSON.stringify(process.env.EMAIL_USER));

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("err1 ", error);
                reject(error)

            } else {
                resolve("Activation link has been sent!")
            }
        });

    })
}

module.exports = {
    sendVerificationEmail: sendVerificationEmail
}