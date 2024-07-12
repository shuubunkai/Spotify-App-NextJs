import axios from "axios";

import { setCookie } from "cookies-next";
import API_URL from "@/configs/apiUrl";

// Register user
const register = async (userData: any) => {
  try {
    const response = await axios.post(API_URL + "/auth/register", userData);

    const user = {
      username: response.data.username,
      token: response.data.token,
    };
    if (response.data) {
      setCookie("user", JSON.stringify(user), { maxAge: 60 * 60 * 24 * 30 });
    }

    return user;
  } catch (error: any) {
    if (error.response) {
      throw {
        status: error.request.status,
        success: error.response.data.success,
        message: error.response.data.message,
      };
    } else {
      throw error;
    }
  }
};
const login = async (userData: any) => {
  try {
    const response = await axios.post(API_URL + "/auth/login", userData,{headers:{
     "Access-Control-Allow-Origin": "*"
      
    }});

    const user = {
      username: response.data.username,
      token: response.data.token,
    };
    if (response.data) {
      setCookie("user", JSON.stringify(user), { maxAge: 60 * 60 * 24 * 30 });
    }
    return user;
  } catch (error: any) {
    if (error.response) {
      throw {
        status: error.request.status,
        success: error.response.data.success,
        message: error.response.data.message,
      };
    } else {
      throw error;
    }
  }
};

const authService = {
  register,
  login,
};

export default authService;
