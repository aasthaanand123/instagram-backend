const express = require("express");
const router = express.Router();

const passport = require("../auth/passport");

const controller = require("../controller/controller");
//import model
router.post(
  "/api/authenticate",
  passport.authenticate("local", {
    successRedirect: "/api/success",
    failureRedirect: "/api/failure",
  })
);
router.get("/api/success", controller.getSuccess);
router.get("/api/failure", controller.getFailure);
//follow a user based on id
router.post("/api/follow/:id", controller.postFollow);

//unfollow user based on id
router.post("/api/unfollow/:id", controller.postUnfollow);
//authenticate and get user profile
router.get("/api/user", controller.getUser);
//create a new post by the authenticated user
router.post("/api/posts", controller.postPosts);
//delete post with given id in params
router.delete("/api/posts/:id", controller.deletePosts);
//like post with a particular id if the user is authenticated
router.post("/api/like/:id", controller.postLike);
router.post("/api/unlike/:id", controller.postUnlike);
//add comment for post with id by the authenticated user
router.post("/api/comment/:id", controller.postComment);
router.get("/api/posts/:id", controller.getPosts);
//get all posts by the authenticated user sorted by post time
router.get("/api/all_posts", controller.getAllPosts);
module.exports = router;
