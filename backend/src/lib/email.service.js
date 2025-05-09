import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USERNAME_EMAIL,
    pass: process.env.PASSWORD_EMAIL,
  },
});

export const sendResetPassWordEmail = async (account) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${account.reset_password_token}`;
  const mailOptions = {
    from: process.env.USERNAME_EMAIL,
    to: account.email,
    subject: "Chat App - Password Reset Request",
    html: `
        <h2>Password Reset Request</h2>
        <p>Hello, ${account.username}!</p>
        <p>We received a request to reset your Chat App password.</p>
        <p>Please click the link below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br>Chat App Team</p>
      `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${account.email}`);
  } catch (error) {
    console.error("Error sending confirmation email:", error.message);
    throw new Error("Failed to send confirmation email");
  }
};

export const sendConfirmationEmail = async (account) => {
  const mailOptions = {
    from: process.env.USERNAME_EMAIL,
    to: account.email,
    subject: "Welcome to Chat App - Confirm Your Registration",
    html: `
       <h2>Welcome, ${account.username}!</h2>
      <p>Thank you for registering with Chat App.</p>
      <p>Please confirm your email by entering the following OTP:</p>
      <p style="font-size: 24px; font-weight: bold; color: #4CAF50;">${account.registration_token}</p>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you did not register, please ignore this email.</p>
      <p>Best regards,<br>Chat App Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${account.email}`);
  } catch (error) {
    console.error("Error sending confirmation email:", error.message);
    throw new Error("Failed to send confirmation email");
  }
};
