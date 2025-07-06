import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

function LocationMarker({ position, onPositionChange }) {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onPositionChange({ lat, lng });
    },
  });

  return position ? (
    <Marker position={[position.lat, position.lng]} icon={markerIcon} />
  ) : null;
}

function LocationPicker({ onLocationChange, initialLocation = null }) {
  const [position, setPosition] = useState(initialLocation);
  const [center, setCenter] = useState([55.7558, 37.6176]);

  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation);
      setCenter([initialLocation.lat, initialLocation.lng]);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLocation = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setCenter([userLocation.lat, userLocation.lng]);
          },
          () => {
            console.log("Геолокация недоступна, используем Москву");
          }
        );
      }
    }
  }, [initialLocation]);

  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    onLocationChange(newPosition);
  };

  const handleSearchLocation = async (searchText) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchText
        )}&limit=1&countrycodes=ru`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPosition = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setPosition(newPosition);
        setCenter([newPosition.lat, newPosition.lng]);
        onLocationChange(newPosition);
      }
    } catch (error) {
      console.error("Ошибка поиска локации:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Поиск локации */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Поиск локации
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Введите адрес или название места..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearchLocation(e.target.value);
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const input = document.querySelector(
                'input[placeholder*="адрес"]'
              );
              if (input && input.value) {
                handleSearchLocation(input.value);
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Найти
          </button>
        </div>
      </div>

      {/* Карта */}
      <div className="border border-gray-300 rounded-md overflow-hidden">
        <MapContainer
          center={center}
          zoom={10}
          style={{ height: 300, width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker
            position={position}
            onPositionChange={handlePositionChange}
          />
        </MapContainer>
      </div>

      {/* Информация о выбранной локации */}
      {position && (
        <div className="p-3 bg-green-50 rounded-md">
          <p className="text-sm text-green-700">
            ✅ Выбрана локация: {position.lat.toFixed(4)},{" "}
            {position.lng.toFixed(4)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Кликните на карту, чтобы изменить позицию
          </p>
        </div>
      )}

      {/* Инструкции */}
      <div className="p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          💡 <strong>Как использовать:</strong>
        </p>
        <ul className="text-xs text-blue-600 mt-1 space-y-1">
          <li>• Введите адрес в поле поиска и нажмите "Найти"</li>
          <li>• Или кликните на карту, чтобы поставить маркер</li>
          <li>• Перетащите маркер для точной настройки</li>
        </ul>
      </div>
    </div>
  );
}

export default LocationPicker;
