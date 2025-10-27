import { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import {
  Search,
  DarkMode,
  LightMode,
  Menu,
  Close,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout } from "state";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";
import Avatar from "components/Avatar";

const Navbar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const searchTimeoutRef = useRef(null);
  const searchContainerRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;

  const fullName = `${user.firstName} ${user.lastName}`;

  // Debounced search function
  const performSearch = async (query) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/users/search?query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout - wait 500ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  };

  // Handle clicking on a search result
  const handleResultClick = (userId) => {
    navigate(`/profile/${userId}`);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    setDeleteError("");
    const fullName = `${user.firstName} ${user.lastName}`;
    
    if (confirmName.trim() !== fullName) {
      setDeleteError("Name does not match. Please enter your full name exactly.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/users/${user._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fullName: confirmName }),
        }
      );

      if (response.ok) {
        // Account deleted successfully
        dispatch(setLogout());
        navigate("/");
      } else {
        const error = await response.json();
        setDeleteError(error.message || "Failed to delete account");
      }
    } catch (err) {
      setDeleteError("An error occurred. Please try again.");
    }
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    setConfirmName("");
    setDeleteError("");
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setConfirmName("");
    setDeleteError("");
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box
      width="100%"
      padding="1rem 6%"
      backgroundColor={alt}
      display={isNonMobileScreens ? "flex" : "block"}
      gap="1rem"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
        <Typography
          fontWeight="bold"
          fontSize="clamp(1rem, 2rem, 2.25rem)"
          color="primary"
          onClick={() => navigate("/home")}
          sx={{
            "&:hover": {
              color: primaryLight,
              cursor: "pointer",
            },
          }}
        >
          Momento
        </Typography>
      </Box>

      {isNonMobileScreens && (
        <Box flexBasis="42%" position="relative" ref={searchContainerRef}>
          <FlexBetween
            backgroundColor={neutralLight}
            borderRadius="9px"
            gap="3rem"
            padding="0.1rem 1.5rem"
          >
            <InputBase 
              placeholder="Search users..." 
              sx={{ width: "100%" }}
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowResults(true)}
            />
            <IconButton>
              {isSearching ? <CircularProgress size={20} /> : <Search />}
            </IconButton>
          </FlexBetween>

          {/* Search Results Dropdown */}
          {showResults && (
            <Paper
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                mt: "0.5rem",
                maxHeight: "400px",
                overflowY: "auto",
                zIndex: 1000,
                backgroundColor: alt,
              }}
            >
              {searchResults.length > 0 ? (
                <List>
                  {searchResults.map((result) => (
                    <ListItem
                      key={result._id}
                      onClick={() => handleResultClick(result._id)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: neutralLight,
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          image={result.picturePath} 
                          name={`${result.firstName} ${result.lastName}`}
                          size="40px"
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${result.firstName} ${result.lastName}`}
                        secondary={result.occupation}
                        primaryTypographyProps={{
                          color: dark,
                          fontWeight: 500,
                        }}
                        secondaryTypographyProps={{
                          color: theme.palette.neutral.medium,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : searchQuery && !isSearching ? (
                <Box p="1rem" textAlign="center">
                  <Typography color={theme.palette.neutral.medium}>
                    No users found
                  </Typography>
                </Box>
              ) : null}
            </Paper>
          )}
        </Box>
      )}

      {isNonMobileScreens ? (
        <Box flexBasis="26%" display="flex" justifyContent="flex-end" alignItems="center">
          <FlexBetween gap="1rem">
            <IconButton onClick={() => dispatch(setMode())}>
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px" }} />
              ) : (
                <LightMode sx={{ color: dark, fontSize: "25px" }} />
              )}
            </IconButton>
            <FormControl variant="standard" value={fullName}>
              <Select
                value={fullName}
                sx={{
                  backgroundColor: neutralLight,
                  minWidth: "150px",
                  maxWidth: "250px",
                  borderRadius: "0.25rem",
                  p: "0.25rem 1rem",
                  "& .MuiSvgIcon-root": {
                    pr: "0.25rem",
                    width: "3rem",
                  },
                  "& .MuiSelect-select": {
                    paddingRight: "2.5rem !important",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                  "& .MuiSelect-select:focus": {
                    backgroundColor: neutralLight,
                  },
                }}
                input={<InputBase />}
              >
                <MenuItem value={fullName}>
                  <Typography>{fullName}</Typography>
                </MenuItem>
                <MenuItem onClick={() => dispatch(setLogout())}>
                  <Typography>Log Out</Typography>
                </MenuItem>
                <MenuItem onClick={handleOpenDeleteDialog}>
                  <Typography color="error">Delete Account</Typography>
                </MenuItem>
              </Select>
            </FormControl>
          </FlexBetween>
        </Box>
      ) : (
        <IconButton
          onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
        >
          <Menu />
        </IconButton>
      )}

      {!isNonMobileScreens && isMobileMenuToggled && (
        <Box
          position="fixed"
          right="0"
          bottom="0"
          height="100%"
          zIndex="10"
          maxWidth="500px"
          minWidth="300px"
          backgroundColor={background}
        >
          <Box display="flex" justifyContent="flex-end" p="1rem">
            <IconButton
              onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
            >
              <Close />
            </IconButton>
          </Box>

          <FlexBetween
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="3rem"
          >
            <IconButton
              onClick={() => dispatch(setMode())}
              sx={{ fontSize: "25px" }}
            >
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px" }} />
              ) : (
                <LightMode sx={{ color: dark, fontSize: "25px" }} />
              )}
            </IconButton>
            <FormControl variant="standard" value={fullName}>
              <Select
                value={fullName}
                sx={{
                  backgroundColor: neutralLight,
                  minWidth: "150px",
                  maxWidth: "250px",
                  borderRadius: "0.25rem",
                  p: "0.25rem 1rem",
                  "& .MuiSvgIcon-root": {
                    pr: "0.25rem",
                    width: "3rem",
                  },
                  "& .MuiSelect-select": {
                    paddingRight: "2.5rem !important",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                  "& .MuiSelect-select:focus": {
                    backgroundColor: neutralLight,
                  },
                }}
                input={<InputBase />}
              >
                <MenuItem value={fullName}>
                  <Typography>{fullName}</Typography>
                </MenuItem>
                <MenuItem onClick={() => dispatch(setLogout())}>
                  <Typography>Log Out</Typography>
                </MenuItem>
                <MenuItem onClick={handleOpenDeleteDialog}>
                  <Typography color="error">Delete Account</Typography>
                </MenuItem>
              </Select>
            </FormControl>
          </FlexBetween>
        </Box>
      )}

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.alt,
            padding: "1rem",
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.neutral.dark }}>
          Delete Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: theme.palette.neutral.main, mb: 2 }}>
            This action cannot be undone. All your posts, comments, and data will be permanently deleted.
          </DialogContentText>
          <DialogContentText sx={{ color: theme.palette.neutral.main, mb: 2 }}>
            Please type your full name <strong>{user.firstName} {user.lastName}</strong> to confirm:
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            placeholder={`${user.firstName} ${user.lastName}`}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            error={Boolean(deleteError)}
            helperText={deleteError}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: theme.palette.neutral.main,
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDeleteDialog}
            sx={{ color: theme.palette.neutral.main }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount}
            variant="contained"
            color="error"
            disabled={!confirmName.trim()}
          >
            Delete My Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Navbar;
