// Load environment variables from a .env file into process.env (e.g., MONGODB_URI)
import 'dotenv/config';

// Import Mongoose, the ODM (Object Data Modeling) library for MongoDB and Node.js
import mongoose from 'mongoose';

// Define an async function to connect to MongoDB
const connectDB = async () => {

  // Event listener: when the connection is successfully established
  mongoose.connection.on('connected', () => console.log("Database Connected"));

  // Connect to MongoDB using the URI from the .env file + database name
  // ✅ Important: Use backticks and include the database name at the end of the URI
  await mongoose.connect(`${process.env.MONGODB_URI}/mern-auth`);  //dollar mat bhulna,async	Allows use of await, returns a Promiseawait	Waits for mongoose.connect() to finish
};

// Export the function so it can be used in server.js
export default connectDB;
