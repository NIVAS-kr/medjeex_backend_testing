const express = require("express");
const {
  addToWishList,
  removeFromWishList,
  getWishListById,
  getWishListsForPost,
  getMyWishLists,
  SendEmailForWishLists,
  addToWishListWithoutLogin,
  sendEmailsForUnAuthenticated,
} = require("../controllers/wishList");

const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/auth");
const router = express.Router();
router
  .route("/wishList/me")
  .get(isAuthenticated, getMyWishLists);


router
    .route("/wishList/add/:postId")
    .post(isAuthenticated, addToWishList);
router    
    .route("/wishList/remove/:postId")
    .delete(isAuthenticated, removeFromWishList);
router    
  .route("/wishList/:wishListId")
  .get(isAuthenticated, getWishListById);
router  
  .route("/wishList/all/:postId")
  .get(isAuthenticated, isAdmin,getWishListsForPost);
  
router
  .route("/wishList/sendMassEmail/:postId")
  .get(isAuthenticated, isAdmin,SendEmailForWishLists);

router
  .route("/wishList/addToWishListWithoutLogin")
  .post(isAuthenticated, addToWishListWithoutLogin);
router
  .route("/wishList/sendEmailsForUnAuthenticated")
  .get(sendEmailsForUnAuthenticated);
module.exports = router;
