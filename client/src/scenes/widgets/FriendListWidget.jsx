import { Box, Typography, useTheme } from "@mui/material";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "state";

const FriendListWidget = ({ userId }) => {
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const reduxFriends = useSelector((state) => state.user.friends);
  const [profileFriends, setProfileFriends] = useState([]);
  
  const isViewingOwnProfile = userId === loggedInUserId;

  const getFriends = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/users/${userId}/friends`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    
    if (isViewingOwnProfile) {
      // Update Redux state for own profile
      dispatch(setFriends({ friends: data }));
    } else {
      // Use local state for other users' profiles
      setProfileFriends(data);
    }
  };

  useEffect(() => {
    getFriends();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Use Redux friends for own profile, local state for others
  const displayFriends = isViewingOwnProfile ? reduxFriends : profileFriends;

  return (
    <WidgetWrapper>
      <Typography
        color={palette.neutral.dark}
        variant="h5"
        fontWeight="500"
        sx={{ mb: "1.5rem" }}
      >
        Following List
      </Typography>
      <Box display="flex" flexDirection="column" gap="1.5rem">
        {displayFriends.map((friend) => (
          <Friend
            key={friend._id}
            friendId={friend._id}
            name={`${friend.firstName} ${friend.lastName}`}
            subtitle={friend.occupation}
            userPicturePath={friend.picturePath}
            isViewingOwnProfile={isViewingOwnProfile}
          />
        ))}
      </Box>
    </WidgetWrapper>
  );
};

export default FriendListWidget;
