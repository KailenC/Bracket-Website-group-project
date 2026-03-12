const userModel = require("../models/user.model");
// if this gives you trouble download bcryptjs
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  const { first_name, last_name, username, email, password } = req.body;

  // hash password
  const saltedRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltedRounds);

  // Basic validation
  if (!first_name || !last_name || !username || !email || !password) {

    return res.status(400).json({ error: "All fields are required" });

  }
  if (typeof password !== "string" || password.length < 6) {

    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });

  }

  try {
    const newUser = await userModel.createUser({
      first_name,
      last_name,
      username,
      email,
      hashedPassword,
    });
    res.status(201).json({ message: "User registered", user: newUser });
  } catch (err) {
    console.error(err.message);
    // Handle duplicate username/email
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await userModel.getUserByUsername(username);

  if (!user) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  res.status(200).json({ message: "Login Successful" });
};

const getUserProfile = async (req, res) => {
  const {username} = req.body;

  const user = await userModel.getUserByUsername(username);

  if(!user) {
    return res.status(400).json({error: "User not found"});
  }

  // implement user details, etc
  res.status(200).json({error: "not implemented"});
}

module.exports = { register, login, getUserProfile };
