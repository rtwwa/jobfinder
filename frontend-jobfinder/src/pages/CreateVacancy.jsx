import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import LocationPicker from "../components/LocationPicker";

function CreateVacancy() {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
    responsibilities: "",
    location: "",
    lat: null,
    lng: null,
    salaryMin: "",
    salaryMax: "",
    workFormat: "office",
    schedule: "fulltime",
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (locationData) => {
    const reverseGeocode = async (lat, lng) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ru`
        );
        const data = await response.json();
        if (data.display_name) {
          setFormData((prev) => ({
            ...prev,
            location: data.display_name.split(", ").slice(0, 3).join(", "),
            lat: lat,
            lng: lng,
          }));
        }
      } catch (error) {
        console.error("Ошибка обратного геокодирования:", error);
        setFormData((prev) => ({
          ...prev,
          location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          lat: lat,
          lng: lng,
        }));
      }
    };

    reverseGeocode(locationData.lat, locationData.lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.company || !formData.description) {
      toast.error("Заполните обязательные поля");
      return;
    }

    if (!formData.lat || !formData.lng) {
      toast.error("Выберите локацию на карте");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/vacancies", formData);
      toast.success("Вакансия успешно создана!");
      navigate("/my-vacancies");
    } catch (error) {
      console.error("Ошибка создания вакансии:", error);
      toast.error("Ошибка создания вакансии");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Создать вакансию
        </h1>
        <p className="text-sm text-gray-600">
          Заполните форму для создания новой вакансии
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Основная информация */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Основная информация
            </h3>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название вакансии *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Frontend Developer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Компания *
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Название компании"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Локация с картой */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Локация *
            </label>
            <LocationPicker onLocationChange={handleLocationChange} />
          </div>

          {/* Зарплата */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Зарплата</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              От (₽)
            </label>
            <input
              type="number"
              name="salaryMin"
              value={formData.salaryMin}
              onChange={handleChange}
              placeholder="50000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              До (₽)
            </label>
            <input
              type="number"
              name="salaryMax"
              value={formData.salaryMax}
              onChange={handleChange}
              placeholder="150000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Условия работы */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Условия работы
            </h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Формат работы
            </label>
            <select
              name="workFormat"
              value={formData.workFormat}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="office">В офисе</option>
              <option value="remote">Удаленно</option>
              <option value="hybrid">Гибрид</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              График работы
            </label>
            <select
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="fulltime">Полная занятость</option>
              <option value="parttime">Частичная занятость</option>
              <option value="flexible">Гибкий график</option>
            </select>
          </div>

          {/* Описание */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Описание вакансии
            </h3>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Подробное описание вакансии, обязанности, условия работы..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Требования
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows={3}
              placeholder="Опыт работы, навыки, образование..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Обязанности
            </label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              rows={3}
              placeholder="Что будет делать сотрудник..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Кнопки */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/my-vacancies")}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Создание..." : "Создать вакансию"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateVacancy;
