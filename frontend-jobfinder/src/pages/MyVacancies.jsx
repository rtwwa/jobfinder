import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import EditVacancyModal from "../components/EditVacancyModal";

function MyVacancies() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVacancy, setEditingVacancy] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isEditModalOpen]);

  useEffect(() => {
    if (user?.role === "employer") {
      fetchMyVacancies();
    }
  }, [user]);

  const fetchMyVacancies = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/vacancies/my"
      );
      setVacancies(response.data);
    } catch (error) {
      toast.error("Ошибка загрузки вакансий");
    } finally {
      setLoading(false);
    }
  };

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

  const handleMessageApplicant = async (applicantId, vacancyId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/messages/conversations/create",
        {
          participantId: applicantId,
          vacancyId: vacancyId,
        }
      );

      navigate(`/chat/${response.data._id}`);
    } catch (error) {
      toast.error("Ошибка создания беседы");
    }
  };

  const handleEditVacancy = (vacancy) => {
    setEditingVacancy(vacancy);
    setIsEditModalOpen(true);
  };

  const handleDeleteVacancy = async (vacancyId) => {
    if (window.confirm("Вы уверены, что хотите удалить эту вакансию?")) {
      try {
        await axios.delete(`http://localhost:5000/api/vacancies/${vacancyId}`);
        toast.success("Вакансия успешно удалена");
        fetchMyVacancies();
      } catch (error) {
        toast.error("Ошибка удаления вакансии");
      }
    }
  };

  const handleUpdateVacancy = () => {
    fetchMyVacancies();
  };

  if (user?.role !== "employer") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">
          Эта страница доступна только работодателям
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Загрузка вакансий...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Мои вакансии
          </h1>
          <p className="text-sm text-gray-600">
            Управляйте своими вакансиями и просматривайте отклики
          </p>
        </div>
        <button
          onClick={() => navigate("/create-vacancy")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Создать вакансию
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vacancies.map((vacancy) => (
          <div
            key={vacancy._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {vacancy.title}
                </h3>
                <p className="text-sm text-gray-600 mb-1">{vacancy.company}</p>
                <p className="text-sm text-gray-500">📍 {vacancy.location}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-600">
                  {formatSalary(vacancy.salaryMin, vacancy.salaryMax)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getWorkFormat(vacancy.workFormat)}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {getSchedule(vacancy.schedule)}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 text-sm mb-3">
                {vacancy.description}
              </p>
            </div>

            {/* Секция откликов */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Отклики ({vacancy.applicants?.length || 0})
              </h4>

              {vacancy.applicants && vacancy.applicants.length > 0 ? (
                <div className="space-y-2">
                  {vacancy.applicants.map((applicant) => (
                    <div
                      key={applicant._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {applicant.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {applicant.email}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleMessageApplicant(applicant._id, vacancy._id)
                        }
                        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                      >
                        Написать
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Пока нет откликов на эту вакансию
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Создана: {new Date(vacancy.createdAt).toLocaleDateString()}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditVacancy(vacancy)}
                  className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDeleteVacancy(vacancy._id)}
                  className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {vacancies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">У вас пока нет вакансий</p>
          <button
            onClick={() => navigate("/create-vacancy")}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Создать вакансию
          </button>
        </div>
      )}

      {/* Модальное окно редактирования */}
      <EditVacancyModal
        vacancy={editingVacancy}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingVacancy(null);
        }}
        onUpdate={handleUpdateVacancy}
      />
    </div>
  );
}

export default MyVacancies;
