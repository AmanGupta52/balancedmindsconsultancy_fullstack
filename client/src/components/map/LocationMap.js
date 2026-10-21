import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SITE } from "../../config/site";

// A self-contained SVG pin: no image files needed (and avoids Leaflet's
// well-known broken default-marker-icon problem with bundlers).
const pin = L.divIcon({
  className: "map-pin",
  html: `<svg width="38" height="48" viewBox="0 0 38 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 0C8.5 0 0 8.4 0 18.8 0 32 19 48 19 48s19-16 19-29.2C38 8.4 29.5 0 19 0z" fill="#0f5c57"/>
    <circle cx="19" cy="18.5" r="7" fill="#fbf8f1"/></svg>`,
  iconSize: [38, 48],
  iconAnchor: [19, 48],
  popupAnchor: [0, -44],
});

export default function LocationMap() {
  return (
    <div className="map-box">
      <MapContainer center={SITE.coordinates} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={SITE.coordinates} icon={pin}>
          <Popup>
            <strong>{SITE.name}</strong>
            <br />
            {SITE.address[1]}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
