var express = require('express');
var router = express.Router();
var usersService = require("../services/usersService");

/* POST login information */
router.post('/login', async function(req, res, next) {
    let userInfo = req.body;
    console.log("[userRoutes.login] userInfo = " + JSON.stringify(userInfo));
    let result = await usersService.login(userInfo);
    res.status(result.status).send(result.msg);
});


/* POST login information */
router.post('/signup', async function(req, res, next) {
    let userInfo = req.body;
    console.log("[userRoutes.signup] userInfo = " + JSON.stringify(userInfo));
    let result = await usersService.signup(userInfo);
    res.status(result.status).send(result.msg);
});


module.exports = router;