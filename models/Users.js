const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: String,
  password: String,
  following: [ObjectId], //array of object ids of following users
  followers: [ObjectId], //array of object ids of followers
  posts: [{ type: Schema.Types.ObjectId, ref: "posts" }],
});
module.exports = mongoose.model("Users", userSchema);
