const mongoose = require("mongoose");
// taking schema class from mongoose
const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "adminmodel"
  },
  title: {
    type: String,
    required: true
  },
  recipe: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = RecipePostModel = mongoose.model(
  "recipepostmodel",
  RecipeSchema
);
