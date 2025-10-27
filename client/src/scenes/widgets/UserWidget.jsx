import {
  ManageAccountsOutlined,
  LocationOnOutlined,
  WorkOutlineOutlined,
  EditOutlined,
} from "@mui/icons-material";
import { Box, Typography, Divider, useTheme, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from "@mui/material";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setLogin } from "state";

const UserWidget = ({ userId, picturePath }) => {
  const [user, setUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const { palette } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUser = useSelector((state) => state.user);
  const loggedInUserId = loggedInUser._id;
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;
  const main = palette.neutral.main;

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const getUser = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/users/${userId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    setUser(data);
  };

  useEffect(() => {
    getUser();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update local user state when Redux user changes (for logged in user)
  useEffect(() => {
    if (userId === loggedInUserId && loggedInUser) {
      setUser(loggedInUser);
    }
  }, [loggedInUser.friends, userId, loggedInUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return null;
  }

  // Use Redux state for logged-in user to get real-time updates, otherwise use local state
  const displayUser = userId === loggedInUserId ? loggedInUser : user;

  const {
    firstName,
    lastName,
    location,
    occupation,
    viewedProfile,
    friends,
    socialMedia = { twitter: "", linkedin: "" },
  } = displayUser;

  const handleEditClick = (platform) => {
    setEditingPlatform(platform);
    setSocialLink(socialMedia?.[platform] || "");
    setOpenDialog(true);
  };

  const handleSaveSocial = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/users/${userId}/social`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [editingPlatform]: socialLink,
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update social media");
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
      
      // Update Redux state if viewing own profile
      if (userId === loggedInUserId) {
        dispatch(setLogin({ user: updatedUser, token }));
      }
      
      setOpenDialog(false);
    } catch (err) {
      console.error("Error updating social media:", err);
      showSnackbar("Failed to update social media. Please try again.", "error");
    }
  };

  return (
    <WidgetWrapper>
      {/* FIRST ROW */}
      <FlexBetween
        gap="0.5rem"
        pb="1.1rem"
        onClick={() => navigate(`/profile/${userId}`)}
      >
        <FlexBetween gap="1rem">
          <UserImage image={picturePath} name={`${firstName} ${lastName}`} />
          <Box>
            <Typography
              variant="h4"
              color={dark}
              fontWeight="500"
              sx={{
                "&:hover": {
                  color: palette.primary.light,
                  cursor: "pointer",
                },
              }}
            >
              {firstName} {lastName}
            </Typography>
            <Typography color={medium}>{friends.length} following</Typography>
          </Box>
        </FlexBetween>
        <ManageAccountsOutlined />
      </FlexBetween>

      <Divider />

      {/* SECOND ROW */}
      <Box p="1rem 0">
        <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
          <LocationOnOutlined fontSize="large" sx={{ color: main }} />
          <Typography color={medium}>{location}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap="1rem">
          <WorkOutlineOutlined fontSize="large" sx={{ color: main }} />
          <Typography color={medium}>{occupation}</Typography>
        </Box>
      </Box>

      <Divider />

      {/* THIRD ROW */}
      <Box p="1rem 0">
        <FlexBetween mb="0.5rem">
          <Typography color={medium}>Who's viewed your profile</Typography>
          <Typography color={main} fontWeight="500">
            {viewedProfile}
          </Typography>
        </FlexBetween>
      </Box>

      <Divider />

      {/* FOURTH ROW - SOCIAL MEDIA */}
      <Box p="1rem 0">
        <Typography fontSize="1rem" color={main} fontWeight="500" mb="1rem">
          Social Profiles
        </Typography>

        <FlexBetween gap="1rem" mb="0.5rem">
          <FlexBetween gap="1rem">
            <img src="../assets/twitter.png" alt="twitter" />
            <Box>
              <Typography color={main} fontWeight="500">
                Twitter
              </Typography>
              <Typography color={medium} fontSize="0.75rem">
                {socialMedia?.twitter || "Not added"}
              </Typography>
            </Box>
          </FlexBetween>
          {userId === loggedInUserId && (
            <IconButton onClick={() => handleEditClick("twitter")}>
              <EditOutlined sx={{ color: main }} />
            </IconButton>
          )}
        </FlexBetween>

        <FlexBetween gap="1rem">
          <FlexBetween gap="1rem">
            <img src="../assets/linkedin.png" alt="linkedin" />
            <Box>
              <Typography color={main} fontWeight="500">
                LinkedIn
              </Typography>
              <Typography color={medium} fontSize="0.75rem">
                {socialMedia?.linkedin || "Not added"}
              </Typography>
            </Box>
          </FlexBetween>
          {userId === loggedInUserId && (
            <IconButton onClick={() => handleEditClick("linkedin")}>
              <EditOutlined sx={{ color: main }} />
            </IconButton>
          )}
        </FlexBetween>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          Edit {editingPlatform === "twitter" ? "Twitter" : "LinkedIn"} Profile
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={`${editingPlatform === "twitter" ? "Twitter" : "LinkedIn"} URL`}
            type="url"
            fullWidth
            variant="outlined"
            value={socialLink}
            onChange={(e) => setSocialLink(e.target.value)}
            placeholder={`https://${editingPlatform}.com/yourprofile`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSocial} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </WidgetWrapper>
  );
};

export default UserWidget;
