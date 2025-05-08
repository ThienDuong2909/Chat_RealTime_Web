import ApiResponse from "../lib/apiResponse";
import Account from "../models/account.model";
import User from "../models/user.model";
import Message from "../models/message.model";
import cloudinary from "../lib/cloudinary";

export const getListUserChatted = async (req, res) => {
  const accountId = req.account._id;
  try {
    const user = await User.find({ accountId: accountId });
    const listChatOfUser = Account.findById({ _id: { $ne: user._id } });
    return new ApiResponse(res)
      .setStatus(200)
      .setData(listChatOfUser)
      .setMessage(`Get list chat of User: ${user.fullName} successfuly`);
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
    const { _id: myId } = User.find({ accountId: accountId });
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    return new ApiResponse(res)
      .setStatus(200)
      .setData(messages)
      .setMessage(
        `Get message both ${req.account.fullName} and ${userToChatId} successfully`
      );
  } catch (error) {
    console.log("Error in get messages: ", error);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage(
        `Get message both ${req.account.fullName} and ${userToChatId} failed`
      );
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const accountId = req.account._id;
    const { text, img } = req.body;
    let imgUrl;
    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      imgUrl = uploadResponse.secure_url;
    }
    const { _id: senderId } = User.find({ accountId: accountId });

    const newMessage = new Message({
      receiverId,
      senderId,
      text,
      image: imgUrl,
    });
    await newMessage.save();
    //real time
    return new ApiResponse(res)
      .setStatus(201)
      .setMessage("Send message succesfully");
  } catch (error) {
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Send message failed");
  }
};
