// Import bcryptjs to securely hash user passwords before storing them
import bcrypt from 'bcryptjs';

// Import jsonwebtoken to create signed JWT tokens for user authentication
import jwt from 'jsonwebtoken';

// Import the user model from the models directory
import { usermodel } from '../models/usermodel.js';

// Export an asynchronous controller function to handle user registration
export const registeer = async (req, res) => {

  // Destructure name, email, and password from the request body (user input)
  const { name, email, password } = req.body;

  // If any field is missing, return a failure response
  if (!name || !email || !password) {
    return res.json({ success: false, message: 'Missing Details' });
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
      { expiresIn: '7d' } // Token will expire in 7 days
    );

    // Set the token as an HTTP-only cookie in the response
    res.cookie('token', token, {
      httpOnly: true, // Prevents JavaScript access to cookie (for security)
      secure: process.env.NODE_ENV === 'production', // Send cookie only over HTTPS in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // Cookie policy for cross-site usage
      maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expires in 7 days
    });

    // ✅ Send a success response with user info (excluding password)
    res.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    // If any error occurs, return the error message in the response
    res.json({ success: false, message: error.message });
  }
}
