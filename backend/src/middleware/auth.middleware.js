import jwt from "jsonwebtoken";
import Account from "../models/account.model.js";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const account = await Account.findById(decoded.accountId).select(
      "-password"
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const user = User.findOne({ account: account._id });
    const info = {
      ...account,
      fullName: user.fullName,
    };

    console.log("info", info);
    req.account = account;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
