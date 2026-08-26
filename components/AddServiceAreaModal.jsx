import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check, Search, Plus, Trash2, Loader2 } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

const COLOR_SWATCHES = [
  "#00FFC2", "#3B82F6", "#2563EB", "#1D4ED8", "#1E3A8A",
  "#15803D", "#16A34A", "#22C55E", "#84CC16", "#A3E635",
  "#CA8A04", "#EAB308", "#D97706", "#B45309", "#9A3412",
  "#C2410C", "#EA580C", "#F97316", "#EF4444", "#DC2626",
  "#991B1B", "#C084FC", "#A855F7", "#EC4899", "#E11D48",
  "#7857FF", "#1E293B", "#0F172A", "#000000", "#64748B",
];

export default function AddServiceAreaModal({ isOpen, onClose, onCreated }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [mileRadius, setMileRadius] = useState("5");
  const [selectedColor, setSelectedColor] = useState("#00FFC2");
  const [defaultTax, setDefaultTax] = useState("Use Default - LA");
  const [advancedSelect, setAdvancedSelect] = useState(true);
  const [locationSearch, setLocationSearch] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleRef = useRef(null);
  const polygonRef = useRef(null);
  const polygonPointsRef = useRef([]);
  const markersRef = useRef([]);

  const selectedColorRef = useRef(selectedColor);
  useEffect(() => {
    selectedColorRef.current = selectedColor;
  }, [selectedColor]);

  // Helper to create draggable vertex marker
  const createDraggableVertex = (map, latlng, index) => {
    if (!window.L || !map) return null;

    const customDotIcon = window.L.divIcon({
      className: "vertex-dot-marker",
      html: `<div class="dot-inner" style="width: 16px; height: 16px; border-radius: 50%; background-color: ${selectedColorRef.current}; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); cursor: grab;"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const marker = window.L.marker(latlng, {
      icon: customDotIcon,
      draggable: true,
    }).addTo(map);

    marker.on("drag", (e) => {
      const pos = [e.target.getLatLng().lat, e.target.getLatLng().lng];
      polygonPointsRef.current[index] = pos;
      if (polygonRef.current) {
        polygonRef.current.setLatLngs(polygonPointsRef.current);
      }
    });

    return marker;
  };

  // Initialize Leaflet Map when modal & advancedSelect are active
  useEffect(() => {
    if (!isOpen || !advancedSelect) return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

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

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Center around Texas / Central USA (Matching Screenshot 3)
      const map = window.L.map(mapContainerRef.current, {
        center: [32.7767, -96.7970],
        zoom: 6,
        zoomControl: true,
      });

      // Google Maps style tile layer
      window.L.tileLayer("https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        subdomains: ["0", "1", "2", "3"],
        maxZoom: 19,
      }).addTo(map);

      // Initial sample polygon matching screenshot (Dallas, Arkansas, Louisiana region)
      const initialPoints = [
        [34.500, -96.000],
        [34.800, -91.500],
        [31.800, -91.000],
        [31.200, -94.200],
      ];
      polygonPointsRef.current = initialPoints;

      // Draw initial polygon
      const poly = window.L.polygon(initialPoints, {
        color: selectedColor,
        fillColor: selectedColor,
        fillOpacity: 0.45,
        weight: 2,
      }).addTo(map);
      polygonRef.current = poly;

      // Add draggable circle markers for boundary vertex points
      const markers = initialPoints.map((pt, idx) => createDraggableVertex(map, pt, idx));
      markersRef.current = markers;

      // Click event handler ONLY active when isDrawing is true
      map.on("click", (e) => {
        if (!isDrawingRef.current) return;

        const newPt = [e.latlng.lat, e.latlng.lng];
        const newIdx = polygonPointsRef.current.length;
        polygonPointsRef.current.push(newPt);

        // Update polygon
        if (polygonRef.current) {
          polygonRef.current.setLatLngs(polygonPointsRef.current);
          polygonRef.current.setStyle({
            color: selectedColorRef.current,
            fillColor: selectedColorRef.current,
          });
        } else {
          polygonRef.current = window.L.polygon(polygonPointsRef.current, {
            color: selectedColorRef.current,
            fillColor: selectedColorRef.current,
            fillOpacity: 0.45,
            weight: 2,
          }).addTo(map);
        }

        // Add draggable marker
        const marker = createDraggableVertex(map, e.latlng, newIdx);
        if (marker) markersRef.current.push(marker);
      });

      mapInstanceRef.current = map;
    };

    const timer = setTimeout(loadLeaflet, 200);
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, advancedSelect]);

  // Update polygon & marker colors dynamically when selectedColor changes
  useEffect(() => {
    if (polygonRef.current) {
      polygonRef.current.setStyle({
        color: selectedColor,
        fillColor: selectedColor,
      });
    }
    // Update marker dot background colors dynamically
    const elements = document.querySelectorAll(".vertex-dot-marker .dot-inner");
    elements.forEach((el) => {
      el.style.backgroundColor = selectedColor;
    });
  }, [selectedColor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a service area name");
      return;
    }
    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      color: selectedColor,
      polygon: polygonPointsRef.current || [],
      zipCodes: zipcode ? [zipcode] : [],
      metro_zipcode: zipcode || "",
      radiusMiles: Number(mileRadius) || 5,
      default_tax: defaultTax,
      advanced_area_select: advancedSelect,
    };

    try {
      const res = await Api("POST", "api/service-areas", payload, router);
      const createdObj = res?.data || res || {};

      const newArea = {
        id: createdObj._id || createdObj.id || "sa_" + Date.now(),
        name: createdObj.name || name.trim(),
        zipcode: createdObj.metro_zipcode || zipcode || "90001",
        radius: createdObj.radiusMiles || mileRadius || "5",
        color: createdObj.color || selectedColor,
        enabled: createdObj.enabled || "Enabled",
        status: createdObj.status || "ON",
        polygon: createdObj.polygon || polygonPointsRef.current || [],
      };

      toast.success(`Service area "${newArea.name}" saved successfully!`);
      setIsSubmitting(false);
      setName("");
      if (onCreated) onCreated(newArea);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container (Wide Container Screenshots 2 & 3) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className={`relative w-full ${
              advancedSelect ? "max-w-6xl" : "max-w-xl"
            } bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col max-h-[92vh] transition-all duration-300`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Add New Service area
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Left Inputs + Right Map (Grid Layout) */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className={`grid grid-cols-1 ${advancedSelect ? "lg:grid-cols-12" : ""} gap-6`}>
                {/* Left Inputs Column */}
                <div className={`${advancedSelect ? "lg:col-span-5" : ""} space-y-4`}>
                  {/* Field 1: Name */}
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                  />

                  {/* Field 2: Metro Center Zipcode */}
                  <input
                    type="text"
                    placeholder="Metro center zipcode"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                  />

                  {/* Field 3: Mile Radius */}
                  <div className="space-y-1">
                    <span className="block text-[10px] font-extrabold uppercase text-slate-400 pl-1">
                      Mile Radius
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={mileRadius}
                      onChange={(e) => setMileRadius(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                    />
                  </div>

                  {/* Field 4: Choose Color (30 Swatches Grid) */}
                  <div className="space-y-2">
                    <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      Choose Color
                    </span>
                    <div className="grid grid-cols-10 gap-1.5 p-1">
                      {COLOR_SWATCHES.map((hex, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedColor(hex)}
                          style={{ backgroundColor: hex }}
                          className={`w-6 h-6 rounded flex items-center justify-center transition-transform cursor-pointer border ${
                            selectedColor === hex
                              ? "ring-2 ring-slate-900 dark:ring-white scale-110 z-10 border-white"
                              : "border-black/10 hover:scale-105"
                          }`}
                        >
                          {selectedColor === hex && (
                            <Check className="w-3.5 h-3.5 text-slate-900 drop-shadow-sm stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Field 5: Default Tax */}
                  <div className="space-y-1">
                    <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      Default Tax
                    </span>
                    <div className="relative">
                      <select
                        value={defaultTax}
                        onChange={(e) => setDefaultTax(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-extrabold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
                      >
                        <option value="Use Default - LA">Use Default - LA</option>
                        <option value="State Tax 8%">State Tax 8%</option>
                        <option value="No Tax">No Tax</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Field 6: Advanced Area Select Toggle (Solid Red #D31010) */}
                  <div className="space-y-1.5 pt-2">
                    <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      Advanced area select
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdvancedSelect(!advancedSelect)}
                      className={`px-3 py-1 rounded-md text-xs font-black transition-all cursor-pointer shadow-sm ${
                        advancedSelect
                          ? "bg-[#D31010] text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {advancedSelect ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>

                {/* Right Interactive Leaflet Map Column (Screenshot 3 Match) */}
                {advancedSelect && (
                  <div className="lg:col-span-7 flex flex-col space-y-3 min-h-[350px]">
                    {/* Top Map Controls Bar */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Enter a location"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              toast.success(`Searching for "${locationSearch}"...`);
                            }
                          }}
                          className="w-full pl-3 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsDrawing(!isDrawing);
                          toast.success(
                            isDrawing ? "Boundary drawing stopped" : "Click on map to drop boundary points!"
                          );
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isDrawing
                            ? "bg-emerald-600 text-white"
                            : "bg-[#D31010] hover:bg-[#b00d0d] text-white shadow-sm"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Draw Area</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (polygonRef.current && mapInstanceRef.current) {
                            mapInstanceRef.current.removeLayer(polygonRef.current);
                            polygonRef.current = null;
                          }
                          markersRef.current.forEach((m) => {
                            if (mapInstanceRef.current && m) {
                              mapInstanceRef.current.removeLayer(m);
                            }
                          });
                          markersRef.current = [];
                          polygonPointsRef.current = [];
                          toast.success("Shape cleared. Click on map to draw a new area!");
                        }}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear Shape</span>
                      </button>
                    </div>

                    {/* Leaflet Map Box Container */}
                    <div className="relative flex-1 w-full min-h-[320px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                      <div ref={mapContainerRef} className="w-full h-full min-h-[320px] z-0" />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer (Screenshots 2 & 3 Match) */}
              <div className="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
