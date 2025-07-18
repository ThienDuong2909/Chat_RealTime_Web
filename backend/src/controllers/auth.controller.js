import ApiResponse from "../lib/apiResponse.js";
import bcrypt from "bcryptjs";
import { jwtDecode } from "jwt-decode";
import crypto from "crypto";
import dns from "dns";
import { promisify } from "util";
import Account from "../models/account.model.js";
import { generateToken } from "../lib/utils.js";
import {
  sendConfirmationEmail,
  sendResetPassWordEmail,
} from "../lib/email.service.js";
import kickbox from "kickbox";
import User from "../models/user.model.js";
import { console } from "inspector";

//

const resolveMx = promisify(dns.resolveMx);
const kickboxClient = kickbox.client(process.env.KICKBOX_API_KEY).kickbox();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmailDomainValid = async (email) => {
  try {
    const domain = email.split("@")[1];
    const mxRecords = await resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (error) {
    console.log("Error checking MX records:", error.message);
    return false;
  }
};

const verifyEmailWithKickbox = async (email) => {
  return new Promise((resolve) => {
    console.log("Bắt đầu xác minh email với Kickbox:", email);
    kickboxClient.verify(email, (err, response) => {
      if (err) {
        resolve({
          valid: false,
          error: `Kickbox API error: ${err.message}`,
        });
      } else if (!response || !response.body) {
        resolve({
          valid: false,
          error: "Không nhận được phản hồi hợp lệ từ Kickbox",
        });
      } else {
        console.log(
          "Kết quả xác minh email từ Kickbox:",
          JSON.stringify(response.body, null, 2)
        );
        const result = response.body.result;
        const reason = response.body.reason;
        resolve({
          valid: result === "deliverable",
          error:
            result !== "deliverable"
              ? `Email không hợp lệ: ${result} (${reason})`
              : null,
        });
      }
    });
  });
};
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
export const signup = async (req, res) => {
  console.log("Request body:", req.body);
  if (!req.body) {
    return new ApiResponse(res)
      .setStatus(400)
      .setMessage("Request body is missing")
      .send();
  }

  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("All fields are required")
        .send();
    }
    if (!emailRegex.test(email)) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Invalid email format")
        .send();
    }

    const isValidDomain = await isEmailDomainValid(email);
    if (!isValidDomain) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Email domain does not exist or is invalid")
        .send();
    }

    // const emailVerification = await verifyEmailWithKickbox(email);
    // if (!emailVerification.valid) {
    //   console.log("Email không hợp lệ, lý do:", emailVerification.error);
    //   return new ApiResponse(res)
    //     .setStatus(400)
    //     .setMessage(
    //       emailVerification.error ||
    //         "Địa chỉ email không tồn tại hoặc không hợp lệ"
    //     )
    //     .send();
    // }

    if (password.length < 8) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Password must be at least 8 characters")
        .send();
    }

    const user = await Account.findOne({
      $or: [{ email: email }, { username: username }],
    });
    if (user) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Email or username already exists")
        .send();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const registrationToken = generateOTP();
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const newAccount = new Account({
      username,
      email,
      password: hashedPassword,
      registration_token: registrationToken,
      registration_token_expiry: tokenExpiry,
    });

    await newAccount.save();
    await sendConfirmationEmail(newAccount);

    return new ApiResponse(res)
      .setStatus(201)
      .setData({
        _id: newAccount._id,
        fullName: newAccount.username,
        email: newAccount.email,
      })
      .setMessage("Registration successful. Confirmation email sent.")
      .send();
  } catch (error) {
    console.log("Error in signup controller:", error.message);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Internal Server Error")
      .send();
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const account = await Account.findOne({ username });

    if (!account) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Username is not exist")
        .send();
    }

    const isPasswordCorrect = await bcrypt.compare(password, account.password);
    if (!isPasswordCorrect) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Username or password is incorrect")
        .send();
    }

    generateToken(account._id, res);
    const user = await User.findOne({ account: account._id });

    return new ApiResponse(res)
      .setStatus(200)
      .setMessage("Login successfully!!")
      .setData({
        _id: account._id,
        username: account.username,
        email: account.email,
        fullName: user?.fullName,
      })
      .send();
  } catch (error) {
    console.log("Error in login controller", error.message);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Internal Server Error:" + error)
      .send();
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return new ApiResponse(res)
      .setStatus(200)
      .setMessage("Logged out successfully")
      .send();
  } catch (error) {
    console.log("Error in logout controller", error.message);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Internal Server Error")
      .send();
  }
};

export const confirmRegister = async (req, res) => {
  const { email, otpCode } = req.body;
  console.log("Email, OtpCode: " + email + ", " + otpCode);

  try {
    if (!email) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Confirmation email is required")
        .send();
    }
    if (!otpCode) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Confirmation otpCode is required")
        .send();
    }

    const account = await Account.findOne({
      email: email,
      registration_token: otpCode,
      registration_token_expiry: { $gt: new Date() },
    });

    if (!account) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Invalid or expired confirmation token")
        .send();
    }

    generateToken(account._id, res);

    // Update account status and clear token
    account.status = 1;
    account.registration_token = null;
    account.registration_token_expiry = null;

    await account.save();

    return new ApiResponse(res)
      .setStatus(200)
      .setData({
        _id: account._id,
        username: account.username,
        email: account.email,
        status: account.status,
      })
      .setMessage("Email confirmation successful")
      .send();
  } catch (error) {
    console.log("Error in confirmRegister controller:", error.message);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Internal Server Error")
      .send();
  }
};

