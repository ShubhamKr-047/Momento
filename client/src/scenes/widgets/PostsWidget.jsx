import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import PostWidget from "./PostWidget";
import { Box, Typography, CircularProgress, useTheme } from "@mui/material";
import WidgetWrapper from "components/WidgetWrapper";

const PostsWidget = ({ userId, isProfile = false }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { palette } = useTheme();
  const observer = useRef();

  // Ref for the last post element to trigger infinite scroll
  const lastPostRef = useCallback(
    (node) => {
      if (isLoading || isFetchingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingMore, hasMore]
  );

  const getPosts = async () => {
    setIsLoading(true);
    const response = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/posts?page=1&limit=10`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    dispatch(setPosts({ posts: data.posts }));
    setHasMore(data.hasMore);
    setIsLoading(false);
  };

  const getUserPosts = async () => {
    setIsLoading(true);
    const response = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/posts/${userId}/posts?page=1&limit=10`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    dispatch(setPosts({ posts: data.posts }));
    setHasMore(data.hasMore);
    setIsLoading(false);
  };

  const loadMorePosts = async () => {
    if (!hasMore || isFetchingMore) return;

    setIsFetchingMore(true);
    const url = isProfile
      ? `${process.env.REACT_APP_SERVER_URL}/posts/${userId}/posts?page=${page}&limit=10`
      : `${process.env.REACT_APP_SERVER_URL}/posts?page=${page}&limit=10`;

    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    // Append new posts to existing posts
    dispatch(setPosts({ posts: [...posts, ...data.posts] }));
    setHasMore(data.hasMore);
    setIsFetchingMore(false);
  };

  useEffect(() => {
    if (isProfile) {
      getUserPosts();
    } else {
      getPosts();
    }
    // Reset page when component mounts or userId changes
    setPage(1);
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load more posts when page changes
  useEffect(() => {
    if (page > 1) {
      loadMorePosts();
    }
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Loading state
  if (isLoading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <WidgetWrapper key={i} mb="1.5rem">
            <Box display="flex" alignItems="center" gap="1rem" mb="1rem">
              <Box
                width="55px"
                height="55px"
                borderRadius="50%"
                sx={{ backgroundColor: palette.neutral.medium }}
              />
              <Box width="40%">
                <Box
                  height="16px"
                  borderRadius="4px"
                  mb="0.5rem"
                  sx={{ backgroundColor: palette.neutral.medium }}
                />
                <Box
                  height="12px"
                  width="60%"
                  borderRadius="4px"
                  sx={{ backgroundColor: palette.neutral.light }}
                />
              </Box>
            </Box>
            <Box
              height="200px"
              borderRadius="0.75rem"
              mb="1rem"
              sx={{ backgroundColor: palette.neutral.light }}
            />
            <Box
              height="14px"
              width="80%"
              borderRadius="4px"
              mb="0.5rem"
              sx={{ backgroundColor: palette.neutral.medium }}
            />
            <Box
              height="14px"
              width="60%"
              borderRadius="4px"
              sx={{ backgroundColor: palette.neutral.light }}
            />
          </WidgetWrapper>
        ))}
      </>
    );
  }

  // Empty state
  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <WidgetWrapper>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py="3rem"
          px="1rem"
        >
          <Typography
            variant="h2"
            fontSize="4rem"
            color={palette.neutral.medium}
            mb="1rem"
          >
            📭
          </Typography>
          <Typography variant="h4" color={palette.neutral.main} mb="0.5rem">
            No posts yet
          </Typography>
          <Typography variant="body2" color={palette.neutral.medium}>
            {isProfile
              ? "This user hasn't shared anything yet"
              : "Be the first to share something!"}
          </Typography>
        </Box>
      </WidgetWrapper>
    );
  }

  return (
    <>
      {posts.map((post, index) => {
        const {
          _id,
          userId,
          firstName,
          lastName,
          description,
          location,
          picturePath,
          userPicturePath,
          likes,
          comments,
        } = post;

        // Attach ref to the last post for infinite scroll
        if (posts.length === index + 1) {
          return (
            <div ref={lastPostRef} key={_id}>
              <PostWidget
                postId={_id}
                postUserId={userId}
                name={`${firstName} ${lastName}`}
                description={description}
                location={location}
                picturePath={picturePath}
                userPicturePath={userPicturePath}
                likes={likes}
                comments={comments}
              />
            </div>
          );
        } else {
          return (
            <PostWidget
              key={_id}
              postId={_id}
              postUserId={userId}
              name={`${firstName} ${lastName}`}
              description={description}
              location={location}
              picturePath={picturePath}
              userPicturePath={userPicturePath}
              likes={likes}
              comments={comments}
            />
          );
        }
      })}

      {/* Loading indicator for fetching more posts */}
      {isFetchingMore && (
        <Box display="flex" justifyContent="center" p="2rem">
          <CircularProgress />
        </Box>
      )}

      {/* Show message when no more posts */}
      {!hasMore && posts.length > 0 && (
        <Box textAlign="center" p="2rem">
          <Typography color={palette.neutral.medium}>
            You've reached the end
          </Typography>
        </Box>
      )}
    </>
  );
};

export default PostsWidget;
