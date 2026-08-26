import React, { useEffect, useRef } from "react";

export default function LeafletMap({ lat = 49.2827, lng = -123.1207, zoom = 13, title = "Client Location" }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Inject Leaflet CSS if not present
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Inject Leaflet JS if not present
    const loadLeaflet = () => {
      if (window.L && mapContainerRef.current) {
        initMap();
      } else if (!document.getElementById("leaflet-js")) {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => {
          if (mapContainerRef.current) initMap();
        };
        document.head.appendChild(script);
      }
    };

    const initMap = () => {
      if (!window.L || !mapContainerRef.current) return;

      // Clean up previous instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize Leaflet Map
      const map = window.L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: zoom,
        zoomControl: true,
      });

      // Add Google Maps Style Tile Layer
      window.L.tileLayer("https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        subdomains: ["0", "1", "2", "3"],
        maxZoom: 20,
        attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>',
      }).addTo(map);

      // Create Custom Google Red Teardrop Marker Pin
      const googleRedPin = window.L.divIcon({
        className: "custom-google-red-pin",
        html: `
          <div style="filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.4));">
            <svg width="32" height="40" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="#EA4335"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -36],
      });

      // Add Marker Pin
      window.L.marker([lat, lng], { icon: googleRedPin })
        .addTo(map)
        .bindPopup(`<b>${title}</b><br/>Client Address Pin`)
        .openPopup();

      mapInstanceRef.current = map;
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, zoom]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <div ref={mapContainerRef} className="w-full h-full min-h-[170px] z-0" />
      <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border border-slate-200/60 shadow-sm z-10 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#EA4335] animate-ping" />
        <span>Google Maps View</span>
      </div>
    </div>
  );
}
