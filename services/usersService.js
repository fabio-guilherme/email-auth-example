const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var usersModel = require("../models/usersModel");
var tokensModel = require("../models/tokensModel");
//const cryptoRandomString = require('crypto-random-string');

module.exports.login = async function(userInfo) {
    console.log("[userService.login] userInfo = " + JSON.stringify(userInfo));
    try {
        let user = await usersModel.getUserByEmail(userInfo.email);
        console.log("[userService.login] user  = " + JSON.stringify(user));
        //if (user != null && user.password == userInfo.password) {
        // With encryption, it should be something like this:
        if (user != null && bcrypt.compareSync(userInfo.password, user.password)) {
            return { status: 200, msg: "User successfully logged." };
        } else {
            return { status: 404, msg: "Wrong email or password." };
        }
    } catch (err) {
        return { status: 500, msg: err.message };
    }
};


module.exports.signup = async function(userInfo) {
    try {
        let user = await usersModel.getUserByEmail(userInfo.email);
        console.log("[userService.signup] user  = " + JSON.stringify(user));
        if (user != null) {
            // User already exists
            return { status: 400, msg: 'This email address is already associated with another account.' };
        } else {
            // Password hashing for saving into databse
            userInfo.password = bcrypt.hashSync(userInfo.password, 10);
            // Create and save user
            let result = await usersModel.saveUser(userInfo);
            if (result.status = 200) { // Status OK
                // Verification code generation
                let token = { user_id: result.data.user_id, token: cryptoRandomString({ length: 20, type: 'url-safe' }) };
                const verificationToken = await tokensModel.saveToken(token)
                    // JWT token 
                let jwtTokenEmailVerify = jwt.sign({ email: user.dataValues.email }, 'secret', { expiresIn: "1h" });
                //sending verificaiton email
                await verificationService.sendVerificationEmail(userInfo.email, verificationToken.dataValues.token, jwtTokenEmailVerify)
                return { status: 200, msg: `You have Registered Successfully, Activation link sent to: ${userInfo.email}` };
            } else {
                return { status: result.status, msg: result.smg };
            }
        }
    } catch (err) {
        console.log(err);
        return { status: 500, msg: err.message };
    }
};