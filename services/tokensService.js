// It is GET method, you have to write like that
//    app.get('/confirmation/:email/:token',confirmEmail)

exports.confirmEmail = function(req, res, next) {
    Token.findOne({ token: req.params.token }, function(err, token) {
        // token is not found into database i.e. token may have expired 
        if (!token) {
            return res.status(400).send({ msg: 'Your verification link may have expired. Please click on resend for verify your Email.' });
        }
        // if token is found then check valid user 
        else {
            User.findOne({ _id: token._userId, email: req.params.email }, function(err, user) {
                // not valid user
                if (!user) {
                    return res.status(401).send({ msg: 'We were unable to find a user for this verification. Please SignUp!' });
                }
                // user is already verified
                else if (user.isVerified) {
                    return res.status(200).send('User has been already verified. Please Login');
                }
                // verify user
                else {
                    // change isVerified to true
                    user.isVerified = true;
                    user.save(function(err) {
                        // error occur
                        if (err) {
                            return res.status(500).send({ msg: err.message });
                        }
                        // account successfully verified
                        else {
                            return res.status(200).send('Your account has been successfully verified');
                        }
                    });
                }
            });
        }

    });
};


exports.resendLink = function(req, res, next) {

    User.findOne({ email: req.body.email }, function(err, user) {
        // user is not found into database
        if (!user) {
            return res.status(400).send({ msg: 'We were unable to find a user with that email. Make sure your Email is correct!' });
        }
        // user has been already verified
        else if (user.isVerified) {
            return res.status(200).send('This account has been already verified. Please log in.');

        }
        // send verification link
        else {
            // generate token and save
            var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
            token.save(function(err) {
                if (err) {
                    return res.status(500).send({ msg: err.message });
                }

                // Send email (use credintials of SendGrid)
                var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
                var mailOptions = { from: 'no-reply@example.com', to: user.email, subject: 'Account Verification Link', text: 'Hello ' + user.name + ',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + user.email + '\/' + token.token + '\n\nThank You!\n' };
                transporter.sendMail(mailOptions, function(err) {
                    if (err) {
                        return res.status(500).send({ msg: 'Technical Issue!, Please click on resend for verify your Email.' });
                    }
                    return res.status(200).send('A verification email has been sent to ' + user.email + '. It will be expire after one day. If you not get verification Email click on resend token.');
                });
            });
        }
    });
};