const jwt = require("jsonwebtoken");
const config = require("config");

// middleware functions take a request, response and next
// next is a call back tfor the next piece of middleware
// to be called
module.exports = function(request, response, next) {
  // Get token from header
  const token = request.header("x-auth-token");

  // Checking if no token
  if (!token) {
    return response
      .status(401)
      .json({ msg: " No token, authorization denied" });
  }

  // Verying the token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    request.user = decoded.user;

    // you will call next() in any middleware
    next();
  } catch (error) {
    response.status(401).json({ msg: "Token not valid" });
  }
};
