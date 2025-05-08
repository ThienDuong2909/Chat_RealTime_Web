import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import ApiResponse from "../lib/apiResponse.js";
import Account from "../models/account.model.js";
export const updateProfile = async (req, res) => {
  try {
    const { fullName, avatar } = req.body;
    const accountId = req.account._id;
    if (!fullName || !avatar) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Full name and avatar are required")
        .send();
    }
    let user = await User.findOne({ account: accountId });
    const uploadResponse = await cloudinary.uploader.upload(avatar);

    if (user) {
      user = await User.findByIdAndUpdate(
        user._id,
        {
          fullName,
          avatar: uploadResponse.secure_url,
        },
        { new: true }
      );
    } else {
      user = await User.create({
        fullName,
        avatar: uploadResponse.secure_url,
        account: accountId,
      });
    }

    return new ApiResponse(res)
      .setStatus(200)
      .setData(user)
      .setMessage(
        user.createdAt === user.updatedAt
          ? "Profile created successfully"
          : "Profile updated successfully"
      )
      .send();
  } catch (error) {
    console.log("Error in update profile:", error);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Internal server error")
      .send();
  }
};
