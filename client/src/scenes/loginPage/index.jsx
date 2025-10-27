import { Box, Typography, useTheme, useMediaQuery, IconButton } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setMode } from "state";
import Form from "./Form";

const LoginPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const mode = useSelector((state) => state.mode);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  
  return (
    <Box>
      <Box
        width="100%"
        backgroundColor={theme.palette.background.alt}
        p="1rem 6%"
        textAlign="center"
        display="flex"
        justifyContent="center"
        alignItems="center"
        position="relative"
      >
        <Typography fontWeight="bold" fontSize="32px" color="primary">
          Momento
        </Typography>
        <IconButton
          onClick={() => dispatch(setMode())}
          sx={{ 
            position: "absolute",
            right: "6%",
            color: theme.palette.neutral.dark 
          }}
        >
          {mode === "dark" ? (
            <DarkMode sx={{ fontSize: "25px" }} />
          ) : (
            <LightMode sx={{ fontSize: "25px" }} />
          )}
        </IconButton>
      </Box>

      <Box
        width={isNonMobileScreens ? "50%" : "93%"}
        p="2rem"
        m="2rem auto"
        borderRadius="1.5rem"
        backgroundColor={theme.palette.background.alt}
      >
        <Typography fontWeight="500" variant="h5" sx={{ mb: "1.5rem" }}>
          Welcome to Momento, the Social Media for Memories!
        </Typography>
        <Form />
      </Box>
    </Box>
  );
};

export default LoginPage;
