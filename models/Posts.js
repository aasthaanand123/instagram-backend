const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const postSchema = new Schema({
  title: String,
  description: String,
  // createdTime: { type: Date, default: Date.now }, //current time
  userId: { type: Schema.Types.ObjectId, ref: "users" },
  liked: [{ type: Schema.Types.ObjectId, ref: "users" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "comments" }],
});
module.exports = mongoose.model("posts", postSchema);
