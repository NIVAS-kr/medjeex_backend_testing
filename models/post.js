const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter a Title"],
  },
  description: {
    type: String,
    required: [true, "Please enter a Description"],
  },
  postType:{
    type:String,
    required: [true, "Please enter a post type"],
    enum:['course','test','blog','mentorship'],
  },
  content:[
    {
      Url: {
        type: String,
        required: [true, "Please enter a Url"],
      },
      contentType:{
        type:String,
        required: [true, "Please enter a content type"],
        enum:['video','document'],
      }
    },
  ],
  imageUrl:{
    type:String,
    required:[true,"Please enter a Image Url"],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please enter a Owner"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);
