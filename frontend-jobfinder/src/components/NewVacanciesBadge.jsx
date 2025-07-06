import { useState, useEffect } from "react";
import axios from "axios";
import { useSocket } from "../contexts/SocketContext";

function NewVacanciesBadge() {
  const [newCount, setNewCount] = useState(0);
  const { newVacancy, clearNewVacancy } = useSocket();

  useEffect(() => {
    checkNewVacancies();
  }, []);

  useEffect(() => {
    if (newVacancy) {
      setNewCount((prev) => prev + 1);
      clearNewVacancy();
    }
  }, [newVacancy, clearNewVacancy]);

  const checkNewVacancies = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/vacancies/new-count"
      );
      setNewCount(response.data.newCount);
    } catch (error) {
      console.error("Ошибка проверки новых вакансий:", error);
    }
  };

  const markAsChecked = async () => {
    try {
      await axios.post("http://localhost:5000/api/vacancies/mark-checked");
      setNewCount(0);
    } catch (error) {
      console.error("Ошибка отметки проверки:", error);
    }
  };

  if (newCount === 0) {
    return null;
  }

  return (
    <div className="relative ml-2">
      <button
        onClick={markAsChecked}
        className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 animate-pulse"
        title={`${newCount} новых вакансий`}
      >
        {newCount > 99 ? "99+" : newCount}
      </button>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
    </div>
  );
}

export default NewVacanciesBadge;
