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
      // ✅ Add success log
    console.log(`✅ User registered: ${email} (${name})`);

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
        // ✅ Add login success log
    console.log(`✅ User logged in: ${email}`);


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

// Send verification OTP to user's email
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId  = req.userId;

    // Find user by ID
    const user = await usermodel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If already verified
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already Verified" });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Save OTP and expiry to user record
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Email the OTP
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email, // ✅ fixed this
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}. Verify your account using this OTP.`,
    };
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Verification OTP Sent on Email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// Handle email verification using OTP
export const verifyEmail = async (req, res) => {
  const { otp } = req.body;  // Only get OTP from body
  const userId = req.userId;  // Get ID from middleware

  // Validate required fields
  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    // Find user by ID
    const user = await usermodel.findById(userId);

    // If user not found
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Validate OTP
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // Check for OTP expiry
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    // Mark user as verified and clear OTP fields
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();

    // Return success response
    return res.json({ success: true, message: "Email Verified Successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message }); // ✅ fixed typo `red.json` ➝ `res.json`
  }
};

export const isAuthenticated=async(req,res)=>{
  try {
return res.json({success:true})
  } catch (error) {
    return res.json({success:false,message:error.message})

  }
};

export const sendResetOtp=async(req,res)=>{
  const {email}=req.body;

  if(!email){
    return res.json({success:false,message:'Email is required'})
  }

  try {

    const user=await usermodel.findOne({email});
     if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });}
       // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Save OTP and expiry to user record
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    // Email the OTP
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email, // ✅ fixed this
      subject: "PassWord Reset OTP",
      text: `Your OTP is ${otp}. Use this to proceed to resetting your password`,
    };
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Reset Password OTP Sent on Email" });

    }

   catch(error) {
    return res.json({success:false,message:error.message})
  }


}


export const resetpassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
  }

  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpireAt = 0;

    // ✅ Send new token after successful password reset
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: "Lax",
    });

    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successful" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};
