const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401);
  }

  const token = authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401);
  }

  try {
    const decoded = jwt.verify(token, process.env.jwt_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403);
  }
};

module.exports = authenticateToken;
