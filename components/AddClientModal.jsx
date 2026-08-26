import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, ChevronDown, Search, Loader2, MapPin } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { countries } from "../constants/countries";
import { Api } from "../services/service";
import LeafletMap from "./LeafletMap";

export default function AddClientModal({ isOpen, onClose }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneExt, setPhoneExt] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [secondaryExt, setSecondaryExt] = useState("");
  const [email, setEmail] = useState("");
  const [adSource, setAdSource] = useState("");
  const [allowBilling, setAllowBilling] = useState(false);
  const [taxExempt, setTaxExempt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address Fields
  const [address, setAddress] = useState("");
  const [unit, setUnit] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Canada");

  // Map Coordinates State
  const [mapLat, setMapLat] = useState(49.2827);
  const [mapLng, setMapLng] = useState(-123.1207);

  // Address Autocomplete State
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressMenu, setShowAddressMenu] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Custom Country Dropdown State
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const popularLocations = [
    {
      label: "Kanpur, Uttar Pradesh, India",
      street: "Mall Road",
      city: "Kanpur",
      region: "Uttar Pradesh",
      postalCode: "208001",
      country: "India",
      lat: 26.4499,
      lng: 80.3319,
    },
    {
      label: "Lucknow, Uttar Pradesh, India",
      street: "Hazratganj Main Rd",
      city: "Lucknow",
      region: "Uttar Pradesh",
      postalCode: "226001",
      country: "India",
      lat: 26.8467,
      lng: 80.9462,
    },
    {
      label: "Lucknow Junction, Charbagh, Lucknow",
      street: "Charbagh Railway Station Rd",
      city: "Lucknow",
      region: "Uttar Pradesh",
      postalCode: "226004",
      country: "India",
      lat: 26.8322,
      lng: 80.9234,
    },
    {
      label: "Gomti Nagar, Lucknow, Uttar Pradesh",
      street: "Vibhuti Khand",
      city: "Lucknow",
      region: "Uttar Pradesh",
      postalCode: "226010",
      country: "India",
      lat: 26.85,
      lng: 80.9999,
    },
    {
      label: "Vancouver, BC, Canada",
      street: "Robson Street",
      city: "Vancouver",
      region: "British Columbia",
      postalCode: "V6B 1A1",
      country: "Canada",
      lat: 49.2827,
      lng: -123.1207,
    },
    {
      label: "Toronto, ON, Canada",
      street: "Yonge Street",
      city: "Toronto",
      region: "Ontario",
      postalCode: "M5H 2N2",
      country: "Canada",
      lat: 43.6532,
      lng: -79.3832,
    },
    {
      label: "New York, NY, United States",
      street: "5th Avenue",
      city: "New York",
      region: "New York",
      postalCode: "10001",
      country: "United States",
      lat: 40.7128,
      lng: -74.006,
    },
  ];

  const handleAddressChange = async (val) => {
    setAddress(val);
    if (!val || val.trim().length < 2) {
      setAddressSuggestions([]);
      setShowAddressMenu(false);
      return;
    }

    setShowAddressMenu(true);
    setIsSearchingAddress(true);

    const queryLower = val.toLowerCase().trim();
    const localMatches = popularLocations.filter((item) =>
      item.label.toLowerCase().includes(queryLower) ||
      item.city.toLowerCase().includes(queryLower) ||
      item.street.toLowerCase().includes(queryLower)
    );

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&limit=5`
      );
      const data = await res.json();

      const remoteMatches = Array.isArray(data)
        ? data.map((item) => {
            const addr = item.address || {};
            const streetName =
              addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || item.display_name.split(",")[0];
            const cityName = addr.city || addr.town || addr.village || addr.county || "";
            const regionName = addr.state || addr.region || "";
            const postCode = addr.postcode || "";
            const countryName = addr.country || "Canada";

            return {
              label: item.display_name,
              street: streetName,
              city: cityName,
              region: regionName,
              postalCode: postCode,
              country: countryName,
              lat: parseFloat(item.lat) || 49.2827,
              lng: parseFloat(item.lon) || -123.1207,
            };
          })
        : [];

      const combined = [...localMatches, ...remoteMatches];
      const unique = combined.filter(
        (v, i, a) => a.findIndex((t) => t.label === v.label) === i
      );

      setAddressSuggestions(unique);
    } catch {
      setAddressSuggestions(localMatches);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleSelectAddressItem = (item) => {
    setAddress(item.street || item.label.split(",")[0]);
    if (item.city) setCity(item.city);
    if (item.region) setRegion(item.region);
    if (item.postalCode) setPostalCode(item.postalCode);
    if (item.country) setCountry(item.country);
    if (item.lat && item.lng) {
      setMapLat(item.lat);
      setMapLng(item.lng);
    }
    setShowAddressMenu(false);
    toast.success("Address & Map location updated!");
  };

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return countries;
    return countries.filter((c) =>
      c.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  const handleClearAddress = () => {
    setAddress("");
    setUnit("");
    setCity("");
    setRegion("");
    setPostalCode("");
    setCountry("Canada");
    setShowAddressMenu(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        phone,
        phone_ext: phoneExt,
        secondary_phone: secondaryPhone,
        secondary_ext: secondaryExt,
        email,
        ad_source: adSource,
        allow_billing: allowBilling,
        tax_exempt: taxExempt,
        address: {
          street: address,
          unit,
          city,
          region,
          postal_code: postalCode,
          country,
        },
      };

      const res = await Api("POST", "api/clients", payload, router);
      if (res && (res.success || res._id || res.data)) {
        toast.success("New Client created successfully!");
        setFirstName("");
        setLastName("");
        setCompanyName("");
        setPhone("");
        setEmail("");
        handleClearAddress();
        onClose();
      } else {
        toast.error(res?.message || "Failed to create client");
      }
    } catch (err) {
      toast.error("Error creating client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 w-screen h-screen bg-white dark:bg-[#0E1E31] text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden"
        >
          {/* Fullscreen Modal Header */}
          <div className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#0E1E31]/80 backdrop-blur-md flex-shrink-0">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Add New Client
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Fullscreen Modal Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 flex flex-col justify-between">
            <div className="max-w-6xl mx-auto w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* LEFT BOX: Client Details */}
                <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/50 border border-red-200/70 dark:border-slate-800 rounded-2xl space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Client Details
                  </h4>

                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010]"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010]"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010]"
                    />
                  </div>

                  {/* Contact Information Section */}
                  <div className="space-y-2.5 pt-2">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Contact Information
                    </span>

                    {/* Phone + EXT */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010]"
                      />
                      <input
                        type="text"
                        placeholder="EXT"
                        value={phoneExt}
                        onChange={(e) => setPhoneExt(e.target.value)}
                        className="w-20 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none uppercase"
                      />
                    </div>

                    {/* Secondary Phone + EXT */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Secondary Phone"
                        value={secondaryPhone}
                        onChange={(e) => setSecondaryPhone(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010]"
                      />
                      <input
                        type="text"
                        placeholder="EXT"
                        value={secondaryExt}
                        onChange={(e) => setSecondaryExt(e.target.value)}
                        className="w-20 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none uppercase"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010]"
                      />
                    </div>
                  </div>

                  {/* Ad Source Section */}
                  <div className="space-y-1.5 pt-2">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Ad Source
                    </span>
                    <div className="relative">
                      <select
                        value={adSource}
                        onChange={(e) => setAdSource(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select Ad Source</option>
                        <option value="Google Ads">Google Ads</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Organic Referral">Organic Referral</option>
                        <option value="Direct Website">Direct Website</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Billing Preferences Toggles */}
                  <div className="space-y-3 pt-2">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Billing Preferences
                    </span>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Allow Billing
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAllowBilling(!allowBilling)}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                            allowBilling ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              allowBilling ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className="text-[11px] font-extrabold uppercase text-slate-400">
                          {allowBilling ? "YES" : "NO"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Tax Exempt
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTaxExempt(!taxExempt)}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                            taxExempt ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              taxExempt ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className="text-[11px] font-extrabold uppercase text-slate-400">
                          {taxExempt ? "YES" : "NO"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Need to track more fields?{" "}
                      <a href="#" className="text-[#D31010] font-bold hover:underline">
                        Create a custom field
                      </a>
                    </p>
                  </div>
                </div>

                {/* RIGHT BOX: Client Address */}
                <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/50 border border-red-200/70 dark:border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Client Address
                    </h4>

                    {/* Interactive Leaflet.js + OpenStreetMap Canvas */}
                    <div className="w-full h-44">
                      <LeafletMap
                        lat={mapLat}
                        lng={mapLng}
                        title="Client Location"
                      />
                    </div>

                    {/* Address & Unit */}
                    <div className="grid grid-cols-3 gap-2 relative">
                      <div className="col-span-2 relative">
                        <input
                          type="text"
                          placeholder="Address"
                          value={address}
                          onChange={(e) => handleAddressChange(e.target.value)}
                          onFocus={() => {
                            if (address.trim().length >= 2) setShowAddressMenu(true);
                          }}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010]"
                        />

                        <AnimatePresence>
                          {showAddressMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.98 }}
                              className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 max-h-60 overflow-y-auto space-y-1 text-xs"
                            >
                              {isSearchingAddress && addressSuggestions.length === 0 ? (
                                <div className="p-3 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin text-[#D31010]" />
                                  <span>Searching address...</span>
                                </div>
                              ) : addressSuggestions.length > 0 ? (
                                addressSuggestions.map((item, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectAddressItem(item)}
                                    className="w-full text-left p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-200 hover:text-[#D31010] dark:hover:text-red-400 transition-colors flex items-start gap-2.5 cursor-pointer group"
                                  >
                                    <MapPin className="w-4 h-4 text-[#D31010] flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-bold truncate text-slate-900 dark:text-white group-hover:text-[#D31010]">
                                        {item.street || item.label.split(",")[0]}
                                      </div>
                                      <div className="text-[11px] text-slate-400 dark:text-slate-400 truncate">
                                        {[item.city, item.region, item.postalCode, item.country].filter(Boolean).join(", ")}
                                      </div>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="p-3 text-center text-slate-400 font-semibold">
                                  No matching address found
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <input
                        type="text"
                        placeholder="Unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                      />
                    </div>

                    {/* City & Region */}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Region"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                      />
                    </div>

                    {/* Postal Code & 195+ World Countries Dropdown */}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                      />
                      {/* Custom Searchable Country Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryMenu(!showCountryMenu)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-left flex items-center justify-between cursor-pointer text-slate-900 dark:text-slate-100"
                        >
                          <span className="truncate">{country || "Select Country"}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              showCountryMenu ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {showCountryMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.95 }}
                              className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 max-h-56 overflow-y-auto space-y-1 text-xs"
                            >
                              <div className="relative sticky top-0 bg-white dark:bg-[#0E1E31] pt-1 pb-2 border-b border-slate-100 dark:border-slate-800 mb-1 z-10">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="Search country..."
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none text-slate-900 dark:text-slate-100"
                                />
                              </div>

                              {filteredCountries.length === 0 ? (
                                <div className="py-3 text-center text-slate-400 text-xs">
                                  No matching country found
                                </div>
                              ) : (
                                filteredCountries.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => {
                                      setCountry(c);
                                      setShowCountryMenu(false);
                                      setCountrySearch("");
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-colors flex items-center justify-between ${
                                      country === c
                                        ? "bg-red-50 dark:bg-red-950/50 text-[#D31010]"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                                    }`}
                                  >
                                    <span>{c}</span>
                                    {country === c && <span className="text-[10px] font-bold text-[#D31010]">✓</span>}
                                  </button>
                                ))
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleClearAddress}
                      className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="max-w-6xl mx-auto w-full pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
