import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Maximize2,
  Plus,
  Minus,
  Navigation,
  ArrowLeft,
  Download,
  Home,
  Truck,
  Flag,
  MapPin,
  Clock,
  ChevronDown,
  Wrench,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import EditJobDrawer from "./EditJobDrawer";

let inMemoryMapCache = null;

export default function MapContent() {
  const router = useRouter();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  const [activeTab, setActiveTab] = useState("jobs");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLeads, setShowLeads] = useState(true);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isEditJobDrawerOpen, setIsEditJobDrawerOpen] = useState(false);

  const [jobs, setJobs] = useState(inMemoryMapCache?.jobs || []);
  const [techs, setTechs] = useState(inMemoryMapCache?.techs || []);

  const resolveCoordinates = (addrStr, idx = 0) => {
    const s = String(addrStr || "").toLowerCase();
    if (s.includes("edmonton") || s.includes("alberta")) {
      return { lat: 53.5461 + (idx % 6) * 0.015 - 0.03, lng: -113.4938 + (idx % 6) * 0.02 - 0.04 };
    }
    if (s.includes("toronto") || s.includes("ontario")) {
      return { lat: 43.6532 + (idx % 6) * 0.015 - 0.03, lng: -79.3832 + (idx % 6) * 0.02 - 0.04 };
    }
    if (s.includes("vancouver") || s.includes("bc")) {
      return { lat: 49.2827 + (idx % 6) * 0.015 - 0.03, lng: -123.1207 + (idx % 6) * 0.02 - 0.04 };
    }
    if (s.includes("new york") || s.includes("ny")) {
      return { lat: 40.7128 + (idx % 6) * 0.015 - 0.03, lng: -74.0060 + (idx % 6) * 0.02 - 0.04 };
    }
    return { lat: 26.8500 + (idx % 6) * 0.015 - 0.02, lng: 80.9500 + (idx % 6) * 0.02 - 0.03 };
  };

  useEffect(() => {
    let isMounted = true;

    const fetchMapData = async () => {
      try {
        let teamData = [];
        let eventsData = [];

        try {
          const mapRes = await Api("GET", "api/map/data", null, router);
          if (mapRes?.data?.events || mapRes?.data?.teams) {
            eventsData = mapRes.data.events || [];
            teamData = mapRes.data.teams || [];
          }
        } catch (e) {}

        if (eventsData.length === 0 && teamData.length === 0) {
          const [teamRes, eventsRes] = await Promise.all([
            Api("GET", "api/teams", null, router).catch(() => null),
            Api("GET", "api/events", null, router).catch(() => null),
          ]);
          teamData = teamRes?.data || (Array.isArray(teamRes) ? teamRes : []);
          eventsData = eventsRes?.data || (Array.isArray(eventsRes) ? eventsRes : []);
        }

        let mappedTechs = [];
        if (Array.isArray(teamData) && teamData.length > 0) {
          mappedTechs = teamData.map((t, idx) => ({
            id: t._id || t.id || String(idx + 1),
            name: t.name || `${t.first_name || ""} ${t.last_name || ""}`.trim() || "Tech Member",
            status: t.status || "Free",
            avatar: t.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            phone: t.phone || "",
            role: t.role || "tech",
            lat: 49.2827 + (idx * 0.05) - 0.1,
            lng: -123.1207 + (idx * 0.08) - 0.1,
          }));
          if (isMounted) setTechs(mappedTechs);
        }

        let mappedJobs = [];
        if (Array.isArray(eventsData) && eventsData.length > 0) {
          mappedJobs = eventsData.map((ev, idx) => {
            const addrObj = ev.address || {};
            const addrStr = typeof addrObj === "object"
              ? `${addrObj.street || ""} ${addrObj.unit || ""} ${addrObj.city || ""} ${addrObj.region || ""}`.trim()
              : (ev.address || "");
            const shortId = ev._id ? ev._id.slice(-4).toUpperCase() : String(idx + 800);
            const coords = resolveCoordinates(addrStr, idx);
            const badgeInitials = ev.client_name ? ev.client_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : (ev.assigned_tech ? ev.assigned_tech.slice(0, 2).toUpperCase() : "PT");
            return {
              id: ev._id || String(idx + 800),
              _id: ev._id || String(idx + 800),
              jobId: shortId,
              shortId,
              title: ev.title || `Job #${shortId}`,
              clientName: ev.client_name || "Client",
              companyName: ev.company_name || "",
              phone: ev.phone || "",
              email: ev.email || "",
              address: addrStr || ev.description || "Lucknow Main Street",
              badge: badgeInitials || "PT",
              status: ev.status || "Submitted",
              jobType: ev.job_type || "CAPTURE TV",
              serviceArea: ev.service_area || "Edmonton",
              total_amount: ev.total_amount || 0,
              balance_due: ev.total_amount || 0,
              notes: ev.description || "",
              startDate: ev.schedule?.start_date ? String(ev.schedule.start_date).split("T")[0] : "2026-08-20",
              startTime: ev.schedule?.start_time || "07:45 AM",
              endDate: ev.schedule?.end_date ? String(ev.schedule.end_date).split("T")[0] : "2026-08-20",
              endTime: ev.schedule?.end_time || "07:50 AM",
              isAllDay: ev.schedule?.is_all_day || false,
              assignedTechs: Array.isArray(ev.assigned_techs) && ev.assigned_techs.length > 0 ? ev.assigned_techs : (ev.assigned_tech ? [ev.assigned_tech] : ["PIXL TECHNICIAN"]),
              time: ev.schedule?.start_time ? `${ev.schedule.start_date ? new Date(ev.schedule.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Today"}, ${ev.schedule.start_time}` : "Unscheduled",
              tech: Array.isArray(ev.assigned_techs) && ev.assigned_techs.length > 0 ? ev.assigned_techs[0] : (ev.assigned_tech || "PIXL TECHNICIAN"),
              lat: coords.lat,
              lng: coords.lng,
            };
          });
          if (isMounted) setJobs(mappedJobs);
        }

        inMemoryMapCache = { jobs: mappedJobs, techs: mappedTechs };
      } catch (err) {}
    };

    fetchMapData();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Initialize Leaflet Map
  useEffect(() => {
    // Inject Leaflet CSS
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

      // Initialize map instance
      const map = window.L.map(mapContainerRef.current, {
        center: [49.2827, -123.1207],
        zoom: 7,
        zoomControl: false,
      });

      // Add Google Vector Tile Layer
      window.L.tileLayer("https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        subdomains: ["0", "1", "2", "3"],
        maxZoom: 20,
        attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>',
      }).addTo(map);

      // Render Job Markers (Initial Badges & Clustered Red Pin)
      const renderMarkers = () => {
        // Initial Badge Marker Helper
        const createBadgeIcon = (text, bg = "#FFFFFF", color = "#1E293B", border = "#94A3B8") =>
          window.L.divIcon({
            className: "leaflet-badge-pin",
            html: `
              <div style="
                width: 32px;
                height: 32px;
                background-color: ${bg};
                color: ${color};
                border: 2px solid ${border};
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 800;
                font-size: 13px;
                font-family: sans-serif;
              ">
                ${text}
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

        // 1. Badge T
        window.L.marker([49.6, -123.4], { icon: createBadgeIcon("T") }).addTo(map);

        // 2. Badge Y (Red Border)
        window.L.marker([49.3, -123.1], {
          icon: createBadgeIcon("Y", "#FFFFFF", "#D31010", "#D31010"),
        }).addTo(map);

        // 3. Badge P
        window.L.marker([49.1, -123.6], { icon: createBadgeIcon("P") }).addTo(map);

        // 4. Badge M
        window.L.marker([48.8, -122.3], { icon: createBadgeIcon("M") }).addTo(map);

        // 5. Red Clustered Jobs Marker Pin ("3 Jobs")
        const clusteredJobIcon = window.L.divIcon({
          className: "leaflet-clustered-pin",
          html: `
            <div style="
              background-color: #D31010;
              color: white;
              padding: 4px 10px;
              border-radius: 12px;
              box-shadow: 0 4px 14px rgba(211, 16, 16, 0.4);
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 11px;
              font-weight: 800;
              font-family: sans-serif;
              border: 2px solid white;
            ">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              <span>3 Jobs</span>
            </div>
          `,
          iconSize: [80, 30],
          iconAnchor: [40, 15],
        });
        window.L.marker([48.6, -122.2], { icon: clusteredJobIcon }).addTo(map);

        // Render Animated Polyline for Live Tracking Mode (Screenshot 2)
        if (activeTab === "tracking") {
          const latlngs = [
            [49.4, -123.8], // Home
            [49.3, -123.2], // Current Truck
            [49.1, -122.7], // Client Destination
          ];

          // Home Pin
          const homeIcon = window.L.divIcon({
            className: "leaflet-home-pin",
            html: `
              <div style="width: 32px; height: 32px; background: white; border: 2px solid #3B82F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });
          window.L.marker(latlngs[0], { icon: homeIcon }).addTo(map);

          // Live Truck En-Route Pin (Red Badge with moving label)
          const truckIcon = window.L.divIcon({
            className: "leaflet-truck-pin",
            html: `
              <div style="display: flex; flex-col; items-center; align-items: center;">
                <div style="background: white; border: 1px solid #E2E8F0; padding: 3px 8px; border-radius: 8px; font-size: 10px; font-weight: 800; color: #0F172A; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 4px; white-space: nowrap;">
                  David Miller <span style="color: #D31010; font-size: 9px;">MOVING - 45MPH</span>
                </div>
                <div style="width: 36px; height: 36px; background: #D31010; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(211,16,16,0.5);">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                </div>
              </div>
            `,
            iconSize: [120, 60],
            iconAnchor: [60, 55],
          });
          window.L.marker(latlngs[1], { icon: truckIcon }).addTo(map);

          // Client Flag Pin
          const flagIcon = window.L.divIcon({
            className: "leaflet-flag-pin",
            html: `
              <div style="display: flex; align-items: center; gap: 4px;">
                <div style="background: #0F172A; color: white; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; white-space: nowrap;">
                  Client: 940 Reunion Ave
                </div>
                <div style="width: 30px; height: 30px; background: white; border: 2px solid #0F172A; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F172A" stroke-width="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                </div>
              </div>
            `,
            iconSize: [180, 32],
            iconAnchor: [90, 16],
          });
          window.L.marker(latlngs[2], { icon: flagIcon }).addTo(map);

          // Animated Dotted Route Polyline
          window.L.polyline(latlngs, {
            color: "#3B82F6",
            weight: 4,
            dashArray: "8, 8",
            lineCap: "round",
          }).addTo(map);
        }
      };

      renderMarkers();
      mapInstanceRef.current = map;
      renderJobMarkersOnMap(map, jobs);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab]);

  const renderJobMarkersOnMap = (map, jobList) => {
    if (!window.L || !map) return;
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    if (!jobList || jobList.length === 0) return;

    const coordsGroup = [];
    jobList.forEach((job) => {
      const badgeText = job.badge || "PT";
      const icon = window.L.divIcon({
        className: "",
        html: `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            filter: drop-shadow(0 4px 10px rgba(0,0,0,0.25));
          ">
            <div style="
              width: 36px;
              height: 36px;
              background: #0F172A;
              color: #ffffff;
              border: 2.5px solid #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 900;
              font-size: 13px;
              font-family: system-ui, sans-serif;
            ">
              ${badgeText}
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 6px solid #0F172A;
              margin-top: -1px;
            "></div>
          </div>
        `,
        iconSize: [36, 42],
        iconAnchor: [18, 42],
      });

      const marker = window.L.marker([job.lat, job.lng], { icon }).addTo(map);
      marker.on("click", () => {
        setSelectedJobId(job.id);
        setSelectedJob(job);
        map.flyTo([job.lat, job.lng], 14, { animate: true, duration: 0.8 });
      });
      markersRef.current[job.id] = marker;
      coordsGroup.push([job.lat, job.lng]);
    });

    if (coordsGroup.length > 0) {
      if (coordsGroup.length === 1) {
        map.setView(coordsGroup[0], 13);
      } else {
        map.fitBounds(coordsGroup, { padding: [50, 50], maxZoom: 14 });
      }
    }
  };

  useEffect(() => {
    if (mapInstanceRef.current && jobs.length > 0) {
      renderJobMarkersOnMap(mapInstanceRef.current, jobs);
    }
  }, [jobs]);

  const handleJobCardClick = (job) => {
    setSelectedJobId(job.id);
    setSelectedJob(job);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([job.lat, job.lng], 14, { animate: true, duration: 1 });
    }
  };

  const handleTrackTech = (tech) => {
    setSelectedTech(tech);
    setActiveTab("tracking");
    toast.success(`Tracking live location of ${tech.name}...`);
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([26.85, 80.95], 11);
      toast.success("Map recentered");
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-slate-100 dark:bg-slate-900">
      {/* Full-Screen Interactive Map Canvas Background */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Job Detail Popup on Map (Workiz-style, matching screenshot 1) */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            key={selectedJob.id}
            initial={{ opacity: 0, scale: 0.93, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 8 }}
            className="absolute left-1/2 -translate-x-1/2 z-30 w-80 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
            style={{ top: "calc(50% - 160px)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D31010]" />
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">{selectedJob.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditJobDrawerOpen(true)}
                  className="text-slate-400 hover:text-[#D31010] cursor-pointer"
                  title="Edit Job"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/jobs/${selectedJob.id}`)}
                  className="text-slate-400 hover:text-[#D31010] cursor-pointer"
                  title="Open Full Page"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button type="button" onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="px-4 py-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                  <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {selectedJob.clientName} {selectedJob.companyName}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  selectedJob.status === "Submitted" || selectedJob.status === "Open"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                    : "bg-red-100 text-[#D31010] dark:bg-red-950/50"
                }`}>{selectedJob.status}</span>
              </div>
              {selectedJob.phone && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.1 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.07-1.07a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <a href={`tel:${selectedJob.phone}`} className="text-[#D31010] font-bold hover:underline">{selectedJob.phone}</a>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{selectedJob.time}</span>
              </div>
              {selectedJob.address && (
                <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{selectedJob.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
                <Wrench className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedJob.tech}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Top Controls Bar (Date Range Picker & Fullscreen) */}
      <div className="absolute top-4 right-4 sm:right-6 z-20 flex items-center gap-3">
        {/* Date Range Selector */}
        <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl text-xs font-bold text-slate-800 dark:text-slate-200">
          <select className="px-2.5 py-1 bg-transparent border-r border-slate-200 dark:border-slate-800 focus:outline-none cursor-pointer">
            <option>Week</option>
            <option>Day</option>
            <option>Month</option>
          </select>
          <div className="flex items-center gap-2 px-2">
            <button type="button" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
              &lt;
            </button>
            <span className="text-slate-900 dark:text-white">
              Sun, Aug 9, 2026 - Sat, Aug 15, 2026
            </span>
            <button type="button" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
              &gt;
            </button>
          </div>
          <button type="button" className="p-1.5 text-slate-400 hover:text-[#D31010]">
            <Calendar className="w-4 h-4" />
          </button>
        </div>

        {/* Fullscreen Map Button */}
        <button
          type="button"
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
          className="p-2.5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl text-slate-700 dark:text-slate-200 hover:text-[#D31010] cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Bottom-Right Zoom & Recenter Map Controls */}
      <div className="absolute bottom-6 right-4 sm:right-6 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2.5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-lg text-slate-700 dark:text-slate-200 hover:text-[#D31010] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2.5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-lg text-slate-700 dark:text-slate-200 hover:text-[#D31010] cursor-pointer"
        >
          <Minus className="w-4 h-4 stroke-[3]" />
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="p-2.5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-lg text-slate-700 dark:text-slate-200 hover:text-[#D31010] cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* FLOATING LEFT SIDE PANEL DRAWER */}
      <div className="absolute top-4 left-4 z-20 w-[92%] sm:w-96 bg-white/95 dark:bg-[#0E1E31]/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-6rem)]">
        {/* MODE A & B: Jobs / Techs Header & Search */}
        {activeTab !== "tracking" && (
          <div className="p-4 space-y-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs, leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
              />
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* View Mode Toggle Pills (Jobs vs Techs) */}
            <div className="p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl grid grid-cols-2 gap-1 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setActiveTab("jobs")}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === "jobs"
                    ? "bg-white dark:bg-[#0E1E31] text-[#D31010] shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Jobs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("techs")}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === "techs"
                    ? "bg-white dark:bg-[#0E1E31] text-[#D31010] shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Techs
              </button>
            </div>

            {/* Status Summary & Refresh Link */}
            <div className="flex items-center justify-between text-xs font-semibold pt-1">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Found 27 out of 267 open jobs
              </span>
              <button
                type="button"
                onClick={() => toast.success("Refreshed jobs & map markers")}
                className="text-slate-600 dark:text-slate-300 hover:text-[#D31010] flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Show Leads Toggle Switch */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Show leads
              </span>
              <button
                type="button"
                onClick={() => setShowLeads(!showLeads)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  showLeads ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    showLeads ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* TAB 1 CONTENT: Jobs List (Screenshots 1 & 4) */}
        {activeTab === "jobs" && (
          <div className="overflow-y-auto p-3 space-y-3 flex-1">
            {jobs.map((job) => {
              const isSelected = selectedJobId === job.id;
              return (
                <div
                  key={job.id}
                  onClick={() => handleJobCardClick(job)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-red-50/40 dark:bg-red-950/20 border-[#D31010] shadow-sm"
                      : "bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {job.title}
                    </h4>
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[11px] font-extrabold flex-shrink-0">
                      {job.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {job.address}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
                    <span
                      className={`px-2 py-0.5 rounded-md ${
                        job.status === "In progress"
                          ? "bg-red-100 dark:bg-red-950/60 text-[#D31010]"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {job.status}
                    </span>
                    <span className="text-slate-400">{job.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2 CONTENT: Techs List (Screenshot 3) */}
        {activeTab === "techs" && (
          <div className="overflow-y-auto p-3 space-y-2 flex-1">
            {techs.map((tech) => (
              <div
                key={tech.id}
                className="p-3 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={tech.avatar}
                    alt={tech.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {tech.name}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{tech.status}</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTrackTech(tech)}
                  className="px-3.5 py-1.5 text-xs font-bold text-[#D31010] border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                >
                  Track
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3 CONTENT: Live Technician Tracking View (Screenshot 2) */}
        {activeTab === "tracking" && selectedTech && (
          <div className="overflow-y-auto p-4 space-y-5 flex-1">
            {/* Back Button Header */}
            <div>
              <button
                type="button"
                onClick={() => setActiveTab("techs")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#D31010] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Techs</span>
              </button>
            </div>

            {/* Technician Profile Card */}
            <div className="flex items-center gap-3.5">
              <img
                src={selectedTech.avatar}
                alt={selectedTech.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#D31010]"
              />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {selectedTech.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active</span>
                </span>
              </div>
            </div>

            {/* Live Metrics Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-50/60 dark:bg-red-950/30 border border-red-200/80 dark:border-slate-800 rounded-2xl space-y-1">
                <span className="block text-[10px] font-bold uppercase text-slate-500">
                  LIVE ETA
                </span>
                <span className="text-sm font-black text-[#D31010]">8:45 AM</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
                <span className="block text-[10px] font-bold uppercase text-slate-500">
                  DISTANCE
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  12.4 mi
                </span>
              </div>
            </div>

            {/* Status Timeline Section (Screenshot 2) */}
            <div className="space-y-3 pt-1">
              <span className="block text-xs font-extrabold text-slate-900 dark:text-white">
                Status Timeline
              </span>

              <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 dark:border-slate-800 ml-3">
                {/* Point 1: Left Home */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-[#D31010] flex items-center justify-center border-2 border-white dark:border-slate-900">
                    <Home className="w-3 h-3" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Left Home
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">8:00 AM</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Shift started.</p>
                </div>

                {/* Point 2: En Route */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-[#D31010] flex items-center justify-center border-2 border-white dark:border-slate-900">
                    <Truck className="w-3 h-3" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      En Route
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">8:15 AM</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Heading to first job.</p>
                </div>

                {/* Point 3: Current Location (Highlighted Box) */}
                <div className="relative p-3 bg-red-50/60 dark:bg-red-950/40 border border-red-200/80 dark:border-slate-800 rounded-xl">
                  <div className="absolute -left-[27px] top-3.5 w-4 h-4 rounded-full bg-[#D31010] border-2 border-white dark:border-slate-900 animate-ping" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#D31010]">
                      Current Location
                    </span>
                    <span className="text-[10px] text-red-500 font-extrabold uppercase">Now</span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-bold mt-0.5">
                    Highway 41 South. 5 mins away.
                  </p>
                </div>

                {/* Point 4: Arrival */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center border-2 border-white dark:border-slate-900">
                    <Flag className="w-3 h-3" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Arrival
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">ETA 8:45 AM</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Client: 940 Reunion Ave</p>
                </div>
              </div>
            </div>

            {/* Trip Log Section (Screenshot 2) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Trip Log
                </span>
                <button
                  type="button"
                  onClick={() => toast.success("Trip log downloaded")}
                  className="text-slate-400 hover:text-[#D31010]"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/40">
                      <th className="py-2 px-3">TIME</th>
                      <th className="py-2 px-3">LOCATION/EVENT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                    <tr>
                      <td className="py-2 px-3 text-slate-500">8:00 AM</td>
                      <td className="py-2 px-3 text-slate-900 dark:text-white">Clock In - HQ</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-slate-500">8:15 AM</td>
                      <td className="py-2 px-3 text-slate-900 dark:text-white">Departed HQ</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-slate-500">8:30 AM</td>
                      <td className="py-2 px-3 text-slate-900 dark:text-white">
                        Waypoint - Hwy 41 Checkpoint
                      </td>
                    </tr>
                    <tr className="bg-red-50/50 dark:bg-red-950/20">
                      <td className="py-2 px-3 text-[#D31010] font-bold">8:40 AM</td>
                      <td className="py-2 px-3 text-[#D31010] font-bold">
                        • Current Update
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side Edit Job Drawer */}
      <EditJobDrawer
        isOpen={isEditJobDrawerOpen}
        onClose={() => setIsEditJobDrawerOpen(false)}
        job={selectedJob}
        onJobUpdated={() => {
          router.replace(router.asPath);
        }}
      />
    </div>
  );
}
