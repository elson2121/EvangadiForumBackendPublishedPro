const pool = require("../db/dbconfig"); // Updated: Import the PostgreSQL pool
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//register 
const register = async (req, res) => {
      const { username, firstname, lastname, email, password } = req.body;
      
      if (!username || !firstname || !lastname || !email || !password) {
            return res
                  .status(StatusCodes.BAD_REQUEST)
                  .json({ msg: "Please provide all information" });
      }
      try {
    // Changed: Use pool.query and $1, $2 placeholders
            const result = await pool.query(
                  "SELECT username, userid from Users where username=$1 or email=$2",
                  [username, email]
            );
    const user = result.rows; // PostgreSQL results are in .rows

            if (user.length > 0) {
                  return res
                        .status(StatusCodes.BAD_REQUEST)
                        .json({ msg: "User already registered" });
            }
            if (password.length < 8) { // Changed condition to be consistent with message
                  return res
                        .status(StatusCodes.BAD_REQUEST)
                        .json({ msg: "Password must be at least 8 characters" });
            }
            
            //encrypt password
            const salt = await bcrypt.genSalt(10);
            const hashedpassword = await bcrypt.hash(password, salt);

    // Changed: Use pool.query and $1 through $5 placeholders
            await pool.query(
                  "INSERT INTO Users (username,firstname,lastname,email,password) VALUES ($1,$2,$3,$4,$5)",
                  [username, firstname, lastname, email, hashedpassword]
            );
            return res.status(StatusCodes.CREATED).json({ msg: "User registered successfully" });
      } catch (err) {
            console.log(err.message);
            res
                  .status(StatusCodes.INTERNAL_SERVER_ERROR)
                  .json({ msg: "An unexpected error occurred, 'something went wrong'" });
      }
};

//login
const login = async (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                  msg: "Please enter all required fields",
            });
      }

      try {
    // Changed: Use pool.query and $1 placeholder
            const result = await pool.query(
                  "SELECT username,userid,password from Users where email = $1",
                  [email]
            );
    const user = result.rows; // PostgreSQL results are in .rows

            if (user.length == 0) {
                  return res.status(StatusCodes.UNAUTHORIZED).json({ // Changed to UNAUTHORIZED for login failure
                        msg: "Invalid credential",
                  });
            }
    
            // compare password
            const isMatch = await bcrypt.compare(password, user[0].password);
            if (!isMatch) {
                  return res
                        .status(StatusCodes.UNAUTHORIZED) // Changed to UNAUTHORIZED
                        .json({ msg: "Invalid credential" });
            }
            
            //create jwt token
            const username = user[0].username;
            const userid = user[0].userid;
            const token = jwt.sign({ username, userid }, process.env.JWT_SECRET, {
                  expiresIn: "1d",
            });
    
            res.status(StatusCodes.OK).json({ 
        msg: "User login successfully", 
        token,
        user: { username, userid } 
    });
    
      } catch (err) {
            console.log(err.message);
            res
                  .status(StatusCodes.INTERNAL_SERVER_ERROR)
                  .json({ msg: "An unexpected error occurred, 'something went wrong'" });
      }
};

//check user
const checkuser = async (req, res) => {
      // This function remains unchanged as it uses data from the JWT payload (req.user), not the database.
      const username = req.user.username;
      const userid = req.user.userid;
      res.status(StatusCodes.OK).json({ msg: "Valid user", username, userid });
};

module.exports = { register, checkuser, login };
