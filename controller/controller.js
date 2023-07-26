const Users = require("../models/Users");
const { ObjectId } = require("bson");
const Posts = require("../models/Posts");
const { model } = require("../models/Comments");

module.exports.getSuccess = (req, res, next) => {
  res.send("<h2>authenticated</h2>");
  next(req.user);
};
module.exports.getFailure = (req, res) => {
  res.send("<h2>not authenticated</h2>");
};
module.exports.postFollow = async (req, res, next) => {
  let { username, password, following } = req.user;
  let contains = false;
  let id = new ObjectId(req.params.id);
  for (let i = 0; i < req.user.following.length; i++) {
    if (JSON.stringify(req.user.following[i]) == JSON.stringify(id)) {
      contains = true;
      break;
    }
  }
  //update current users following
  if (!contains) {
    let newFollowing = following;
    newFollowing.push(req.params.id);
    await Users.updateOne(
      { username: username, password: password },
      { following: newFollowing }
    );
    //update other users followers
    let user = await Users.findById(req.params.id);
    let newfollowers = user.followers;
    newfollowers.push(req.user._id);
    await Users.updateOne({ _id: req.params.id }, { followers: newfollowers });
    res.send("<h2>successful</h2>");
  } else {
    res.send("<h2>already following</h2>");
  }
  next(req.user);
};
module.exports.postUnfollow = async (req, res, next) => {
  try {
    //if present in following array then only remove it
    let id = req.params.id;
    let { username, following } = req.user;
    id = new ObjectId(id);
    let contains = false;
    for (let i = 0; i < following.length; i++) {
      if (JSON.stringify(following[i]) == JSON.stringify(id)) {
        contains = true;
      }
    }
    //if contains is true then remove it
    if (contains) {
      following = following.filter(
        (el) => JSON.stringify(el._id) != JSON.stringify(id)
      );
      //update in db
      await Users.updateOne({ username: username }, { following: following });
      //update other users followers array
      let user2 = await Users.findById(id);
      let followers = user2.followers.filter(
        (el) => JSON.stringify(el) !== JSON.stringify(req.user._id)
      );
      await Users.updateOne({ _id: id }, { followers: followers });
      res.send("<h2>Unfollowed successfully</h2>");
    } else {
      res.send("<h2>already not following</h2>");
    }
    next(req.user);
  } catch (err) {
    console.log(err);
  }
};
module.exports.getUser = async (req, res, next) => {
  let { username } = req.query;
  //fetch details and return in response
  try {
    if (req.user) {
      let user = await Users.findOne({ username: username });
      //calculate total followers
      let followers = user.followers.length;
      let following = user.following.length;
      if (user) {
        let jsonObj = {
          username: user.username,
          followers: followers,
          following: following,
        };
        res.send(JSON.stringify(jsonObj));
      } else {
        res.send("<h3>User does not exist</h3>");
      }
      next(req.user);
    } else {
      res.send("<h2>requesting user not authenticated</h2>");
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports.postPosts = async (req, res, next) => {
  try {
    let { title, description } = req.body;
    if (req.user) {
      //add the post corresponding to the user
      let post = await Posts.create({
        title: title,
        description: description,
        userId: req.user._id,
      });
      //add the post id in the user record
      let newPosts = req.user.posts;
      newPosts.push(post._id);
      await Users.updateOne({ _id: req.user._id }, { posts: newPosts });
      let respPost = {
        postId: post._id,
        title: post.title,
        description: post.description,
        createdTime: post.createdTime.toUTCString(),
      };
      res.send(respPost);
    } else {
      res.send("<h2>User not authenticated</h2>");
    }
    next(req.user);
  } catch (err) {
    console.log(err);
  }
};
module.exports.deletePosts = async (req, res, next) => {
  try {
    if (req.user) {
      let postsid = req.user.posts;
      let id = new ObjectId(req.params.id);
      let contains = false;
      for (let i = 0; i < postsid.length; i++) {
        if (JSON.stringify(postsid[i]) == JSON.stringify(id)) {
          contains = true;
          break;
        }
      }
      if (contains == true) {
        await Posts.deleteOne({ _id: id });
        let updatedPosts = req.user.posts;
        //update post id in user array
        updatedPosts = updatedPosts.filter(
          (el) => JSON.stringify(el) != JSON.stringify(id)
        );
        await Users.updateOne({ _id: req.user._id }, { posts: updatedPosts });
        res.send("<h3>post deleted successfully</h3>");
      } else {
        res.send("<h3>post belongs to someone else</h3>");
      }
      next(req.user);
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports.postLike = async (req, res, next) => {
  try {
    if (req.user) {
      let id = new ObjectId(req.params.id);

      let post = await Posts.findOne({ _id: id });
      let likedAr = post.liked;
      likedAr.push(req.user._id);
      //post should not belong to user
      if (JSON.stringify(req.user._id) != JSON.stringify(post.userId)) {
        await Posts.updateOne({ _id: id }, { liked: likedAr });
        res.send("post liked successfully");
      } else {
        res.send("<h2>post cannot be liked by self</h2>");
      }
      next(req.user);
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports.postUnlike = async (req, res, next) => {
  try {
    if (req.user) {
      let id = new ObjectId(req.params.id);
      let post = await Posts.findOne({ _id: id });
      let likedAr = post.liked;
      likedAr = likedAr.filter(
        (el) => JSON.stringify(el) != JSON.stringify(req.user._id)
      );
      if (JSON.stringify(req.user._id) != JSON.stringify(post.userId)) {
        await Posts.updateOne({ _id: id }, { liked: likedAr });
        res.send("<h3>Removed from liked successfully</h3>");
      } else {
        res.send("<h3>post cannot be unliked by self</h3>");
      }
      next(req.user);
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports.postComment = async (req, res, next) => {
  try {
    if (req.user) {
      let postid = new ObjectId(req.params.id);
      let { comment } = req.body;
      let c = await model.create({ comment: comment, userId: req.user._id });
      //get post
      let post = await Posts.findOne({ _id: postid });
      let commentsAr = post.comments;
      commentsAr.push(c._id);
      //insert this comment in the post
      await Posts.updateOne({ _id: postid }, { comments: commentsAr });
      res.send(`<h3>${c._id}</h3>`);
    } else {
      res.send("<h3>error occured</h3>");
    }
    next(req.user);
  } catch (err) {
    console.log(err);
  }
};
module.exports.getPosts = async (req, res, next) => {
  try {
    if (req.user) {
      let postid = new ObjectId(req.params.id);
      let post = await Posts.findOne({ _id: postid });
      if (post) {
        //calculate likes comments
        let likes = post.liked.length;
        let comments = post.comments.length;
        let newPost = {
          post,
          numberOfLikes: likes,
          numberOfComments: comments,
        };
        res.send(newPost);
      }
    } else {
      res.send("<h2>user not authenticated</h2>");
    }
    next(req.user);
  } catch (err) {
    console.log(err);
  }
};
module.exports.getAllPosts = async (req, res, next) => {
  if (req.user) {
    let posts = await Posts.find({ userId: req.user._id }).populate("comments");
    //aggregate with comments to get all comments
    //sort by post time
    posts.sort((a, b) => {
      return a.createdTime - b.createdTime;
    });
    let postsUpd = [];
    for (let i = 0; i < posts.length; i++) {
      let newObj = {
        id: posts[i]._id,
        title: posts[i].title,
        desc: posts[i].description,
        created_at: posts[i].createdTime.toLocaleString(),
        likes: posts[i].liked.length,
        comments: posts[i].comments,
      };
      postsUpd.push(newObj);
    }
    res.send(postsUpd);
  } else {
    res.send("<h2>user not authenticated</h2>");
  }
  next(req.user);
};
