// seperating database logic from the server.js file
// and putting it here. also, having the cloud server mongodb.com
// info in the default.json file

// importing mongoose to communicate with database
const mongoose = require("mongoose");

// importing config to connect the database
const config = require("config");

// grabbing the URI from the default.json
const db = config.get("mongoURI");

// connecting to mongodb.com
// new way of doing this is with Async, not promises

const connectDB = async () => {
  try {
    await mongoose.connect(
      db,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
      }
    );
    console.log("mogodb connected...");
  } catch (err) {
    console.log(err.message);

    // Exiting if the database doesn't connect
    process.exit(1);
  }
};

module.exports = connectDB;

/*
with mongoose, there have been multiiple deprication warnings
during the build, which is interestig. things like this:
DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.

this is why there are multiiple parameters in the mongoose.connect()

*/
