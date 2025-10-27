import {
  EditOutlined,
  DeleteOutlined,
  ImageOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Typography,
  InputBase,
  useTheme,
  Button,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Dropzone from "react-dropzone";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";

const MyPostWidget = ({ picturePath }) => {
  const dispatch = useDispatch();
  const [isImage, setIsImage] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [post, setPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const { palette } = useTheme();
  const user = useSelector((state) => state.user);
  const { _id, firstName, lastName } = user;
  const token = useSelector((state) => state.token);
  const posts = useSelector((state) => state.posts);
  const mediumMain = palette.neutral.mediumMain;
  const medium = palette.neutral.medium;

  const MAX_CHARS = 500;

  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    
    // Compress the image
    const compressedFile = await compressImage(file);
    setImage(compressedFile);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(compressedFile);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handlePost = async () => {
    setIsPosting(true);
    const formData = new FormData();
    formData.append("userId", _id);
    formData.append("description", post);
    if (image) {
      formData.append("picture", image);
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const newPost = await response.json();
        // Add new post to the top of the existing posts
        dispatch(setPosts({ posts: [newPost, ...posts] }));
        setImage(null);
        setImagePreview(null);
        setPost("");
        setIsImage(false);
      } else {
        const error = await response.json();
        console.error("Failed to create post:", error);
        alert("Failed to create post: " + (error.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post: " + error.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <WidgetWrapper>
      <FlexBetween gap="1.5rem">
        <UserImage image={picturePath} name={`${firstName} ${lastName}`} />
        <InputBase
          placeholder="What's on your mind..."
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              setPost(e.target.value);
            }
          }}
          value={post}
          multiline
          maxRows={4}
          sx={{
            width: "100%",
            backgroundColor: palette.neutral.light,
            borderRadius: "2rem",
            padding: "1rem 2rem",
          }}
        />
      </FlexBetween>
      
      {/* Character counter */}
      <Box sx={{ textAlign: "right", mt: "0.5rem" }}>
        <Typography 
          variant="caption" 
          color={post.length > MAX_CHARS * 0.9 ? "error" : medium}
        >
          {post.length}/{MAX_CHARS}
        </Typography>
      </Box>

      {isImage && (
        <Box
          border={`1px solid ${medium}`}
          borderRadius="5px"
          mt="1rem"
          p="1rem"
        >
          <Dropzone
            acceptedFiles=".jpg,.jpeg,.png"
            multiple={false}
            onDrop={handleImageDrop}
          >
            {({ getRootProps, getInputProps }) => (
              <Box>
                <Box
                  {...getRootProps()}
                  border={`2px dashed ${palette.primary.main}`}
                  p="1rem"
                  width="100%"
                  sx={{ "&:hover": { cursor: "pointer" } }}
                >
                  <input {...getInputProps()} />
                  {!image ? (
                    <p>Add Image Here</p>
                  ) : (
                    <FlexBetween>
                      <Typography>{image.name}</Typography>
                      <EditOutlined />
                    </FlexBetween>
                  )}
                </Box>
                
                {/* Image Preview */}
                {imagePreview && (
                  <Box mt="1rem" position="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ 
                        width: "100%", 
                        maxHeight: "400px", 
                        objectFit: "contain",
                        borderRadius: "8px" 
                      }} 
                    />
                    <IconButton
                      onClick={removeImage}
                      sx={{ 
                        position: "absolute", 
                        top: 8, 
                        right: 8,
                        backgroundColor: palette.background.alt,
                        "&:hover": { backgroundColor: palette.background.default }
                      }}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  </Box>
                )}
              </Box>
            )}
          </Dropzone>
        </Box>
      )}
      <Divider sx={{ margin: "1.25rem 0" }} />
      <FlexBetween>
        <FlexBetween gap="0.25rem" onClick={() => setIsImage(!isImage)}>
          <ImageOutlined sx={{ color: mediumMain }} />
          <Typography
            color={mediumMain}
            sx={{ "&:hover": { cursor: "pointer", color: medium } }}
          >
            Image
          </Typography>
        </FlexBetween>

        <Button
          disabled={!post || isPosting}
          onClick={handlePost}
          sx={{
            color: palette.background.alt,
            backgroundColor: palette.primary.main,
            borderRadius: "3rem",
            "&:hover": {
              backgroundColor: palette.primary.dark,
            },
            "&:disabled": {
              backgroundColor: palette.neutral.light,
            }
          }}
        >
          {isPosting ? "POSTING..." : "POST"}
        </Button>
      </FlexBetween>
    </WidgetWrapper>
  );
};

export default MyPostWidget;
