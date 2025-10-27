import express from "express";
import {
  getFeedPosts,
  getUserPosts,
  likePost,
  addComment,
  deletePost,
  deleteComment,
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);
/* CREATE COMMENT */
router.post("/:id/comment", verifyToken, addComment);
/* DELETE POST */
router.delete("/:id", verifyToken, deletePost);
/* DELETE COMMENT */
router.delete("/:id/comment/:commentId", verifyToken, deleteComment);

export default router;
