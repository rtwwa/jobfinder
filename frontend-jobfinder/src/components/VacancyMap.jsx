import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
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

function MapEvents({ onBoundsChange }) {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
    zoomend: (e) => {
      const map = e.target;
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
  });
  return null;
}

function MapCenterUpdater({ center }) {
  const map = useMap();

  if (center && center.lat && center.lng) {
    map.setView([center.lat, center.lng], map.getZoom());
  }

  return null;
}

function VacancyMap({ vacancies, onMarkerClick, onBoundsChange, center }) {
  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: 400, width: "100%" }}
      scrollWheelZoom={true}
      key="map-container"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapEvents onBoundsChange={onBoundsChange} />
      <MapCenterUpdater center={center} />
      {vacancies.map((vacancy) => (
        <Marker
          key={vacancy._id}
          position={[vacancy.lat, vacancy.lng]}
          icon={markerIcon}
        >
          <Popup>
            <div>
              <b>{vacancy.title}</b>
              <br />
              {vacancy.company}
              <br />
              <button
                className="text-indigo-600 hover:underline mt-2"
                onClick={() => onMarkerClick(vacancy._id)}
              >
                Подробнее
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default VacancyMap;
