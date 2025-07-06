import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function InterestsModal({ isOpen, onClose, onSave }) {
  const [availableKeywords, setAvailableKeywords] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchKeywords();
      fetchCurrentInterests();
    }
  }, [isOpen]);

  const fetchKeywords = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/keywords"
      );
      setAvailableKeywords(response.data.keywords);
    } catch (error) {
      console.error("Ошибка загрузки ключевых слов:", error);
      toast.error("Ошибка загрузки ключевых слов");
    }
  };

  const fetchCurrentInterests = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/me");
      const currentInterests = response.data.interests || [];
      setSelectedInterests(currentInterests);
      console.log("Текущие интересы:", currentInterests);
    } catch (error) {
      console.error("Ошибка загрузки текущих интересов:", error);
      toast.error("Ошибка загрузки текущих интересов");
    }
  };

  const handleInterestToggle = (keyword) => {
    setSelectedInterests((prev) => {
      if (prev.includes(keyword)) {
        return prev.filter((k) => k !== keyword);
      } else {
        return [...prev, keyword];
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put("http://localhost:5000/api/auth/interests", {
        interests: selectedInterests,
      });
      toast.success("Интересы сохранены!");
      onSave(selectedInterests);
      onClose();
    } catch (error) {
      console.error("Ошибка сохранения интересов:", error);
      toast.error("Ошибка сохранения интересов");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    fetchCurrentInterests();
    toast.info("Интересы сброшены к текущим настройкам");
  };

  const filteredKeywords = availableKeywords.filter((keyword) =>
    keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center modal-overlay p-4 z-50">
      <div className="bg-gradient-to-br from-white via-gray-50 to-red-50 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden modal-content border border-red-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">
                ⚙️ Настройка интересов
              </h2>
              <p className="text-gray-600 mt-1">
                Персонализируйте свои уведомления
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-8">
            <p className="text-gray-600 mb-6 leading-relaxed">
              Выберите технологии и навыки, которые вас интересуют. Мы будем
              показывать уведомления только о релевантных вакансиях.
            </p>

            {/* Текущие интересы */}
            <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border-2 border-red-200 shadow-lg">
              <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center">
                🎯 Ваши текущие интересы
              </h3>
              {selectedInterests.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {selectedInterests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white text-red-700 border-2 border-red-300 shadow-md"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-red-600 italic font-medium">
                    У вас пока нет настроенных интересов
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Выберите интересующие технологии ниже
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Поиск ключевых слов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-lg font-bold text-gray-800">
                  Выбрано для сохранения:
                  <span className="ml-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                    {selectedInterests.length}
                  </span>
                </p>
              </div>
              {selectedInterests.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  {selectedInterests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                    >
                      {interest}
                      <button
                        onClick={() => handleInterestToggle(interest)}
                        className="ml-2 w-5 h-5 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-xl border border-gray-200">
            {filteredKeywords.map((keyword) => (
              <button
                key={keyword}
                onClick={() => handleInterestToggle(keyword)}
                className={`p-3 text-sm font-semibold rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                  selectedInterests.includes(keyword)
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600 shadow-lg"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700 shadow-md"
                }`}
              >
                {keyword}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
            >
              🔄 Сбросить
            </button>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
              >
                ❌ Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-bold hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? "💾 Сохранение..." : "✅ Сохранить"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterestsModal;
