const express = require("express");
const router = express.Router();

// custom middleware
const authorization = require("../../middleware/authorization.js");

const UsersModel = require("../../models/UsersModel.js");

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
// importing the jwtSecret from the config/default file
// note, make this more secure before deployment
const config = require("config");
// validating data with express-validator
const { check, validationResult } = require("express-validator/check");

// @route               GET api/auth
// @ description        Test route
// @access              Public

// just adding the middleware as a second parameter
// makes this protected
router.get("/", authorization, async (request, response) => {
  try {
    // cool is that we can use this findById() and have
    // the request name be "anywhere in a protected route" and it'll find it
    // the .select('-password') is the user sans password
    const user = await UsersModel.findById(request.user.id).select("-password");
    response.json(user);
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server Error");
  }
});

// @route               POST api/auth
// @ description        Authenticate user and get token
// @access              Public
router.post(
  "/",
  [
    check("username", "Please enter a unique and valid username").isAscii(),
    check("password", "Please enter a password").exists()
  ],

  // to use .findOne() with mongoose, this whole thing needs to be
  // async await
  async (request, response) => {
    const errors = validationResult(request);
    // checking for errorsuring
    // (interesting syntax, but it means
    // if errors is not not empty)
    if (!errors.isEmpty()) {
      // sending a 400 bad request,
      // then the errors are actually in json format
      // so we send that back as an array
      // these are the errors from the check() method
      return response.status(400).json({ errors: errors.array() });
    }

    // using descructuring to have tidier code
    // meaning we don't have to keep typing request.body.ecetera
    const { username, password } = request.body;

    try {
      let user = await UsersModel.findOne({ username: username }); // this tecnically can be written {email} wit JS ES6
      // Check to see if user exists
      if (!user) {
        // this is keeping the same format of errors as above
        // make sure to return a response.status(), will eventually depreciate
        return response
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      // bycrypt has method called compare that takes  plain text password
      // and compares it to encrypted password
      const isMatch = await bcryptjs.compare(password, user.password);

      // checking if the password is not a match
      if (!isMatch) {
        // this is keeping the same format of errors as above
        // make sure to return a response.status(), will eventually depreciate
        return response
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      // Return jsonwebtoken (for automatic login upon registration)
      // making an object called payload that has the payload of the JWT
      // this is done by ID which is automatically generated through
      // mongodb.com (note, in mongodb.com, the id is actually called "_id",
      // but mongoose uses an abstraction so you can just use ".id" to get the id
      // which is nice for having different options for the database )
      const payload = {
        user: {
          id: user.id
        }
      };

      // taking the payload, using a custom jwtsecret, then having a short lifespan
      // ensures security? in production expiresIn needs to be shorter
      jwt.sign(
        payload,
        config.get("jwtSecret"),

        // make this shorter in production
        { expiresIn: 36000 },
        // callback
        (error, token) => {
          // if we get an error, we deal with it
          if (error) throw error;
          // if not, we send the token
          response.json({ token });
        }
      );
    } catch (error) {
      // the catch is going to be a server error,
      // since this is registration, so is it mongo, apache (or whatever) or something else?
      // console logging the error message so we can see what's up
      console.error(error.message);
      // sending the fail status
      response.status(500).send("Server error");
    }
  }
);

module.exports = router;
