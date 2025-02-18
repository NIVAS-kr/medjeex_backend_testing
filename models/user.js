const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a Name"],
  },
  role:{
    type:String,
    default: 'user',
    enum: ['user', 'admin']
  },
  phoneNumber:{
    type:String,
    required:[true,"Please enter a Phone Number"],
  },
  email: {
    type: String,
    required: [true, "Please enter a Email"],
    unique: [true, "Email already exists"],
  },
  imageUrl:{
    type:String,
    required:[true,"Please enter a Image Url"],
  },
  isEmailVerified:{
    type:Boolean,
    default:false
  },
  password: {
    type: String,
    required: [true, "Please enter a Password"],
    unique: [true, "Email already exists"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  posts: [
    {
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      }
    },
  ],
  wishLists: [
    {
      wishList: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WishList",
      }
    },
  ],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  verifyToken: String,
  verifyTokenExpire: Date,
});
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.matchPassword = async function (password) {
  console.log(password + "  " + this.password);
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = async function () {
  console.log(process.env.JWT_SECRET);
  return await jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
};
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  console.log(resetToken);
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
userSchema.methods.getVerifyToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  console.log(token);
  this.verifyToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.verifyTokenExpire = Date.now() + 10 * 60 * 1000;
  return token;
};
module.exports = mongoose.model("User", userSchema);
