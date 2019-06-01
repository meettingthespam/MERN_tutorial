const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

// importing the jwtSecret from the config/default file
// note, make this more secure before deployment
const config = require("config");

// validating data with express-validator
const { check, validationResult } = require("express-validator/check");

// User Schema
const UsersModel = require("../../models/UsersModel.js");

// @route               POST api/users
// @ description        Register user
// @access              Public
router.post(
  "/",
  // for using check(), pass in a second parameter for a custom error message
  // also, the .not().isEmpty() and .isEmail() is from the docs
  // for express-validator
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please enter a unique and valid email address").isEmail(),
    check("username", "Please enter a unique and valid username").isAscii(),
    check(
      "password",
      "Please enter a password with 10 or more characters"
    ).isLength({ min: 10 })
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
    const { name, email, username, password } = request.body;

    try {
      let user = await UsersModel.findOne({ email: email }); // this tecnically can be written {email} wit JS ES6
      // Check to see if user exists
      if (user) {
        // this is keeping the same format of errors as above
        // make sure to return a response.status(), will eventually depreciate
        return response
          .status(400)
          .json({ errors: [{ msg: "user already exists" }] });
      }
      // Get user's gravatar
      // is this practical?
      const avatar = gravatar.url(email, {
        size: "200",
        rating: "pg",
        default: "mm"
      });

      // this is calling an instance of the UsersModel, but not saving it
      user = new UsersModel({
        name,
        email,
        username,
        avatar,
        password
      });

      // Encrypt password
      // to encrypt a password we need to use a "salt"
      // issue is the bigger the slower and JS is cpu slow already
      const salt = await bcryptjs.genSalt(15);

      user.password = await bcryptjs.hash(password, salt);

      await user.save();

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
      response.status(500).send("Server Error _ User 1");
    }
  }
);

module.exports = router;
