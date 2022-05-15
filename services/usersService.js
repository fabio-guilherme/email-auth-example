const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
var usersModel = require("../models/usersModel");

module.exports.login = async function(userInfo) {
    console.log("[userService] userInfo = " + JSON.stringify(userInfo));
    try {
        let user = await usersModel.getUserByEmail(userInfo.email);
        console.log("[userService] user  = " + JSON.stringify(user));
        if (user != null && user.password == userInfo.password) {
            // With encryption, it should be something like this:
            // if (user != null && Bcrypt.compareSync(body.password, user.password)) {
            return { status: 200, msg: "User successfully logged." };
        } else {
            return { status: 404, msg: "Wrong email or password." };
        }
    } catch (err) {
        return { status: 500, msg: err.message };
    }
};


exports.signup = async function(userInfo) {
    try {
        let user = await usersModel.getUserByEmail(userInfo.email);
        console.log("[userService] user  = " + JSON.stringify(user));
        if (user != null) {
            // User already exists
            return { status: 400, msg: 'This email address is already associated with another account.' };
        } else {
            // Password hashing for saving into databse
            req.body.password = Bcrypt.hashSync(req.body.password, 10);
            // create and save user
            user = new User({ name: req.body.name, email: req.body.email, password: req.body.password });
        }
    } catch (err) {
        return { status: 500, msg: err.message };
    }

    User.findOne({ email: req.body.email }, function(err, user) {
        // error occur
        if (err) {}
        // if user is not exist into database then save the user into database for register account
        else {
            // password hashing for save into databse
            req.body.password = Bcrypt.hashSync(req.body.password, 10);
            // create and save user
            user = new User({ name: req.body.name, email: req.body.email, password: req.body.password });
            user.save(function(err) {
                if (err) {
                    return res.status(500).send({ msg: err.message });
                }

                // generate token and save
                var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
                token.save(function(err) {
                    if (err) {
                        return res.status(500).send({ msg: err.message });
                    }

                    // Send email (use credintials of SendGrid)
                    var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
                    var mailOptions = { from: 'no-reply@example.com', to: user.email, subject: 'Account Verification Link', text: 'Hello ' + req.body.name + ',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + user.email + '\/' + token.token + '\n\nThank You!\n' };
                    transporter.sendMail(mailOptions, function(err) {
                        if (err) {
                            return res.status(500).send({ msg: 'Technical Issue!, Please click on resend for verify your Email.' });
                        }
                        return res.status(200).send('A verification email has been sent to ' + user.email + '. It will be expire after one day. If you not get verification Email click on resend token.');
                    });
                });
            });
        }

    });

};