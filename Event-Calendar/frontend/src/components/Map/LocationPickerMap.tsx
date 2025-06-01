import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMapEvent } from "react-leaflet";

export interface LocationPickerMapProps {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
  address: string;
  setAddress: (address: string) => void;
}

/**
 * LocationPickerMap component
 *
 * A reusable Leaflet map component that allows users to:
 * - Select a location by clicking on the map (reverse geocoding)
 * - Enter an address manually (forward geocoding via Enter key)
 *
 * Integrates with OpenStreetMap's Nominatim API for geocoding.
 *
 * Props:
 * @param {[number, number] | null} position - Current coordinates to show a marker on the map
 * @param {(pos: [number, number]) => void} setPosition - Callback to update coordinates
 * @param {string} address - Current address value (bound to input)
 * @param {(address: string) => void} setAddress - Callback to update address text
 *
 * Features:
 * - On map click: gets lat/lng, reverse geocodes to address
 * - On mount: if address is present but no position, forward geocodes it
 * - If position is present but no address, reverse geocodes it
 * - On Enter in input: forward geocodes typed address and updates map
 *
 * Requirements:
 * - Leaflet CSS must be globally included
 * - CORS issues may occur with Nominatim on high volume usage
 *
 * Example usage:
 * ```tsx
 * <LocationPickerMap
 *   position={position}
 *   setPosition={setPosition}
 *   address={address}
 *   setAddress={setAddress}
 * />
 * ```
 */
export default function LocationPickerMap({
  position,
  setPosition,
  address,
  setAddress,
}: LocationPickerMapProps) {
  function LocationMarker() {
    useMapEvent("click", async (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        setAddress(data?.display_name || "Unknown location");
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
        setAddress("Failed to get address");
      }
    });

    return position ? <Marker position={position} /> : null;
  }

  useEffect(() => {
    if (!position && address) {
      // Try to forward geocode the saved address
      fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}`
      )
        .then((res) => res.json())
        .then((results) => {
          if (results && results.length > 0) {
            const { lat, lon } = results[0];
            setPosition([parseFloat(lat), parseFloat(lon)]);
          }
        })
        .catch((err) => {
          console.error("Forward geocoding failed on mount:", err);
        });
    } else if (position) {
      // Reverse geocode on mount if position is already set
      setAddress("Loading...");
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position[0]}&lon=${position[1]}`
      )
        .then((res) => res.json())
        .then((data) => {
          setAddress(data?.display_name || "Unknown location");
        })
        .catch((err) => {
          console.error("Initial reverse geocoding failed:", err);
          setAddress("Failed to get address");
        });
    }
  }, []);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && address.trim().length >= 5) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}`
        );
        const results = await res.json();
        if (results && results.length > 0) {
          const { lat, lon } = results[0];
          setPosition([parseFloat(lat), parseFloat(lon)]);
        }
      } catch (err) {
        console.error("Forward geocoding failed:", err);
      }
    }
  };

  return (
    <div className="space-y-2">
      <MapContainer
        center={position ?? [42.6977, 23.3219]}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
      <input
        type="text"
        value={address || ""}
        onChange={(e) => setAddress(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search or select an address"
        className="input-base w-full"
      />
    </div>
  );
}