const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema({
  comment: String,
  userId: { type: Schema.Types.ObjectId, ref: "users" },
});
module.exports.model = mongoose.model("comments", commentSchema);
