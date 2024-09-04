const express = require("express");
const {
  createPost,
  deletePost,
  updatePost,
  getPost,
  getPosts
} = require("../controllers/post");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/auth");
const router = express.Router();

router.route("/post/upload").post(isAuthenticated, isAdmin,createPost);

router
  .route("/post/:id")
  .put(isAuthenticated,isAdmin, updatePost)
  .delete(isAuthenticated, isAdmin, deletePost);

  router.route("/posts").get(isAuthenticated, getPosts);
  router.route("/post/:id").get(isAuthenticated, getPost);

module.exports = router;
