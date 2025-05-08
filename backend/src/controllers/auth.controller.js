import ApiResponse from "../lib/apiResponse.js";
import bcrypt from "bcryptjs";
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
const generateRandomToken = () => {
  return crypto.randomBytes(30).toString("hex");
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

    const emailVerification = await verifyEmailWithKickbox(email);
    if (!emailVerification.valid) {
      console.log("Email không hợp lệ, lý do:", emailVerification.error);
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage(
          emailVerification.error ||
            "Địa chỉ email không tồn tại hoặc không hợp lệ"
        )
        .send();
    }

    if (password.length < 8) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Password must be at least 8 characters")
        .send();
    }

    const user = await Account.findOne({ email });
    if (user) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Email already exists")
        .send();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const registrationToken = generateRandomToken();
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

    generateToken(newAccount._id, res);

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

    return new ApiResponse(res)
      .setStatus(200)
      .setMessage("Login successfully!!")
      .setData({
        _id: account._id,
        username: account.username,
        email: account.email,
      })
      .send();
  } catch (error) {
    console.log("Error in login controller", error.message);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Internal Server Error")
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
  const { token } = req.query;

  try {
    if (!token) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Confirmation token is required")
        .send();
    }

    const account = await Account.findOne({
      registration_token: token,
      registration_token_expiry: { $gt: new Date() },
    });

    if (!account) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Invalid or expired confirmation token")
        .send();
    }

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

export const forgotPassword = async (req, res) => {
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

    const isEmailValid = await verifyEmailWithZeroBounce(email);
    if (!isEmailValid) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Email address does not exist or is invalid")
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

    const resetToken = generateRandomToken();
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
  const { token, password } = req.body;

  try {
    if (!token || !password) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Token and new password are required")
        .send();
    }

    if (password.length < 8) {
      return new ApiResponse(res)
        .setStatus(400)
        .setMessage("Password must be at least 8 characters")
        .send();
    }

    const account = await Account.findOne({
      reset_password_token: token,
      reset_password_token_expiry: { $gt: new Date() },
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
    account.reset_password_token = null;
    account.reset_password_token_expiry = null;
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

export const checkAuth = (req, res) => {
  try {
    return new ApiResponse(res).setStatus(200).setData(req.account).send();
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    return new ApiResponse(res)
      .setStatus(500)
      .setMessage("Internal Server Error")
      .send();
  }
};
