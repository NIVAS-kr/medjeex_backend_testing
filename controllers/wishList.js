const Post = require("../models/post");
const WishList = require("../models/wishList");
const User = require("../models/user");
const wishList = require("../models/wishList");
const { sendEmail } = require("../middlewares/sendEmail");
exports.addToWishList = async (req, res) => {
  try {
    const newWishListData = {
        owner: req.user._id,
        post: req.params.postId,
    };
    const newWishList = await WishList.create(newWishListData);

    const user = await User.findById(req.user._id);
    user.wishLists.push(newWishList._id);
    await user.save();
    res.status(201).json({
      success: true,
      wishList: newWishList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromWishList = async (req, res) => {
  try {
    const wishList = await WishList.findOne({post:req.params.postId});
    if (!wishList) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (wishList.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to delete this post",
      });
    }
    await wishList.deleteOne();
    const user = await User.findById(req.user._id);
    const index = req.user.posts.indexOf(req.params.postId);
    user.posts.splice(index, 1);
    await user.save();
    return res.status(200).json({
      success: true,
      message: "removed from WishList successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getWishListsForPost = async (req, res) => {
  try {
    const wishLists = await WishList.find({ post: req.params.postId }).populate('owner');
    if(!wishLists)wishLists = [];
    res.status(200).json({
      success: true,
      wishLists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getWishListById = async (req, res) => {
  try {
    const wishList = await WishList.findById(req.params.wishListId).populate('post');
    if(!wishList){
      return res.status(404).json({
        success: false,
        message: "WishList not found",
      });
    }
    if(wishList.owner.toString() !== req.user._id.toString()){
      return res.status(401).json({
        success: false,
        message: "You are not authorized to access this wishList",
      });
    }
    res.status(200).json({
      success: true,
      wishList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyWishLists = async (req, res) => {
  try {
    const wishLists = await WishList.find({ owner: req.user._id}).populate('post');
    if(!wishLists)wishLists = [];
    res.status(200).json({
      success: true,
      wishLists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.SendEmailForWishLists = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    const wishLists = await WishList.find({ post: req.params.postId }).populate('owner','email');
    if(!wishLists)wishLists = [];
    wishLists.forEach(async (wishList) => {
        await sendEmail({
          email: wishList.owner.email,
          subject: "You Have a new Post in your Wishlist",
          message: `The Post that you had WishListed is now Live. Check it out at MEDJEEX\n post : ${post.title}`,
        });
    });
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addToWishListWithoutLogin = async (req, res) => {
  try {
    const newWishListData = {
        email: req.body.email,
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
    };
    await sendEmail({
      email: "Medjeex.query@gmail.com",
      subject: "I am Interested In a course on MEDJEEX",
      message: `Hello Sir ,\n name : ${req.body.name}\n email : ${req.body.email}\n phone : ${req.body.phoneNumber}\n I am interested in the course/mentorship on MEDJEEX`,
    });
    const newWishList = await WishList.create(newWishListData);
    res.status(201).json({
      success: true,
      wishList: newWishList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendEmailsForUnAuthenticated = async (req, res) => {
  try {
    const wishLists = await WishList.find();
    if(!wishLists)wishLists = [];
    wishLists.forEach(async (wishList) => {
        await sendEmail({
          email: wishList.email,
          subject: "You Have a new Post in your Wishlist",
          message: `The Post that you had WishListed is now Live. Check it out at MEDJEEX\n`,
        });
    });
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};