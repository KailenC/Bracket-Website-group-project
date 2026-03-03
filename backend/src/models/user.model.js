const pool = require("../config/db");

const createUser = async (userData) => {
    const {first_name, last_name, username, email, password} = userData;

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, username, email, password)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, username, email, password`,
      [first_name, last_name, username, email, password]
    );
    
    return result.rows[0];
}



module.exports = (createUser);