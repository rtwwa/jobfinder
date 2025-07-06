import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import NewVacanciesBadge from "./NewVacanciesBadge";
import InterestsModal from "./InterestsModal";
import { useState, useEffect } from "react";

function Layout() {
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);

  useEffect(() => {
    if (isInterestsModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isInterestsModalOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-red-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">
                  JobFinder
                </h1>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link
                  to="/vacancies"
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive("/vacancies")
                      ? "bg-red-600 text-white shadow-lg transform scale-105"
                      : "text-gray-600 hover:bg-red-50 hover:text-red-700 hover:shadow-md"
                  }`}
                >
                  <span className="flex items-center">
                    🔍 Вакансии
                    {user?.role === "jobseeker" && <NewVacanciesBadge />}
                  </span>
                </Link>
                {user?.role === "employer" && (
                  <>
                    <Link
                      to="/my-vacancies"
                      className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isActive("/my-vacancies")
                          ? "bg-red-600 text-white shadow-lg transform scale-105"
                          : "text-gray-600 hover:bg-red-50 hover:text-red-700 hover:shadow-md"
                      }`}
                    >
                      📋 Мои вакансии
                    </Link>
                    <Link
                      to="/create-vacancy"
                      className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isActive("/create-vacancy")
                          ? "bg-red-600 text-white shadow-lg transform scale-105"
                          : "text-gray-600 hover:bg-red-50 hover:text-red-700 hover:shadow-md"
                      }`}
                    >
                      ➕ Создать вакансию
                    </Link>
                  </>
                )}
                <Link
                  to="/chat"
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive("/chat")
                      ? "bg-red-600 text-white shadow-lg transform scale-105"
                      : "text-gray-600 hover:bg-red-50 hover:text-red-700 hover:shadow-md"
                  }`}
                >
                  💬 Сообщения
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                {user?.role === "jobseeker" && (
                  <button
                    onClick={() => setIsInterestsModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    ⚙️ Настройки интересов
                  </button>
                )}
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    👤 {user?.name}
                  </span>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                    {user?.role === "jobseeker" ? "Соискатель" : "Работодатель"}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                >
                  🚪 Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <InterestsModal
        isOpen={isInterestsModalOpen}
        onClose={() => setIsInterestsModalOpen(false)}
        onSave={(interests) => {
          if (user) {
            const updatedUser = { ...user, interests };
            updateUser(updatedUser);
          }
        }}
      />
    </div>
  );
}

export default Layout;
