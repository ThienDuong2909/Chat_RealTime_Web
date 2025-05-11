import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import ApiResponse from "../lib/apiResponse.js";
import Account from "../models/account.model.js";
export const updateFullname = async (req, res) => {
  try {
    const { fullName } = req.body;
    const accountId = req.account._id;
    console.log("Fullname: ", fullName);
    console.log("accountId: ", accountId);
    if (!fullName) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Full name  are required")
        .send();
    }
    let user = await User.findOne({ account: accountId });
    if (user) {
      user = await User.findByIdAndUpdate(
        user._id,
        {
          fullName,
        },
        { new: true }
      );
    } else {
      user = await User.create({
        fullName,
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

export const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const accountId = req.account._id;
    if (!avatar) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Avatar  are required")
        .send();
    }
    let user = await User.findOne({ account: accountId });
    const uploadResponse = await cloudinary.uploader.upload(avatar);

    if (user) {
      user.avatar = uploadResponse.secure_url;
      await user.save();
    } else {
      user = await User.create({
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
