const { sendEmail } = require("../middlewares/sendEmail");
const Post = require("../models/post");
const User = require("../models/user");
const TempWishList = require("../models/tempWishList");
const crypto = require("crypto");

exports.register = async (req, res) => {
  try {
    let { name, email, password, imageUrl, phoneNumber } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password,
        imageUrl,
        phoneNumber,
      });
    } else if (user.isEmailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "user already exists" });
    } else {
      user.name = req.body.name;
      user.email = req.body.email;
      user.password = req.body.password;
      user.imageUrl = req.body.imageUrl;
      user.phoneNumber = req.body.phoneNumber;
      // const token = await user.generateToken();
      // console.log(token);
      // const options = {
      //   expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      //   httpOnly: true,
      // };
      // res.status(200).cookie("token", token, options).json({
      //   success: true,
      //   user,
      //   token,
      // });
    }
    const VerifyToken = user.getVerifyToken();
    await user.save();
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/verify/email/${VerifyToken}`;
    const message =
      "Please Verify that you are creating an account on MEDJEEX \n\n" +
      resetUrl;
    try {
      await sendEmail({
        email: user.email,
        subject: "Please Verify Your Email",
        message,
      });
      res.status(200).json({
        success: true,
        message: "Email sent successfully",
      });
    } catch (error) {
      user.VerifyToken = undefined;
      user.VerifyTokenExpire = undefined;
      await user.save();
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      res.status(400).json({
        success: false,
        message: "user does not exist",
      });
    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Please Verify Your Email First",
      });
    }
    const isMatch = await user.matchPassword(password);

    if (!isMatch)
      res.status(400).json({
        success: false,
        message: "incorrect password",
      });

    const token = await user.generateToken();
    console.log(token);
    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    res.status(200).cookie("token", token, options).json({
      success: true,
      user,
      token,
    });
  } catch (error) { }
};

exports.logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Please provide old and new password",
      });
    if (oldPassword === newPassword)
      return res.status(400).json({
        success: false,
        message: "Old and new password cannot be same",
      });
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old Password is Incorrect",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, email, imageUrl } = req.body;
    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    if (imageUrl) {
      user.imageUrl = imageUrl;
    }
    await user.save();
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = user.posts;
    const userId = user._id;
    const followers = user.followers;
    const following = user.following;

    await user.deleteOne();
    // logout User after deleting profile.
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    // removing user from following list of other users
    for (let i = 0; i < following.length; i++) {
      const follows = await User.findById(following[i]._id);
      const index = follows.followers.indexOf(userId);
      follows.followers.splice(index, 1);
      await follows.save();
    }

    // removing user from followers list of other users
    for (let i = 0; i < followers.length; i++) {
      const follower = await User.findById(followers[i]._id);
      const index = follower.following.indexOf(userId);
      follower.following.splice(index, 1);
      await follower.save();
    }

    // deleting all posts of User
    for (let i = 0; i < posts.length; i++) {
      const post = Post.findById(posts[i]._id);
      await post.deleteOne();
    }

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("posts");
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("posts");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).populate("posts");
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const resetPasswordToken = user.getResetPasswordToken();
    await user.save();
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${resetPasswordToken}`;
    const message =
      "Reset Your password by clicking on the link below \n\n" + resetUrl;
    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset",
        message,
      });
      res.status(200).json({
        success: true,
        message: "Email sent successfully",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token or Token Expired",
      });
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.verifyEmail = async (req, res) => {
  try {
    const verifyToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      verifyToken,
      verifyTokenExpire: { $gt: Date.now() },
    });
    console.log(user);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token or Token Expired",
      });
    }
    user.isEmailVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpire = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Your Email Has Been Verified Successfully , you can now Login to MEDJEEX",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.contactUs = async (req, res) => {
  try {
    const { name, email, mobileNumber, message } = req.body;
    const messageToSend = `Name: ${name} \nEmail: ${email} \nMobile Number: ${mobileNumber} \nMessage: ${message}`;
    await sendEmail({
      email: "Medjeex.query@gmail.com",
      subject: "Dear Sir I am interested in MEDJEEX",
      message: messageToSend,
    });
    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.joinWishlist = async (req, res) => {
  try {
    const { name, email, mobileNumber, course, stream } = req.body;
    const messageToSend = `Name: ${name} \nEmail: ${email} \nMobile Number: ${mobileNumber} \nCourse: ${course} \nStream: ${stream}`;
    const wish = await TempWishList.findOne({ email, course, stream });
    if (wish) {
      res.status(400).json({
        success: false,
        message: "You are already in the wishlist for this course",
      });
    }
    else {
      await sendEmail({
        email: "Medjeex.query@gmail.com",
        subject: "Dear Sir I am Interested in pursuing a course from MEDJEEX, Please add me to the wishlist",
        message: messageToSend,
      });
      await TempWishList.create({
        name: name,
        email: email,
        phoneNumber: mobileNumber,
        course: course,
        stream: stream
      });
      res.status(200).json({
        success: true,
        message: "Message sent successfully",
      });
    }
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};