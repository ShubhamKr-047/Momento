import User from "../models/User.js";
import Post from "../models/Post.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(200).json([]);
    }

    // Search by first name, last name, or email (case-insensitive)
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ]
    })
    .select('_id firstName lastName occupation location picturePath')
    .limit(10); // Limit results to 10 users

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    
    // Prevent user from following themselves
    if (id === friendId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }
    
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* TRACK PROFILE VIEW */
export const trackProfileView = async (req, res) => {
  try {
    const { id } = req.params; // Profile being viewed
    const { viewerId } = req.body; // User viewing the profile

    // Don't track if user is viewing their own profile
    if (id === viewerId) {
      return res.status(200).json({ message: "Own profile view not tracked" });
    }

    // Use $addToSet to ensure no duplicates at MongoDB level
    const result = await User.findByIdAndUpdate(
      id,
      {
        $addToSet: { profileViewers: viewerId } // Only adds if not already present
      },
      { new: true } // Return updated document
    );

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update viewedProfile count to match array length
    result.viewedProfile = result.profileViewers.length;
    await result.save();

    res.status(200).json({ viewedProfile: result.viewedProfile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE SOCIAL MEDIA */
export const updateSocialMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { twitter, linkedin } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize socialMedia if it doesn't exist (for existing users)
    if (!user.socialMedia) {
      user.socialMedia = {
        twitter: "",
        linkedin: "",
      };
    }

    // Update social media links
    if (twitter !== undefined) {
      user.socialMedia.twitter = twitter;
    }
    if (linkedin !== undefined) {
      user.socialMedia.linkedin = linkedin;
    }

    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE USER */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName } = req.body;

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify full name matches
    const userFullName = `${user.firstName} ${user.lastName}`;
    if (fullName.trim() !== userFullName) {
      return res.status(400).json({ 
        message: "Full name does not match. Account deletion cancelled." 
      });
    }

    // Delete all posts by this user
    await Post.deleteMany({ userId: id });

    // Remove user from other users' friends lists
    await User.updateMany(
      { friends: id },
      { $pull: { friends: id } }
    );

    // Delete the user
    await User.findByIdAndDelete(id);

    res.status(200).json({ 
      message: "User account and all associated posts have been deleted successfully" 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
