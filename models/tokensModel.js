var { mssql, poolPromise } = require("./connection");

module.exports.saveToken = async function(token) {
    console.log("[tokensModel.saveToken] token = " + JSON.stringify(token));
    // Checks all fields needed and ignores other fields
    if (typeof token != "object" || failToken(token)) {
        if (token.errMsg)
            return { status: 400, data: { msg: token.errMsg } };
        else
            return { status: 400, data: { msg: "Malformed data" } };
    }
    try {
        let sql =
            "INSERT " +
            "INTO tokens " +
            "(user_id, token) " +
            "OUTPUT Inserted.token_id " +
            "VALUES (@user_id, @token)";
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', mssql.Int, user.user_id)
            .input('token', mssql.VarChar, user.token)
            .query(sql);
        let newTOken = result.recordset[0];
        console.log("[tokensModel.saveToken] newTOken = " + JSON.stringify(newTOken));
        return { status: 200, data: newUser };
    } catch (err) {
        console.log(err);
        if (err.errno == 547) // FK error
            return { status: 400, data: { msg: "User not found" } };
        else
            return { status: 500, data: { msg: err.errMsg } };
    }
}

// TODO: implement real logic to validate token fields
function failToken(token) {
    return false;
}