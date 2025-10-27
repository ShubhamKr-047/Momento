import express from "express";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
  trackProfileView,
  updateSocialMedia,
  searchUsers,
  deleteUser,
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/search", verifyToken, searchUsers); // Must be before /:id
router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);

/* UPDATE */
router.post("/:id/view", verifyToken, trackProfileView);
router.patch("/:id/social", verifyToken, updateSocialMedia);
router.patch("/:id/:friendId", verifyToken, addRemoveFriend);

/* DELETE */
router.delete("/:id", verifyToken, deleteUser);

export default router;
