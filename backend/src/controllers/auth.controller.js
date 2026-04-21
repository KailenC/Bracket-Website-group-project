const userModel = require("../models/user.model");
const jwtUtil = require("../utils/jwt");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  const { first_name, last_name, username, email, password } = req.body;

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
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.createUser({
      first_name,
      last_name,
      username,
      email,
      hashedPassword,
    });
    res.status(201).json({
      message: "User registered",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Internal server error");
    // Handle duplicate username/email
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userModel.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwtUtil.generateToken({
      id: user.id,
      username: user.username,
    });

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getUserProfile = async (req, res) => {
  //console.log("REQ.USER:", req.user);
  try {
    const user = await userModel.getUserByUsername(req.user.username);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      username: user.username,
      email: user.email,
      id: user.id,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { register, login, getUserProfile };
