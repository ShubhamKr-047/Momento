import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Typography,
  useTheme,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setPost, deletePost } from "state";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [newComment, setNewComment] = useState(""); // state for new comment input
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageInView, setImageInView] = useState(false);
  const imageRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  // Lazy loading for images using Intersection Observer
  useEffect(() => {
    if (!picturePath) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before image comes into view
      }
    );

    const currentImageRef = imageRef.current;
    
    if (currentImageRef) {
      observer.observe(currentImageRef);
    }

    return () => {
      if (currentImageRef) {
        observer.unobserve(currentImageRef);
      }
    };
  }, [picturePath]);

  const patchLike = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/posts/${postId}/like`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: loggedInUserId }),
      }
    );
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  // console.log(comments);
  const addComment = async () => {
    if (!newComment.trim()) return; // Don't add empty comments

    const response = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/posts/${postId}/comment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: loggedInUserId, comment: newComment }),
      }
    );
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
    setNewComment(""); // Clear the input field
  };

  const handleDeletePost = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: loggedInUserId }),
        }
      );
      
      if (response.ok) {
        dispatch(deletePost({ postId }));
      } else {
        const error = await response.json();
        alert(error.message || "Failed to delete post");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post");
    }
    setDeleteDialogOpen(false);
  };

  const handleDeleteComment = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/posts/${postId}/comment/${commentToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: loggedInUserId }),
        }
      );
      
      if (response.ok) {
        const updatedPost = await response.json();
        dispatch(setPost({ post: updatedPost }));
      } else {
        const error = await response.json();
        alert(error.message || "Failed to delete comment");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment");
    }
    setDeleteCommentDialogOpen(false);
    setCommentToDelete(null);
  };

  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />
      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>
      {picturePath && (
        <Box
          ref={imageRef}
          sx={{
            width: "100%",
            minHeight: imageLoaded ? "auto" : "300px",
            backgroundColor: imageLoaded ? "transparent" : palette.neutral.light,
            borderRadius: "0.75rem",
            marginTop: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {imageInView && (
            <img
              width="100%"
              height="auto"
              alt="post"
              style={{
                borderRadius: "0.75rem",
                display: imageLoaded ? "block" : "none",
              }}
              src={picturePath}
              onLoad={() => setImageLoaded(true)}
            />
          )}
          {!imageLoaded && imageInView && (
            <CircularProgress />
          )}
        </Box>
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>

        <FlexBetween gap="0.3rem">
          <IconButton>
            <ShareOutlined />
          </IconButton>
          {loggedInUserId === postUserId && (
            <IconButton onClick={() => setDeleteDialogOpen(true)}>
              <DeleteOutlined sx={{ color: palette.neutral.mediumMain }} />
            </IconButton>
          )}
        </FlexBetween>
      </FlexBetween>
      {isComments && (
        <Box mt="0.5rem">
          {comments.map((comment, i) => (
            <Box key={`${name}-${i}`}>
              <Divider />
              <FlexBetween sx={{ m: "0.5rem 0", pl: "1rem", pr: "1rem" }}>
                <Typography sx={{ color: main, flex: 1 }}>
                  {comment.firstName && comment.lastName ? (
                    <>
                      <strong 
                        onClick={() => navigate(`/profile/${comment.userId}`)}
                        style={{ 
                          cursor: "pointer", 
                          color: primary,
                          textDecoration: "none"
                        }}
                        onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                        onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                      >
                        {comment.firstName} {comment.lastName}
                      </strong>: {comment.comment}
                    </>
                  ) : (
                    comment.comment
                  )}
                </Typography>
                {comment.userId === loggedInUserId && (
                  <IconButton 
                    onClick={() => {
                      setCommentToDelete(comment._id);
                      setDeleteCommentDialogOpen(true);
                    }}
                    size="small"
                  >
                    <DeleteOutlined sx={{ fontSize: "1rem", color: palette.neutral.mediumMain }} />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>
          ))}
          <Divider />

          {/* Comment input field */}
          <Box mt="1rem" display="flex" gap="0.5rem" alignItems="center">
            <TextField
              label="Add a comment"
              variant="outlined"
              fullWidth
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button variant="contained" onClick={addComment}>
              Post
            </Button>
          </Box>
        </Box>
      )}

      {/* Delete Post Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: palette.background.alt,
            padding: "1rem",
          },
        }}
      >
        <DialogTitle sx={{ color: palette.neutral.dark }}>
          Delete Post
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: palette.neutral.main }}>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: palette.neutral.main }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeletePost}
            variant="contained"
            sx={{ 
              backgroundColor: palette.primary.main,
              color: palette.background.alt,
              "&:hover": {
                backgroundColor: palette.primary.dark,
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Comment Confirmation Dialog */}
      <Dialog
        open={deleteCommentDialogOpen}
        onClose={() => {
          setDeleteCommentDialogOpen(false);
          setCommentToDelete(null);
        }}
        PaperProps={{
          sx: {
            backgroundColor: palette.background.alt,
            padding: "1rem",
          },
        }}
      >
        <DialogTitle sx={{ color: palette.neutral.dark }}>
          Delete Comment
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: palette.neutral.main }}>
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteCommentDialogOpen(false);
              setCommentToDelete(null);
            }}
            sx={{ color: palette.neutral.main }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteComment}
            variant="contained"
            sx={{ 
              backgroundColor: palette.primary.main,
              color: palette.background.alt,
              "&:hover": {
                backgroundColor: palette.primary.dark,
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </WidgetWrapper>
  );
};

export default PostWidget;
