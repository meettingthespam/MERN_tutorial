const mongoose = require("mongoose");
// taking schema class from mongoose
const Schema = mongoose.Schema;

const InventorySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "adminmodel"
  },
  item: {
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

module.exports = InventoryPostModel = mongoose.model(
  "inventorypostmodel",
  InventorySchema
);
