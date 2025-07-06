import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

function VacancyCard({ vacancy, onApply, onMessage }) {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  const formatSalary = (min, max) => {
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} ₽`;
    } else if (min) {
      return `от ${min.toLocaleString()} ₽`;
    } else if (max) {
      return `до ${max.toLocaleString()} ₽`;
    }
    return "По договоренности";
  };

  const getWorkFormat = (format) => {
    switch (format) {
      case "remote":
        return "Удаленно";
      case "office":
        return "В офисе";
      case "hybrid":
        return "Гибрид";
      default:
        return format;
    }
  };

  const getSchedule = (schedule) => {
    switch (schedule) {
      case "fulltime":
        return "Полная занятость";
      case "parttime":
        return "Частичная занятость";
      case "flexible":
        return "Гибкий график";
      default:
        return schedule;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-gray-300 transform hover:scale-[1.02] h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-black text-gray-900 mb-2 line-clamp-2">
            {vacancy.title}
          </h3>
          <p className="text-base font-semibold text-gray-900 mb-1">
            🏢 {vacancy.company}
          </p>
          <p className="text-sm text-gray-700 flex items-center">
            📍 {vacancy.location}
          </p>
        </div>
        <div className="text-right ml-3">
          <p className="text-lg font-bold text-green-600">
            {formatSalary(vacancy.salaryMin, vacancy.salaryMax)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-white shadow-md">
          {getWorkFormat(vacancy.workFormat)}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-white shadow-md">
          {getSchedule(vacancy.schedule)}
        </span>
      </div>

      {showDetails && (
        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200 flex-1">
          <p className="text-gray-800 text-sm mb-3 leading-relaxed line-clamp-3">
            {vacancy.description}
          </p>
          <div className="text-sm text-gray-700 space-y-2">
            <div className="bg-white p-2 rounded-lg border-l-4 border-gray-400">
              <p className="font-semibold text-gray-900 text-xs">
                📋 Требования:
              </p>
              <p className="text-gray-800 text-xs line-clamp-2">
                {vacancy.requirements}
              </p>
            </div>
            <div className="bg-white p-2 rounded-lg border-l-4 border-gray-400">
              <p className="font-semibold text-gray-900 text-xs">
                🎯 Обязанности:
              </p>
              <p className="text-gray-800 text-xs line-clamp-2">
                {vacancy.responsibilities}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-auto">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-600 hover:text-gray-800 text-xs font-semibold hover:bg-gray-100 px-2 py-1 rounded-lg transition-all duration-200"
        >
          {showDetails ? "👁️ Скрыть" : "👁️ Подробнее"}
        </button>

        {user?.role === "jobseeker" && (
          <div className="flex space-x-2">
            <button
              onClick={() => onApply(vacancy._id)}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🚀 Откликнуться
            </button>
            <button
              onClick={() => onMessage(vacancy.employer._id, vacancy._id)}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-900 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              💬 Написать
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VacancyCard;
