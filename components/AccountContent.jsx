import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  Building2,
  Save,
  Check,
  ChevronDown,
  Globe,
  Mail,
  Phone,
  Clock,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";

export default function AccountContent() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Form State initialized with user's exact details
  const [accountName, setAccountName] = useState("Pixl canada ltd");
  const [companyDescription, setCompanyDescription] = useState("Professional Field Service & IT Solutions in Canada");
  const [firstName, setFirstName] = useState("PIXL");
  const [lastName, setLastName] = useState("CANADA");
  const [businessAddress, setBusinessAddress] = useState("Edmonton Canada");
  const [city, setCity] = useState("Edmonton");
  const [zip, setZip] = useState("T6L1T9");
  const [country, setCountry] = useState("Canada");
  const [region, setRegion] = useState("Alberta");
  const [companyWebsite, setCompanyWebsite] = useState("https://pixlcanada.ca");
  const [companyEmail, setCompanyEmail] = useState("info@pixlcanada.ca");
  const [companyPhone, setCompanyPhone] = useState("8254615020");
  const [emailSentAs, setEmailSentAs] = useState("Pixl canada ltd");
  const [emailSentFrom, setEmailSentFrom] = useState("Info@Pixlcanada.ca");

  // Account Preferences State
  const [displayReports, setDisplayReports] = useState("By Time Closed");
  const [paymentTerms, setPaymentTerms] = useState("Due upon receipt (0 days)");
  const [dueDateFrom, setDueDateFrom] = useState("Job scheduled date");
  const [timeZone, setTimeZone] = useState("America/Edmonton (UTC-06:00)");
  const [accountRegion, setAccountRegion] = useState("Canada");
  const [unitOfMeasurement, setUnitOfMeasurement] = useState("Miles");

  // 8 Feature Toggle Switches State (Solid Brand Red #D31010)
  const [toggles, setToggles] = useState({
    updateJobEndTime: true,
    autoSearchClients: true,
    allowMultipleTechs: true,
    accumulateDueBalance: false,
    showSalesProposalTax: true,
    allowNegativeInventory: false,
    allowStandaloneEstimates: true,
    defaultAllowBilling: true,
  });

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Account settings updated successfully!");
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      {/* Breadcrumbs Navigation Bar */}
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap">
        SETTINGS # <span className="text-slate-800 dark:text-slate-200 font-bold">ACCOUNT</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300">
            <Building2 className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Account Settings
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your company information, email headers, and system preferences.
            </p>
          </div>
        </div>

        {/* Save Changes Action Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Company Information */}
        <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#D31010]" />
              <span>Company Information</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Your business details shown on invoices, jobs, and reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Account Name */}
            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Account Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
              />
            </div>

            {/* First Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
              />
            </div>

            {/* Business Address */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Business Address
              </label>
              <input
                type="text"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
              />
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
              />
            </div>

            {/* Zip */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Zip / Postal Code
              </label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
              />
            </div>

            {/* Region */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Region / State
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
              />
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Country
              </label>
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  <option value="Canada">Canada 🇨🇦</option>
                  <option value="United States">United States 🇺🇸</option>
                  <option value="United Kingdom">United Kingdom 🇬🇧</option>
                  <option value="Australia">Australia 🇦🇺</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Company Website */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Company Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                />
              </div>
            </div>

            {/* Company Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Company Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                />
              </div>
            </div>

            {/* Company Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Company Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                />
              </div>
            </div>

            {/* Company Description */}
            <div className="space-y-1.5 md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Company Description
              </label>
              <textarea
                rows={2}
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 resize-none"
              />
            </div>
          </div>

          {/* Email Settings Sub-Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Email Dispatch Headers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Email sent as */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email sent as
                </label>
                <input
                  type="text"
                  value={emailSentAs}
                  onChange={(e) => setEmailSentAs(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                />
                <p className="text-[11px] text-slate-400">
                  The &quot;from&quot; header on your sent emails
                </p>
              </div>

              {/* Email sent from */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email sent from
                </label>
                <input
                  type="email"
                  value={emailSentFrom}
                  onChange={(e) => setEmailSentFrom(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                />
                <p className="text-[11px] text-slate-400">
                  The &quot;reply to&quot; address on your emails. Emails sent to your system email will be forwarded here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Account Preferences */}
        <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D31010]" />
              <span>Account Preferences</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Regional formatting, payment terms, and reporting timeframes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Display reports */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Display reports
              </label>
              <div className="relative">
                <select
                  value={displayReports}
                  onChange={(e) => setDisplayReports(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  <option value="By Time Closed">By Time Closed</option>
                  <option value="By Job Date">By Job Date</option>
                  <option value="By Invoice Date">By Invoice Date</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Default Payment Terms */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Default Payment Terms
              </label>
              <div className="relative">
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  <option value="Due upon receipt (0 days)">Due upon receipt (0 days)</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Calculate due date from */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Calculate due date from
              </label>
              <div className="relative">
                <select
                  value={dueDateFrom}
                  onChange={(e) => setDueDateFrom(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  <option value="Job scheduled date">Job scheduled date</option>
                  <option value="Invoice creation date">Invoice creation date</option>
                  <option value="Job completion date">Job completion date</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Account Time Zone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Account Time Zone
              </label>
              <div className="relative">
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  <option value="America/Edmonton (UTC-06:00)">America/Edmonton (UTC-06:00)</option>
                  <option value="America/Vancouver (UTC-08:00)">America/Vancouver (UTC-08:00)</option>
                  <option value="America/Toronto (UTC-05:00)">America/Toronto (UTC-05:00)</option>
                  <option value="America/New_York (UTC-05:00)">America/New_York (UTC-05:00)</option>
                  <option value="America/Los_Angeles (UTC-08:00)">America/Los_Angeles (UTC-08:00)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Account Region */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Account Region
              </label>
              <div className="relative">
                <select
                  value={accountRegion}
                  onChange={(e) => setAccountRegion(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  <option value="Canada">Canada</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400">
                This option will affect the way your phones are formatted.
              </p>
            </div>

            {/* Unit Of Measurement (Radio Selector) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Unit Of Measurement
              </label>
              <div className="flex items-center gap-4 py-2">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="unit"
                    value="Miles"
                    checked={unitOfMeasurement === "Miles"}
                    onChange={(e) => setUnitOfMeasurement(e.target.value)}
                    className="accent-[#D31010] w-4 h-4"
                  />
                  <span>Miles</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="unit"
                    value="Kilometers"
                    checked={unitOfMeasurement === "Kilometers"}
                    onChange={(e) => setUnitOfMeasurement(e.target.value)}
                    className="accent-[#D31010] w-4 h-4"
                  />
                  <span>Kilometers</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                Choose how to show distance in the system
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: System Feature Toggles Grid */}
        <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D31010]" />
              <span>System & Workflow Controls</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enable or disable advanced field management rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Toggle 1 */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Update Job End Time
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Auto update the job end time on job done or canceled.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("updateJobEndTime")}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
                  toggles.updateJobEndTime ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    toggles.updateJobEndTime ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Auto Search Clients
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enable automatic client lookup suggestions when typing phone or name.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("autoSearchClients")}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
                  toggles.autoSearchClients ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    toggles.autoSearchClients ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Allow Multiple Techs
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Allow multiple techs to be assigned to one job.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("allowMultipleTechs")}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
                  toggles.allowMultipleTechs ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    toggles.allowMultipleTechs ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 4 */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Accumulate due balance from invoices only
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  A client&apos;s due balance is set by invoice-related balances.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("accumulateDueBalance")}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
                  toggles.accumulateDueBalance ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    toggles.accumulateDueBalance ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 5 */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Show sales proposal total price with tax
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  When this toggle is on, your clients will see sales proposal price after adding the tax amount.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("showSalesProposalTax")}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
                  toggles.showSalesProposalTax ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    toggles.showSalesProposalTax ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 6 */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Allow Negative Inventory Quantity
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Allow inventory items to have negative quantities.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("allowNegativeInventory")}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
                  toggles.allowNegativeInventory ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    toggles.allowNegativeInventory ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 7 */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Allow standalone estimates and invoices
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Decide if users can create standalone estimates and invoices that are not associated with a lead or job.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("allowStandaloneEstimates")}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
                  toggles.allowStandaloneEstimates ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    toggles.allowStandaloneEstimates ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 8 */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Default &quot;Allow Billing&quot; for new clients
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Set the default value for the &quot;Allow Billing&quot; field when creating new clients.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("defaultAllowBilling")}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
                  toggles.defaultAllowBilling ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    toggles.defaultAllowBilling ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
