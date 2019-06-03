const mongoose = require("mongoose");
// taking schema class from mongoose
const Schema = mongoose.Schema;

const GenericPostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "usersmodel"
  },
  name: {
    type: String
  },
  username: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  // imitating "likes" from facebook, twitter, ect
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "usersmodel"
      }
    }
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "usersmodel"
      },
      text: {
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
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = GenericPostModel = mongoose.model(
  "genericpostmodel",
  GenericPostSchema
);
