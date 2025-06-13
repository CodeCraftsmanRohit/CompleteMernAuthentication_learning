// Import bcryptjs to securely hash user passwords before storing them
import bcrypt from "bcryptjs";

// Import jsonwebtoken to create signed JWT tokens for user authentication
import jwt from "jsonwebtoken";

// Import the user model from the models directory
import usermodel from "../models/usermodel.js";

import transporter from "../config/modemailer.js";


// Export an asynchronous controller function to handle user registration
export const register = async (req, res) => {
  // Destructure name, email, and password from the request body (user input)
  const { name, email, password } = req.body;

  // If any field is missing, return a failure response
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    // Check if a user with the given email already exists in the database
    const existingUser = await usermodel.findOne({ email });

    // If user exists, return a failure response
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Hash the user's password using bcrypt with a salt round of 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document with the hashed password
    const user = new usermodel({ name, email, password: hashedPassword });

    // Save the new user to the MongoDB collection
    await user.save();

    // Create a JWT token using the user's ID as payload and a secret key
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token will expire in 7 days
    );

    // Set the token as an HTTP-only cookie in the response
    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript access to cookie (for security)
      secure: process.env.NODE_ENV === "production", // Send cookie only over HTTPS in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Cookie policy for cross-site usage
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "welcome to My Website",
      text: `Welcome to my website . your account has been created with email id:${email}`,
    };
    await transporter.sendMail(mailOptions);

    // ✅ Send a success response with user info (excluding password)
    res.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // If any error occurs, return the error message in the response
    res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  // Destructure email and password from request body
  const { email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    // Check if user with provided email exists
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Password" });
    }

    // Generate a new JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set token in cookie with security settings
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Respond with success message
    res.json({
      success: true,
      message: "User Login successfully",
    });
  } catch (error) {
    // Handle any errors
    res.json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the token cookie from client
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    // Respond with logout success
    return res.json({ success: true, message: "Log Out" });
  } catch (error) {
    // Send error response if logout fails
    res.json({ success: false, message: error.message });
  }
};

//send verification OTP to the User's Email
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await usermodel.findById(userId);
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already Verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}.Verify your account using this OTP`,
    };
    await transporter.sendMail(mailOptions);
    res.json({success:true,message:'Verification OTP Sent on Email'})
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
