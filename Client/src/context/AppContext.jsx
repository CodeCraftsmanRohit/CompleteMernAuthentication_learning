import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ✅ Create a custom axios instance with baseURL + withCredentials
  const axiosInstance = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
  });

  // Global states
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);

  // Check if user is authenticated
  const getAuthState = async () => {
    try {
      const { data } = await axiosInstance.get("/api/auth/is-auth");
      if (data.success) {
        setIsLoggedin(true);
        getUserData(); // Fetch user data after confirming auth
      } else {
        setIsLoggedin(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error?.response?.data?.message || error.message);
      setIsLoggedin(false);
      setUserData(null);
    }
  };

  // Fetch user data
  const getUserData = async () => {
    try {
      const { data } = await axiosInstance.get("/api/user/data");
      if (data.success) {
        setUserData(data.userData);
        console.log("✅ User data loaded:", data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("❌ Failed to load user data:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to fetch user data");
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
