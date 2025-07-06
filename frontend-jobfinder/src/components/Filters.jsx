import { useState, useEffect, useRef } from "react";

function Filters({ onFilterChange, onLocationChange }) {
  const [filters, setFilters] = useState({
    salaryMin: "",
    salaryMax: "",
    workFormat: "",
    schedule: "",
    location: "",
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const locationTimeoutRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);

    if (name === "location" && value.trim()) {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }

      locationTimeoutRef.current = setTimeout(() => {
        geocodeLocation(value);
      }, 1000);
    }
  };

  const geocodeLocation = async (location) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          location
        )}&limit=1&countrycodes=ru`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        onLocationChange({ lat: parseFloat(lat), lng: parseFloat(lon) });
      }
    } catch (error) {
      console.error("Ошибка геокодирования:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      salaryMin: "",
      salaryMax: "",
      workFormat: "",
      schedule: "",
      location: "",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);

    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Очистить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Зарплата от
          </label>
          <input
            type="number"
            name="salaryMin"
            value={filters.salaryMin}
            onChange={handleChange}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Зарплата до
          </label>
          <input
            type="number"
            name="salaryMax"
            value={filters.salaryMax}
            onChange={handleChange}
            placeholder="100000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Формат работы
          </label>
          <select
            name="workFormat"
            value={filters.workFormat}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Все форматы</option>
            <option value="remote">Удаленно</option>
            <option value="office">В офисе</option>
            <option value="hybrid">Гибрид</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            График работы
          </label>
          <select
            name="schedule"
            value={filters.schedule}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Все графики</option>
            <option value="fulltime">Полная занятость</option>
            <option value="parttime">Частичная занятость</option>
            <option value="flexible">Гибкий график</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Локация
          </label>
          <div className="relative">
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleChange}
              placeholder="Москва, Казань, Санкт-Петербург..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {isGeocoding && (
              <div className="absolute right-3 top-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Filters;
