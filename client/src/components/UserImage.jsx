import Avatar from "./Avatar";

const UserImage = ({ image, name = "User", size = "60px" }) => {
  return <Avatar image={image} name={name} size={size} />;
};

export default UserImage;
