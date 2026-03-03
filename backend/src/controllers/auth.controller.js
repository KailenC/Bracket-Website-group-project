// if this gives you trouble download bcryptjs 
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    const {username, password, email} = req.body;

    // hash password
    const saltedRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltedRounds);
    console.log(hashedPassword);
    

    // check to make sure email hasnt been used, username is available
    // call model to create user in database

    // just testing that register recieves something
    res.json({
        message: "User Account Created Succesfully",
        user: {username, email},
        hashedPasswordTest: hashedPassword,
    });
    // console.log("BODY RECEIVED:", req.body);


    
}

const login = async (req, res) => {
    const {username, password} = req.body;

    // pull this from database for the username this is just for testing
    // const hashedPassword = "$2b$10$AqHq37EzHNwaDGLKzz9Ciu/mse4oPq1l0KyA7i.u/zHIJox1zOsjO";
    const saltedRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltedRounds);
    
    const matchingPass = await bcrypt.compare(password, hashedPassword);

    if(matchingPass) {
        console.log("Correct Password Entered (Should always hit this)");

    return res.status(200).json({
            success: true,
            message: "Login Sucessful (should always hit this for now)"
        });
    } else {
        return res.status(400).json({
            success: false,
            message: "Invalid credentials (if this happens something rlly bad happened)"
        });
    }
};

module.exports = { register, login };