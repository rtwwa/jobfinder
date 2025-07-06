import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      console.log("Checking auth with token:", localStorage.getItem("token"));
      const response = await axios.get("http://localhost:5000/api/auth/me", {
        timeout: 5000,
      });
      console.log("Auth check successful:", response.data);
      setUser(response.data);

      if (response.data.role === "jobseeker") {
        checkNewRelevantVacancies();
      }
    } catch (error) {
      console.error(
        "Auth check failed:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      }
    } finally {
      setLoading(false);
    }
  };

  const checkNewRelevantVacancies = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/vacancies/new-count"
      );
      const { newCount } = response.data;

      if (newCount > 0) {
        toast.success(`У вас ${newCount} новых релевантных вакансий!`, {
          duration: 5000,
          icon: "🎯",
        });

        await axios.post("http://localhost:5000/api/vacancies/mark-checked");
      }
    } catch (error) {
      console.error("Ошибка проверки новых вакансий:", error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      toast.success("Успешный вход!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка входа");
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        userData
      );
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      toast.success("Регистрация успешна!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка регистрации");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    toast.success("Вы вышли из системы");
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
