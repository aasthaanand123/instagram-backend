const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema({
  title: String,
  description: String,
  //   createdTime:, //current time
  userId: ObjectId,
});
module.exports = mongoose.model("posts", postSchema);