export const confirmForgotPassword = async (req, res) => {
  const { email, otpCode } = req.body;
  console.log("Email, OTPcode:", email, otpCode);

  try {
    if (!email) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Confirmation email is required")
        .send();
    }
    if (!otpCode) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Confirmation otpCode is required")
        .send();
    }

    const account = await Account.findOne({
      email: email,
      reset_password_token: otpCode,
      reset_password_token_expiry: { $gt: new Date() },
    });

    if (!account) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Invalid or expired confirmation token")
        .send();
    }

    account.registration_token = null;
    account.registration_token_expiry = null;

    await account.save();

    return new ApiResponse(res)
      .setStatus(200)
      .setData({
        _id: account._id,
        username: account.username,
        email: account.email,
        status: account.status,
      })
      .setMessage("Email confirmation successful")
      .send();
  } catch (error) {
    console.log("Error in confirmForgotPassword controller:", error.message);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Internal Server Error")
      .send();
  }
};

export const forgotPassword = async (req, res) => {
  console.log("Request forgot password: ", req.body);
  const { email } = req.body;

  try {
    if (!email) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Email is required")
        .send();
    }

    if (!emailRegex.test(email)) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Invalid email format")
        .send();
    }

    const isValidDomain = await isEmailDomainValid(email);
    if (!isValidDomain) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Email domain does not exist or is invalid")
        .send();
    }
    const account = await Account.findOne({ email });
    if (!account) {
      return new ApiResponse(res)
        .setStatus(404)
        .setMessage("Account with this email does not exist")
        .send();
    }

    if (!account.status) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Please confirm your account before resetting password")
        .send();
    }

    const resetToken = generateOTP();
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

    account.reset_password_token = resetToken;
    account.reset_password_token_expiry = tokenExpiry;
    await account.save();

    await sendResetPassWordEmail(account);
    return new ApiResponse(res)
      .setStatus(200)
      .setMessage("Password reset link sent to your email")
      .send();
  } catch (error) {
    console.error("Error in forgotPassword controller:", error.message);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Internal Server Error")
      .send();
  }
};

export const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Email and new password are required")
        .send();
    }

    if (password.length < 8) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Password must be at least 8 characters")
        .send();
    }

    const account = await Account.findOne({
      email: email,
    });

    if (!account) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Invalid or expired reset token")
        .send();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    account.password = hashedPassword;
    await account.save();

    return new ApiResponse(res)
      .setStatus(200)
      .setMessage("Password reset successful")
      .send();
  } catch (error) {
    console.error("Error in resetPassword controller:", error.message);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Internal Server Error")
      .send();
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findOne({ account: req.account._id });
    const responseData = {
      ...req.account._doc,
      fullName: user ? user.fullName : null,
      avatar: user ? user.avatar : null,
      userId: user ? user._id : null,
    };
    return new ApiResponse(res).setStatus(200).setData(responseData).send();
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Internal Server Error: " + error)
      .send();
  }
};

export const refreshOTP = async (req, res) => {
  console.log("Req body: ", req.body);
  if (!req.body) {
    return new ApiResponse(res)
      .setStatus(400)
      .setMessage("Request body is missing")
      .send();
  }

  const { email, flow } = req.body;
  console.log("email: ", email);

  try {
    if (!email) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Email is required")
        .send();
    }
    if (!emailRegex.test(email)) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Invalid email format")
        .send();
    }

    const account = await Account.findOne({ email });
    if (!account) {
      return new ApiResponse(res)
        .setStatus(404)
        .setMessage("Account not found")
        .send();
    }
    console.log("account", account);

    if (flow == "signup") {
      if (!account.registration_token || !account.registration_token_expiry) {
        return new ApiResponse(res)
          .setStatus(400)
          .setMessage("Account already verified or no pending verification")
          .send();
      }

      const newOTP = generateOTP();
      const newTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

      account.registration_token = newOTP;
      account.registration_token_expiry = newTokenExpiry;

      await account.save();
      await sendConfirmationEmail(account);
    } else {
      if (
        !account.reset_password_token ||
        !account.reset_password_token_expiry
      ) {
        return new ApiResponse(res)
          .setStatus(400)
          .setMessage("Account already verified or no pending verification")
          .send();
      }

      const newOTP = generateOTP();
      const newTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

      account.reset_password_token = newOTP;
      account.reset_password_token_expiry = newTokenExpiry;

      await account.save();
      await sendResetPassWordEmail(account);
    }
    return new ApiResponse(res)
      .setStatus(200)
      .setMessage("New OTP sent successfully")
      .send();
  } catch (error) {
    console.log("Error in refreshOTP controller:", error.message);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Internal Server Error")
      .send();
  }
};

export const loginWithGoogle = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Missing Google credential")
        .send();
    }

    const decoded = jwtDecode(credential);
    const { email } = decoded;

    if (!email) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Email not found in Google token")
        .send();
    }

    let account = await Account.findOne({ email });

    if (!account) {
      const username = email.split("@")[0];

      account = new Account({
        username,
        email,
        password: null,
        status: true,
      });

      await account.save();
    }

    generateToken(account._id, res);

    const user = await User.findOne({ account: account._id });

    return new ApiResponse(res)
      .setStatus(200)
      .setMessage("Login successful via Google")
      .setData({
        _id: account._id,
        username: account.username,
        email: account.email,
        fullName: user?.fullName,
      })
      .send();
  } catch (error) {
    console.log("Error in loginWithGoogle:", error.message);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Internal Server Error")
      .send();
  }
};
