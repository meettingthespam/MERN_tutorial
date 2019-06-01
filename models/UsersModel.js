const mongoose = require("mongoose");

// schema for the User Model
// notice how the password and email here is just classified as a string
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// mongoose.model() takes model name, schema
module.exports = UsersModel = mongoose.model("usersmodel", UserSchema);
