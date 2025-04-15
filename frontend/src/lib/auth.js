import api from "../api";
import { ACCESS_TOKEN } from "../constants";

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });
    const token = response.data.accessToken;
    localStorage.setItem(ACCESS_TOKEN, token);
    return { success: true };
  } catch (error) {
    console.error("Błąd logowania:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Błąd logowania",
    };
  }
};
