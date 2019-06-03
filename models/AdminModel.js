const mongoose = require("mongoose");

// schema for the User Model
// notice how the password and email here is just classified as a string
const AdminSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    default: Date.now
  }
});

// mongoose.model() takes model name, schema
module.exports = AdminModel = mongoose.model("adminmodel", AdminSchema);
