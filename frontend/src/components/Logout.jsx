import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Logout() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth && typeof auth.logout === "function") {
      auth.logout();
    }
    navigate("/");
  }, [auth, navigate]);

  return null; // This component doesn't render anything
}
