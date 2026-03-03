const pool = require("../config/db");

const createUser = async (userData) => {
    const {first_name, last_name, username, email, hashedPassword} = userData;

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, username, email, password)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, username, email, password`,
      [first_name, last_name, username, email, hashedPassword]
    );

    return result.rows[0];
}

const getUserByUsername = async (username) => {
    const result = await pool.query (
        "SELECT * FROM users WHERE username = $1",
        [username]
    );
    return result.rows[0];
}

module.exports = {createUser, getUserByUsername};