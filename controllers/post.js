const Post = require("../models/post");
const User = require("../models/user");
exports.createPost = async (req, res) => {
  try {
    const newPostData = {
      title: req.body.title,
      description: req.body.description,
      postType: req.body.postType,
      imageUrl: req.body.imageUrl,
      owner: req.user._id,
      content: req.body.content,
    };
    const newPost = await Post.create(newPostData);

    const user = await User.findById(req.user._id);
    user.posts.push(newPost._id);
    await user.save();
    res.status(201).json({
      success: true,
      post: newPost,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to update this post",
      });
    }
    if(req.body.imageUrl)post.imageUrl = req.body.imageUrl;
    if(req.body.title)post.title = req.body.title;
    if(req.body.content)post.content = req.body.content;
    if(req.body.description)post.description = req.body.description;
    await post.save();
    res.status(200).json({
      success: true,
      message: "Post updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to delete this post",
      });
    }
    await post.deleteOne();
    const user = await User.findById(req.user._id);
    const index = req.user.posts.indexOf(req.params.id);
    user.posts.splice(index, 1);
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    if(!posts)posts = [];
    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};