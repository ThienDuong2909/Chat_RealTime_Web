import ApiResponse from "../lib/apiResponse.js";
import Account from "../models/account.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
export const getListUserChat = async (req, res) => {
  const accountId = req.account._id;
  try {
    const currentUser = await User.findOne({ account: accountId });
    // console.log("currentUser", currentUser);

    if (!currentUser) {
      return new ApiResponse(res)
        .setStatus(404)
        .setMessage("User not found")
        .send();
    }

    const listChatOfUser = await User.find({ _id: { $ne: currentUser._id } });
    // console.log("listChatOfUser", listChatOfUser);

    return new ApiResponse(res)
      .setStatus(200)
      .setData(listChatOfUser)
      .setMessage(`Get list chat of User: ${currentUser.fullName} successfully`)
      .send();
  } catch (error) {
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Internal server error")
      .send();
  }
};
export const getMessage = async (req, res) => {
  const accountId = req.account._id;
  const { id: userToChatId } = req.params;
  try {
    const user = await User.findOne({ account: accountId });
    console.log("myID: ", user._id);
    console.log("receiver: ", userToChatId);
    const messages = await Message.find({
      $or: [
        { senderId: user._id, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: user._id },
      ],
    });
    return new ApiResponse(res)
      .setStatus(200)
      .setData(messages)
      .setMessage(
        `Get message both ${req.account.fullName} and ${userToChatId} successfully`
      )
      .send();
  } catch (error) {
    console.log("Error in get messages: ", error);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage(
        `Get message both ${req.account.fullName} and ${userToChatId} failed`
      )
      .send();
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const accountId = req.account._id;
    const { text, images } = req.body;

    console.log(
      "Text and image count:",
      text,
      Array.isArray(images) ? images.length : 0
    );

    // Find sender
    const user = await User.findOne({ account: accountId });
    if (!user) {
      return res.status(404).json({ message: "Sender not found" });
    }
    const senderId = user._id;

    // Upload images if any
    let imageUrls = [];
    if (Array.isArray(images) && images.length > 0) {
      for (const base64 of images) {
        const uploadResponse = await cloudinary.uploader.upload(base64, {
          folder: "chat-images",
        });
        imageUrls.push(uploadResponse.secure_url);
      }
    }
    console.log("imageUrls: ", imageUrls);

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      images: imageUrls,
    });

    await newMessage.save();
    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log("receiverSocketId", receiverSocketId);
    if (receiverSocketId) {
      console.log("receiverSocketId", receiverSocketId);
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return new ApiResponse(res)
      .setStatus(200)
      .setData(newMessage)
      .setMessage("Send message succesfully")
      .send();
  } catch (error) {
    console.error("Send message error:", error);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Send message failed")
      .send();
  }
};
