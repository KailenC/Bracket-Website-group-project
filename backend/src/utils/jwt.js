const jwt = require("jsonwebtoken");

const SECRET = process.env.jwt_SECRET;

const generateToken = (user) => {
  if (!SECRET) {
    throw new Error("jwt_SECRET not defined");
  }
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    SECRET,
    {
      expiresIn: "7d",
    },
  );
};

module.exports = { generateToken };
