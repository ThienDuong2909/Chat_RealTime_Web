import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USERNAME_EMAIL,
    pass: process.env.PASSWORD_EMAIL,
  },
});

export const sendResetPassWordEmail = async (account) => {
  const mailOptions = {
    from: process.env.USERNAME_EMAIL,
    to: account.email,
    subject: "Chat App - Password Reset Request",
    html: `
        <h2>Password Reset Request</h2>
        <p>Hello, ${account.username}!</p>
        <p>We received a request to reset your Chat App password.</p>
        <p>Please confirm your email by entering the following OTP:</p>
        <p style="font-size: 24px; font-weight: bold; color: #4CAF50;">${account.reset_password_token}</p>
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
