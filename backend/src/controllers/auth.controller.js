const userModel = require("../models/user.model");
// if this gives you trouble download bcryptjs 
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    const { first_name, last_name, username, email, password } = req.body;

    // hash password (not used yet)
    const saltedRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltedRounds);
    console.log(hashedPassword);       

  // Basic validation
  if (!first_name || !last_name || !username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const newUser = await userModel.createUser(req.body);
    res.status(201).json({ message: "User registered", user: newUser });
  } catch (err) {
    console.error(err.message);
    // Handle duplicate username/email
    if (err.code === '23505') { 
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  } 
    
}

const login = async (req, res) => {
    const {username, password} = req.body;

    // pull this from database for the username this is just for testing
    const hashedPassword = "$2b$10$AqHq37EzHNwaDGLKzz9Ciu/mse4oPq1l0KyA7i.u/zHIJox1zOsjO";

    if(await bcrypt.compare(password, hashedPassword)) {
        res.status(200).send("succesful login");
    } else {
        res.status(400).send("invalid credentials");
    }
}

module.exports = { register, login };