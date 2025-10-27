import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    console.log("Registration attempt:", req.body);
    console.log("File uploaded:", req.file);
    
    const {
      firstName,
      lastName,
      email,
      password,
      friends,
      location,
      occupation,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use. Please use a different email or login." });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Convert image to base64 if file exists
    let pictureBase64 = "";
    if (req.file) {
      pictureBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath: pictureBase64,
      friends,
      location,
      occupation,
      viewedProfile: 0,
      profileViewers: [],
    });
    const savedUser = await newUser.save();
    console.log("User registered successfully:", savedUser.email);
    res.status(201).json(savedUser);
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist. " });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
