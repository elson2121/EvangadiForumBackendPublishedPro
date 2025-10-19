const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ msg: "Authentication Invalid" });
  }
  const token = authHeader.split(" ")[1];
  //   console.log(authHeader);
  //   console.log(token);

  try {
    const { username, userid } = jwt.verify(token, process.env.JWT_SECRET);
    //create custom user property
    req.user = { username, userid };
    next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ msg: "Authentication Invalid" });
  }
};

module.exports = authMiddleware;
