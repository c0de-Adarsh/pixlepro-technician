import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Loader2 } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function AddAdditionalContactModal({
  isOpen,
  onClose,
  clientId,
  initialData = null,
  onSaved,
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [isBillingContact, setIsBillingContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.first_name || (initialData.name ? initialData.name.split(" ")[0] : ""));
      setLastName(initialData.last_name || (initialData.name ? initialData.name.split(" ").slice(1).join(" ") : ""));
      setPhone(initialData.phone || "");
      setSecondaryPhone(initialData.secondary_phone || "");
      setEmail(initialData.email || "");
      setRole(initialData.role || "");
      setAddress(initialData.address || "");
      setState(initialData.state || "");
      setCountry(initialData.country || "");
      setPostalCode(initialData.postal_code || "");
      setCity(initialData.city || "");
      setNote(initialData.note || "");
      setIsBillingContact(Boolean(initialData.is_billing_contact));
    } else {
      setFirstName("");
      setLastName("");
      setPhone("");
      setSecondaryPhone("");
      setEmail("");
      setRole("");
      setAddress("");
      setState("");
      setCountry("");
      setPostalCode("");
      setCity("");
      setNote("");
      setIsBillingContact(false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() && !lastName.trim()) {
      toast.error("Please enter contact name");
      return;
    }

    if (isBillingContact && !email.trim()) {
      toast.error("Email is required for billing contact");
      return;
    }

    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
      secondary_phone: secondaryPhone.trim(),
      email: email.trim(),
      role: role.trim(),
      address: address.trim(),
      state: state.trim(),
      country: country.trim(),
      postal_code: postalCode.trim(),
      city: city.trim(),
      note: note.trim(),
      is_billing_contact: isBillingContact,
    };

    try {
      setIsSubmitting(true);
      if (clientId) {
        if (initialData?._id) {
          await Api("PUT", `api/clients/${clientId}/contacts/${initialData._id}`, payload);
          toast.success("Contact updated successfully!");
        } else {
          await Api("POST", `api/clients/${clientId}/contacts`, payload);
          toast.success("Contact added successfully!");
        }
      }

      if (onSaved) onSaved(payload);
      onClose();
    } catch (err) {
      toast.error(err.message || "Error saving contact");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!clientId || !initialData?._id) return;
    try {
      setIsSubmitting(true);
      await Api("DELETE", `api/clients/${clientId}/contacts/${initialData._id}`);
      toast.success("Contact deleted successfully!");
      if (onSaved) onSaved(null);
      onClose();
    } catch (err) {
      toast.error(err.message || "Error deleting contact");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {initialData ? "Edit additional contact" : "Add additional contact"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Details</h4>

                <div className="space-y-3">
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">First Name</label>
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone number</label>
                    <input
                      type="text"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Secondary phone</label>
                    <input
                      type="text"
                      placeholder="Secondary phone"
                      value={secondaryPhone}
                      onChange={(e) => setSecondaryPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role</label>
                    <input
                      type="text"
                      placeholder="Role (e.g. user, manager)"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Additional (optional)</h4>

                <div className="space-y-3">
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Address</label>
                    <input
                      type="text"
                      placeholder="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">State</label>
                      <input
                        type="text"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Country</label>
                      <input
                        type="text"
                        placeholder="Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Postal code</label>
                      <input
                        type="text"
                        placeholder="Postal code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">City</label>
                      <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Note</label>
                    <input
                      type="text"
                      placeholder="Note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="billingContact"
                checked={isBillingContact}
                onChange={(e) => setIsBillingContact(e.target.checked)}
                className="accent-[#D31010] w-4 h-4 rounded cursor-pointer"
              />
              <label htmlFor="billingContact" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Set as billing contact (email required)
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              {initialData ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete contact</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
