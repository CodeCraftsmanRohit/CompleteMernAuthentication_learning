// Import the Express framework to build the server
import express from "express";

// Import CORS middleware to enable Cross-Origin Resource Sharing (allows frontend & backend to interact on different origins)
import cors from "cors";

// Load environment variables from a `.env` file into `process.env`
import 'dotenv/config';

// Import middleware to parse cookies from incoming HTTP requests
import cookieParser from "cookie-parser";

// Import custom function to connect to MongoDB
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

// Initialize the Express application
const app = express();

// Set the port for the server to listen on (from environment variable or default to 4000)
const port = process.env.PORT || 4000;

// Call the function to connect to the MongoDB database
connectDB();

// Middleware to automatically parse incoming JSON data in request bodies (makes `req.body` usable)
app.use(express.json());

// Middleware to parse cookies from request headers and populate `req.cookies`
app.use(cookieParser());


const aloowedOrigins =['http://localhost:5173']

// Enable CORS and allow credentials (cookies, auth headers) in cross-origin requests
app.use(cors({origin:aloowedOrigins, credentials: true }));


//API ENDPOINTS

// Define a simple GET route at the root URL ('/') that returns a test response
app.get('/', (req, res) => {
  return res.send("API Working");
});
app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)

// Start the server and listen on the specified port, logging a confirmation message when ready
app.listen(port, () => console.log(`Server started on PORT:${port}`));
