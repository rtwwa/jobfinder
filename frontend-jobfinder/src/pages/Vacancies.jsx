import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import VacancyCard from "../components/VacancyCard";
import Filters from "../components/Filters";
import VacancyMap from "../components/VacancyMap";

function Vacancies() {
  const [vacancies, setVacancies] = useState([]);
  const [filteredVacancies, setFilteredVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
      fetchVacanciesByBounds(null);
    }
  }, [userLocation]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setUserLocation({ lat: 55.75, lng: 37.61 });
        }
      );
    } else {
      setUserLocation({ lat: 55.75, lng: 37.61 });
    }
  };

  const fetchVacanciesByBounds = async (bounds) => {
    setLoading(true);
    try {
      let url = "http://localhost:5000/api/vacancies";
      if (bounds) {
        url += `?north=${bounds.north}&south=${bounds.south}&east=${bounds.east}&west=${bounds.west}`;
      }
      const response = await axios.get(url);
      setVacancies(response.data);
      setFilteredVacancies(response.data);
    } catch (error) {
      toast.error("Ошибка загрузки вакансий");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    let filtered = [...vacancies];
    if (filters.salaryMin) {
      filtered = filtered.filter(
        (v) => v.salaryMin >= parseInt(filters.salaryMin)
      );
    }
    if (filters.salaryMax) {
      filtered = filtered.filter(
        (v) => v.salaryMax <= parseInt(filters.salaryMax)
      );
    }
    if (filters.workFormat) {
      filtered = filtered.filter((v) => v.workFormat === filters.workFormat);
    }
    if (filters.schedule) {
      filtered = filtered.filter((v) => v.schedule === filters.schedule);
    }
    if (filters.location) {
      filtered = filtered.filter((v) =>
        v.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    setFilteredVacancies(filtered);
  };

  const handleApply = async (vacancyId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/vacancies/${vacancyId}/apply`
      );
      toast.success("Отклик отправлен!");
    } catch (error) {
      toast.error("Ошибка отправки отклика");
    }
  };

  const handleMessage = async (employerId, vacancyId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/messages/conversations/create",
        {
          participantId: employerId,
          vacancyId: vacancyId,
        }
      );

      navigate(`/chat/${response.data._id}`);
    } catch (error) {
      toast.error("Ошибка создания беседы");
    }
  };

  const handleMarkerClick = (vacancyId) => {
    const el = document.getElementById(`vacancy-${vacancyId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleBoundsChange = useCallback((bounds) => {
    setMapBounds(bounds);
  }, []);

  const handleLocationChange = useCallback((newLocation) => {
    setMapCenter(newLocation);
  }, []);

  if (loading || !userLocation) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Загрузка вакансий...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Поиск вакансий
        </h1>
        <p className="text-sm text-gray-600">
          Вакансии в выбранной области карты
        </p>
      </div>

      <VacancyMap
        vacancies={filteredVacancies}
        onMarkerClick={handleMarkerClick}
        onBoundsChange={handleBoundsChange}
        center={
          mapCenter
            ? [mapCenter.lat, mapCenter.lng]
            : [userLocation.lat, userLocation.lng]
        }
      />

      <Filters
        onFilterChange={handleFilterChange}
        onLocationChange={handleLocationChange}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVacancies.map((vacancy) => (
          <div key={vacancy._id} id={`vacancy-${vacancy._id}`}>
            <VacancyCard
              vacancy={vacancy}
              onApply={handleApply}
              onMessage={handleMessage}
            />
          </div>
        ))}
      </div>

      {filteredVacancies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Вакансии не найдены</p>
        </div>
      )}
    </div>
  );
}

export default Vacancies;
