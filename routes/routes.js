const express = require("express");
const router = express.Router();

// const controller = require("../controller/controller");

//authenticate user on the basis of username and password

const passport = require("../auth/passport");
const Users = require("../models/Users");
const { ObjectId } = require("bson");
const Posts = require("../models/Posts");
//import model
router.post(
  "/api/authenticate",
  passport.authenticate("local", {
    successRedirect: "/api/success",
    failureRedirect: "/api/failure",
  })
);
router.get("/api/success", (req, res, next) => {
  res.send("<h2>authenticated</h2>");
  next(req.user);
});
router.get("/api/failure", (req, res) => {
  res.send("<h2>not authenticated</h2>");
});
//follow a user based on id
router.post("/api/follow/:id", async (req, res, next) => {
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
    newfollowers = user.followers;
    newfollowers.push(req.user._id);
    await Users.updateOne({ _id: req.params.id }, { followers: newfollowers });
    res.send("<h2>successful</h2>");
  } else {
    res.send("<h2>already following</h2>");
  }
  next(req.user);
});

//unfollow user based on id
router.post("/api/unfollow/:id", async (req, res, next) => {
  try {
    //if present in following array then only remove it
    let id = req.params.id;
    let { username, password, following } = req.user;
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
});
//authenticate and get user profile
router.get("/api/user", async (req, res, next) => {
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
});
//create a new post by the authenticated user
router.post("/api/posts", async (req, res, next) => {
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

      res.send(post);
    } else {
      res.send("<h2>User not authenticated</h2>");
    }
    next(req.user);
  } catch (err) {
    console.log(err);
  }
});
//delete post with given id in params
router.delete("/api/posts/:id", async (req, res, next) => {
  try {
    if (req.user) {
      let postsid = req.user.posts;
      let id = new ObjectId(req.params.id);
      contains = false;
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
});
module.exports = router;
