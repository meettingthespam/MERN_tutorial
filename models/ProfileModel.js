const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: {
    // connecting it the type in the UsersModel
    type: mongoose.Schema.Types.ObjectId,
    ref: "usersmodel" // reference to the UsersModel
  },
  bio: {
    type: String
  },
  favorite_color: {
    type: String
  },
  website: {
    type: String
  },
  experience: [
    {
      title: {
        type: String,
        required: true
      },
      company: {
        type: String
      },
      location: {
        type: String
      },
      from: {
        type: Date
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      },
      description: {
        type: String,
        required: true
      }
    }
  ],
  // an [array] of strings
  skills: {
    type: [String]
  },
  social: {
    youtube: {
      type: String
    },
    twitter: {
      type: String
    },
    facebook: {
      type: String
    },
    linkedin: {
      type: String
    },
    instagram: {
      type: String
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = ProfileModel = mongoose.model("profilemodel", ProfileSchema);
