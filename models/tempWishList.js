const mongoose = require("mongoose");
const tempWishListSchema = new mongoose.Schema({
  name:{
    type:String,
    required:[true,"Please enter a Name"],
  },
  email: {
    type: String,
    required: [true, "Please enter a Email"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Please enter a Phone Number"],
  },
  course:{
    type:String,
    required:[true, "Please enter a Course"],
  },
  stream:{
    type:String,
    required:[true, "Please enter a Stream"],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TempWishList", tempWishListSchema);
