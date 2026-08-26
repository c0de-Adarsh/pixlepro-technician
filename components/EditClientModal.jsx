import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Settings, Trash2, Loader2 } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function EditClientModal({ isOpen, onClose, clientData, onUpdated, onDelete }) {
  const router = useRouter();
  const nameParts = (clientData?.name || "").trim().split(" ");
  const [firstName, setFirstName] = useState(clientData?.first_name || nameParts[0] || "");
  const [lastName, setLastName] = useState(clientData?.last_name || nameParts.slice(1).join(" ") || "");
  const [companyName, setCompanyName] = useState(clientData?.company || clientData?.company_name || "");
  const [phone, setPhone] = useState(clientData?.phone || "");
  const [phoneExt, setPhoneExt] = useState(clientData?.phone_ext || "");
  const [secondaryPhone, setSecondaryPhone] = useState(clientData?.secondary_phone || "");
  const [secondaryExt, setSecondaryExt] = useState(clientData?.secondary_ext || "");
  const [email, setEmail] = useState(clientData?.email || "");
  const [description, setDescription] = useState(clientData?.description || "");
  const [paymentTerms, setPaymentTerms] = useState(clientData?.payment_terms || "Use default (use account value)");
  const [allowBilling, setAllowBilling] = useState(Boolean(clientData?.allow_billing));
  const [taxExempt, setTaxExempt] = useState(Boolean(clientData?.tax_exempt));
  const [adSource, setAdSource] = useState(clientData?.adSource || clientData?.ad_source || "Google");
  const [parentClient, setParentClient] = useState(clientData?.parent_client || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        description,
        payment_terms: paymentTerms,
        allow_billing: allowBilling,
        tax_exempt: taxExempt,
        ad_source: adSource,
        parent_client: parentClient,
      };

      const clientId = clientData?._id || clientData?.id;
      if (clientId) {
        const res = await Api("PUT", `api/clients/${clientId}`, payload, router);
        if (res && (res.success || res._id || res.data)) {
          toast.success("Client updated successfully!");
          if (onUpdated) onUpdated();
          onClose();
        } else {
          toast.error(res?.message || "Failed to update client");
        }
      } else {
        toast.success("Client updated successfully!");
        if (onUpdated) onUpdated();
        onClose();
      }
    } catch (err) {
      toast.error("Error updating client");
    } finally {
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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-4xl bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 max-h-[92vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Edit client info
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LEFT COLUMN */}
                <div className="space-y-4">
                  {/* Client details */}
                  <div className="space-y-3">
                    <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Client details
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 mb-1">
                          First Name
                        </span>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 mb-1">
                          Last Name
                        </span>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Company name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Contact information */}
                  <div className="space-y-3 pt-2">
                    <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Contact information
                    </span>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="ext."
                        value={phoneExt}
                        onChange={(e) => setPhoneExt(e.target.value)}
                        className="w-20 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Secondary phone"
                        value={secondaryPhone}
                        onChange={(e) => setSecondaryPhone(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="ext."
                        value={secondaryExt}
                        onChange={(e) => setSecondaryExt(e.target.value)}
                        className="w-20 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 pt-2">
                    <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Description
                    </span>
                    <textarea
                      rows={3}
                      placeholder="Add the most important information about your client that will be displayed on the page"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-4">
                  {/* Payment */}
                  <div className="space-y-3">
                    <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Payment
                    </span>

                    <div className="relative">
                      <select
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
                      >
                        <option value="Use default (use account value)">
                          Use default (use account value)
                        </option>
                        <option value="Net 15">Net 15</option>
                        <option value="Net 30">Net 30</option>
                        <option value="Due on Receipt">Due on Receipt</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Allow billing
                      </span>
                      <button
                        type="button"
                        onClick={() => setAllowBilling(!allowBilling)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          allowBilling ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            allowBilling ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Tax exempt
                      </span>
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
                    </div>

                    <div className="pt-1">
                      <a
                        href="#"
                        className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1.5"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Auto-invoicing settings</span>
                      </a>
                    </div>
                  </div>

                  {/* Additional */}
                  <div className="space-y-3 pt-2">
                    <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Additional
                    </span>

                    <div className="relative">
                      <select
                        value={adSource}
                        onChange={(e) => setAdSource(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
                      >
                        <option value="Google">Google</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Organic Referral">Organic Referral</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Set a parent client"
                        value={parentClient}
                        onChange={(e) => setParentClient(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                      />
                    </div>

                    <p className="text-[11px] text-slate-500">
                      <a href="#" className="text-[#2563EB] dark:text-blue-400 hover:underline">
                        Learn about parent client
                      </a>
                    </p>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={onDelete}
                        className="text-xs font-bold text-[#D31010] hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-[#D31010]" />
                        <span>Delete client</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer (Solid Red #D31010 Save Button) */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
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
