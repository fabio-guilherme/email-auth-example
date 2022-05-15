var express = require('express');
var router = express.Router();
var usersService = require("../services/usersService");

/* POST login information */
router.post('/login', async function(req, res, next) {
    let userInfo = req.body;
    console.log("[userRoutes] User info = " + JSON.stringify(userInfo));
    let result = await usersService.login(userInfo);
    res.status(result.status).send(result.msg);
});

module.exports = router;