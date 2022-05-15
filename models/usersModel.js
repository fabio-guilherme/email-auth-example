var { mssql, poolPromise } = require("./connection");

module.exports.getUserByEmail = async function(email) {
    console.log("[usersModel.getUserByEmail] email = " + email);
    try {
        let sql =
            "SELECT * " +
            "FROM users " +
            "WHERE email = @email";
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', mssql.VarChar, email)
            .query(sql);
        console.log("[usersModel.getUserByEmail] result.recordset = " + JSON.stringify(result.recordset));
        let users = result.recordset;
        if (users.length > 0) {
            //console.log("[usersModel.getUserByEmail] user = " + JSON.stringify(users[0]));
            return users[0];
        } else {
            return null;
        }
    } catch (err) {
        console.log(err);
        return null;
    }
}

module.exports.saveUser = async function(user) {
    console.log("[usersModel.saveUser] user = " + JSON.stringify(user));
    // Checks all fields needed and ignores other fields
    if (typeof user != "object" || failUser(user)) {
        if (user.errMsg)
            return { status: 400, data: { msg: prod.errMsg } };
        else
            return { status: 400, data: { msg: "Malformed data" } };
    }
    try {
        let sql =
            "INSERT " +
            "INTO users " +
            "(email, password) " +
            "OUTPUT Inserted.user_id " +
            "VALUES (@email, @password)";
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', mssql.VarChar, user.email)
            .input('password', mssql.VarChar, user.password)
            .query(sql);
        let newUser = result.recordset[0];
        console.log("[usersModel.saveUser] newUser = " + JSON.stringify(newUser));
        return { status: 200, data: newUser };
    } catch (err) {
        console.log(err);
        return { status: 500, data: { msg: err.errMsg } };
    }
}

// TODO: implement real logic to validate user fields (ex.: email format)
function failUser(user) {
    if (typeof user.email != "string" || user.email.length < 3) {
        user.errMsg = "Invalid email";
        return true;
    } else if (typeof user.password != "string" || user.password.length < 8) {
        user.errMsg = "Invalid password";
        return true;
    }
    return false;
}