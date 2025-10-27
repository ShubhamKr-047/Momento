import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
export const createPost = async (req, res) => {
  try {
    console.log("Create post request:", req.body);
    console.log("File:", req.file);
    
    const { userId, description } = req.body;
    
    if (!userId || !description) {
      return res.status(400).json({ message: "userId and description are required" });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Convert image to base64 if file exists
    let pictureBase64 = "";
    if (req.file) {
      pictureBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath: pictureBase64,
      likes: {},
      comments: [],
    });
    await newPost.save();
    
    console.log("Post created successfully:", newPost._id);

    // Return only the new post instead of all posts
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(409).json({ message: err.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      hasMore: skip + posts.length < totalPosts,
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments({ userId });
    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      hasMore: skip + posts.length < totalPosts,
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* CREATE COMMENT */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params; // Post ID
    const { userId, comment } = req.body;

    // Find the post by ID
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get the user who is commenting
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the new comment to the post's comments array with user info
    post.comments.push({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      comment,
    });

    // Save the updated post
    const updatedPost = await post.save();

    // Return the updated post
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE POST */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params; // Post ID
    const { userId } = req.body; // User attempting to delete

    // Find the post by ID
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user is the owner of the post
    if (post.userId !== userId) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    // Delete the post
    await Post.findByIdAndDelete(id);

    // Return success message
    res.status(200).json({ message: "Post deleted successfully", postId: id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE COMMENT */
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params; // Post ID and Comment ID
    const { userId } = req.body; // User attempting to delete

    // Find the post by ID
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the comment index
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is the owner of the comment
    if (post.comments[commentIndex].userId !== userId) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    // Remove the comment from the array
    post.comments.splice(commentIndex, 1);

    // Save the updated post
    const updatedPost = await post.save();

    // Return the updated post
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
