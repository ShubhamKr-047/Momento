import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material";

const Avatar = ({ image, name, size = "60px" }) => {
  const { palette } = useTheme();

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Generate color based on name
  const getColorFromName = (name) => {
    if (!name) return palette.primary.main;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      palette.primary.main,
      palette.primary.light,
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  if (image && image.trim() !== "") {
    return (
      <Box width={size} height={size}>
        <img
          style={{ objectFit: "cover", borderRadius: "50%" }}
          width={size}
          height={size}
          alt="user"
          src={image}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        <Box
          width={size}
          height={size}
          display="none"
          alignItems="center"
          justifyContent="center"
          borderRadius="50%"
          sx={{
            backgroundColor: getColorFromName(name),
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            color="white"
            sx={{ fontSize: parseInt(size) * 0.4 }}
          >
            {getInitials(name)}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Show initials avatar if no image
  return (
    <Box
      width={size}
      height={size}
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="50%"
      sx={{
        backgroundColor: getColorFromName(name),
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        color="white"
        sx={{ fontSize: parseInt(size) * 0.4 }}
      >
        {getInitials(name)}
      </Typography>
    </Box>
  );
};

export default Avatar;
